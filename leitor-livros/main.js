// Leitor Loredo — processo principal do Electron
const { app, BrowserWindow, ipcMain, dialog, protocol, net, shell, Menu } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const fsp = require('node:fs/promises')
const crypto = require('node:crypto')
const { pathToFileURL } = require('node:url')

protocol.registerSchemesAsPrivileged([{
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
}])

const SUPPORTED = ['epub', 'pdf', 'mobi', 'azw', 'azw3', 'kf8', 'prc', 'fb2', 'fbz', 'zip',
    'cbz', 'cbr', 'txt', 'text', 'md', 'markdown', 'html', 'htm', 'xhtml', 'docx', 'odt', 'rtf']

// LEITOR_USER_DATA permite usar outra pasta de dados (ex.: modo portátil ou testes)
if (process.env.LEITOR_USER_DATA) app.setPath('userData', process.env.LEITOR_USER_DATA)

const userDir = () => app.getPath('userData')

// Aceleração de vídeo (configurável em Configurações → Desempenho; vale após reiniciar)
const gpuMode = (() => {
    try {
        return JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'data', 'settings.json'), 'utf8')).gpuMode ?? 'auto'
    } catch {
        return 'auto'
    }
})()
if (gpuMode === 'desligada') app.disableHardwareAcceleration()
else if (gpuMode === 'auto') {
    // muitos drivers de vídeo ficam na "lista de bloqueio" do Chromium e o app cai para
    // renderização por software (lenta). Aqui usamos a GPU mesmo assim.
    app.commandLine.appendSwitch('ignore-gpu-blocklist')
    app.commandLine.appendSwitch('enable-gpu-rasterization')
    app.commandLine.appendSwitch('enable-zero-copy')
}
const booksDir = () => path.join(userDir(), 'books')
const coversDir = () => path.join(userDir(), 'covers')
const dataDir = () => path.join(userDir(), 'data')

let win = null
const pendingFiles = []

const extOf = file => {
    const lower = file.toLowerCase()
    if (lower.endsWith('.fb2.zip')) return 'fbz'
    return path.extname(lower).slice(1)
}

const filesFromArgv = argv => argv.slice(1)
    .filter(a => !a.startsWith('-') && SUPPORTED.includes(extOf(a)) && fs.existsSync(a))

// ---------- protocolo app:// ----------
const safeJoin = (base, rel) => {
    const target = path.normalize(path.join(base, decodeURIComponent(rel)))
    if (!target.startsWith(base)) throw new Error('caminho inválido')
    return target
}

const registerProtocol = () => {
    protocol.handle('app', async request => {
        try {
            const url = new URL(request.url)
            const roots = { app: __dirname, books: booksDir(), covers: coversDir() }
            const root = roots[url.hostname]
            if (!root) return new Response('not found', { status: 404 })
            const file = safeJoin(root, url.pathname)
            const res = await net.fetch(pathToFileURL(file).toString())
            // módulos ES precisam do MIME correto
            if (file.endsWith('.mjs') || file.endsWith('.js'))
                return new Response(res.body, { headers: { 'content-type': 'text/javascript' } })
            return res
        } catch (e) {
            return new Response(String(e), { status: 404 })
        }
    })
}

// ---------- janela ----------
const createWindow = () => {
    win = new BrowserWindow({
        width: 1400, height: 900, minWidth: 900, minHeight: 600,
        title: 'Leitor Loredo',
        backgroundColor: '#1d1a17',
        icon: path.join(__dirname, 'build', 'icon.png'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            spellcheck: false,
        },
    })
    Menu.setApplicationMenu(null)
    win.loadURL('app://app/src/index.html')
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (/^https?:/i.test(url)) shell.openExternal(url)
        return { action: 'deny' }
    })
    win.webContents.on('will-navigate', (e, url) => {
        if (!url.startsWith('app://')) {
            e.preventDefault()
            if (/^https?:/i.test(url)) shell.openExternal(url)
        }
    })
    win.on('enter-full-screen', () => win.webContents.send('fullscreen', true))
    win.on('leave-full-screen', () => win.webContents.send('fullscreen', false))
    if (process.env.LEITOR_DEVTOOLS) win.webContents.openDevTools({ mode: 'detach' })
}

// ---------- armazenamento JSON ----------
const validName = name => /^[a-z0-9_-]{1,80}$/i.test(name)

ipcMain.handle('store:get', async (_, name) => {
    if (!validName(name)) throw new Error('nome inválido')
    try {
        return JSON.parse(await fsp.readFile(path.join(dataDir(), name + '.json'), 'utf8'))
    } catch {
        return null
    }
})

const writeQueue = new Map()
ipcMain.handle('store:set', async (_, name, data) => {
    if (!validName(name)) throw new Error('nome inválido')
    const file = path.join(dataDir(), name + '.json')
    // grava em sequência por arquivo, de forma atômica
    const prev = writeQueue.get(name) ?? Promise.resolve()
    const next = prev.catch(() => {}).then(async () => {
        const tmp = file + '.tmp'
        await fsp.writeFile(tmp, JSON.stringify(data))
        await fsp.rename(tmp, file)
    })
    writeQueue.set(name, next)
    await next
    return true
})

ipcMain.handle('store:delete', async (_, name) => {
    if (!validName(name)) throw new Error('nome inválido')
    await fsp.rm(path.join(dataDir(), name + '.json'), { force: true })
    return true
})

// ---------- livros ----------
const importPaths = async paths => {
    const out = []
    for (const p of paths) {
        const ext = extOf(p)
        if (!SUPPORTED.includes(ext)) {
            out.push({ error: `Formato não suportado: ${path.basename(p)}` })
            continue
        }
        const buf = await fsp.readFile(p)
        const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16)
        const fileName = `${hash}.${ext}`
        const dest = path.join(booksDir(), fileName)
        if (!fs.existsSync(dest)) await fsp.writeFile(dest, buf)
        out.push({
            id: hash, fileName, ext, size: buf.length,
            originalName: path.basename(p),
            originalPath: p,
        })
    }
    return out
}

ipcMain.handle('books:pick', async () => {
    const res = await dialog.showOpenDialog(win, {
        title: 'Adicionar livros',
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Livros', extensions: SUPPORTED },
            { name: 'Todos os arquivos', extensions: ['*'] },
        ],
    })
    if (res.canceled) return []
    return importPaths(res.filePaths)
})

ipcMain.handle('books:pickFolder', async () => {
    const res = await dialog.showOpenDialog(win, { title: 'Importar pasta', properties: ['openDirectory'] })
    if (res.canceled) return []
    const files = []
    const walk = async dir => {
        for (const ent of await fsp.readdir(dir, { withFileTypes: true })) {
            const full = path.join(dir, ent.name)
            if (ent.isDirectory()) await walk(full)
            else if (SUPPORTED.includes(extOf(full)) && extOf(full) !== 'zip') files.push(full)
        }
    }
    await walk(res.filePaths[0])
    return importPaths(files)
})

ipcMain.handle('books:import', (_, paths) => importPaths(paths.filter(p => typeof p === 'string')))

ipcMain.handle('books:remove', async (_, fileName, id) => {
    if (fileName) await fsp.rm(safeJoin(booksDir(), fileName), { force: true })
    if (id) for (const ext of ['jpg', 'png'])
        await fsp.rm(safeJoin(coversDir(), `${id}.${ext}`), { force: true })
    return true
})

ipcMain.handle('books:saveCover', async (_, id, data) => {
    const file = safeJoin(coversDir(), `${id}.jpg`)
    await fsp.writeFile(file, Buffer.from(data))
    return `app://covers/${id}.jpg?v=${Date.now()}`
})

ipcMain.handle('books:showInFolder', (_, fileName) => {
    shell.showItemInFolder(safeJoin(booksDir(), fileName))
})

ipcMain.handle('books:pending', () => pendingFiles.splice(0))

// CBR (quadrinhos em RAR)
ipcMain.handle('cbr:extract', async (_, fileName) => {
    const { createExtractorFromData } = require('node-unrar-js')
    const buf = await fsp.readFile(safeJoin(booksDir(), fileName))
    const data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const extractor = await createExtractorFromData({ data })
    const isImage = n => /\.(jpe?g|png|gif|webp|bmp|avif)$/i.test(n)
    const { files } = extractor.extract({ files: h => !h.flags.directory && isImage(h.name) })
    const out = []
    for (const f of files) if (f.extraction)
        out.push({ name: f.fileHeader.name, data: f.extraction })
    return out
})

// ---------- arquivos ----------
ipcMain.handle('file:saveText', async (_, { defaultName, content, filters }) => {
    const res = await dialog.showSaveDialog(win, { defaultPath: defaultName, filters })
    if (res.canceled || !res.filePath) return null
    await fsp.writeFile(res.filePath, content, 'utf8')
    return res.filePath
})

ipcMain.handle('file:openText', async (_, { filters }) => {
    const res = await dialog.showOpenDialog(win, { properties: ['openFile'], filters })
    if (res.canceled) return null
    return fsp.readFile(res.filePaths[0], 'utf8')
})

ipcMain.handle('app:toggleFullscreen', () => {
    win.setFullScreen(!win.isFullScreen())
    return win.isFullScreen()
})
ipcMain.handle('app:openExternal', (_, url) => {
    if (/^https?:/i.test(url)) shell.openExternal(url)
})
ipcMain.handle('app:info', () => ({
    version: app.getVersion(), dataPath: userDir(), platform: process.platform,
}))
ipcMain.handle('app:openDataFolder', () => shell.openPath(userDir()))
ipcMain.handle('app:gpuStatus', async () => ({
    mode: gpuMode,
    status: app.getGPUFeatureStatus(),
    info: await app.getGPUInfo('basic').catch(() => null),
}))
ipcMain.handle('app:relaunch', () => { app.relaunch(); app.exit(0) })

// ---------- tradução / dicionário / wikipedia ----------
const getJSON = async (url, opts) => {
    const res = await net.fetch(url, opts)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
}

ipcMain.handle('net:translate', async (_, { text, from = 'auto', to = 'pt' }) => {
    text = String(text).slice(0, 5000)
    try {
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd'
            + `&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&q=${encodeURIComponent(text)}`
        const data = await getJSON(url)
        const translation = (data[0] ?? []).map(x => x?.[0] ?? '').join('')
        const alternatives = (data[1] ?? []).map(([pos, terms]) => ({ pos, terms: terms.slice(0, 8) }))
        return { translation, detected: data[2], alternatives, provider: 'Google' }
    } catch (e1) {
        try {
            const src = from === 'auto' ? 'autodetect' : from
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}`
                + `&langpair=${encodeURIComponent(src)}|${encodeURIComponent(to)}`
            const data = await getJSON(url)
            return { translation: data.responseData?.translatedText ?? '', detected: null, alternatives: [], provider: 'MyMemory' }
        } catch (e2) {
            return { error: 'Sem conexão com o serviço de tradução. Verifique sua internet.' }
        }
    }
})

const stripTags = s => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()

ipcMain.handle('net:dictionary', async (_, { word, lang = 'en' }) => {
    word = String(word).trim().slice(0, 100)
    const results = []
    if (lang === 'en') {
        try {
            const data = await getJSON(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`)
            for (const entry of data) for (const m of entry.meanings ?? []) results.push({
                pos: m.partOfSpeech,
                phonetic: entry.phonetic,
                definitions: m.definitions.slice(0, 5).map(d => ({ text: d.definition, example: d.example })),
                synonyms: m.synonyms?.slice(0, 8) ?? [],
            })
            const audio = data.flatMap(e => e.phonetics ?? []).find(p => p.audio)?.audio
            if (results.length) return { results, audio, source: 'Free Dictionary' }
        } catch {}
    }
    try {
        const data = await getJSON(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`)
        const entries = data[lang] ?? data[Object.keys(data)[0]] ?? []
        for (const e of entries) results.push({
            pos: e.partOfSpeech,
            definitions: e.definitions.slice(0, 5).map(d => ({
                text: stripTags(d.definition),
                example: stripTags(d.examples?.[0] ?? d.parsedExamples?.[0]?.example ?? ''),
            })).filter(d => d.text),
        })
        if (results.length) return { results, source: 'Wiktionary' }
    } catch {}
    return { results: [], error: 'Nenhuma definição encontrada.' }
})

ipcMain.handle('net:wikipedia', async (_, { term, lang = 'pt' }) => {
    try {
        const data = await getJSON(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term.trim())}`)
        return {
            title: data.title, extract: data.extract,
            thumbnail: data.thumbnail?.source, url: data.content_urls?.desktop?.page,
        }
    } catch {
        return { error: 'Nada encontrado na Wikipédia.' }
    }
})

// ---------- Assistente de IA (Claude) ----------
let aiClient = null
let aiKey = null
const getClient = apiKey => {
    if (!apiKey) throw new Error('Configure sua chave da API da Anthropic em Configurações → Assistente de IA.')
    if (!aiClient || aiKey !== apiKey) {
        const mod = require('@anthropic-ai/sdk')
        const Anthropic = mod.Anthropic ?? mod.default
        aiClient = new Anthropic({ apiKey })
        aiKey = apiKey
    }
    return aiClient
}

const aiParams = ({ model, effort, system, messages, maxTokens }) => ({
    model: model || 'claude-opus-5-5',
    max_tokens: maxTokens ?? 16000,
    system,
    messages,
    output_config: { effort: effort || 'medium' },
    // se o modelo recusar, a API tenta automaticamente o modelo reserva recomendado
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
})

const describeAIError = e => {
    const mod = require('@anthropic-ai/sdk')
    const A = mod.Anthropic ?? mod.default
    if (e instanceof A.AuthenticationError) return 'Chave da API inválida. Verifique em Configurações.'
    if (e instanceof A.RateLimitError) return 'Limite de uso atingido. Tente novamente em instantes.'
    if (e instanceof A.APIConnectionError) return 'Sem conexão com a API. Verifique sua internet.'
    if (e instanceof A.APIError) return `Erro da API (${e.status}): ${e.message}`
    return e.message ?? String(e)
}

const aiStreams = new Map()

ipcMain.handle('ai:chat', async (event, { reqId, apiKey, ...opts }) => {
    try {
        const client = getClient(apiKey)
        const stream = client.beta.messages.stream(aiParams({ ...opts, maxTokens: 32000 }))
        aiStreams.set(reqId, stream)
        stream.on('text', delta => {
            if (!event.sender.isDestroyed()) event.sender.send('ai:chunk', { reqId, delta })
        })
        const msg = await stream.finalMessage()
        if (msg.stop_reason === 'refusal') return { error: 'O modelo recusou este pedido.' }
        const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('')
        return { text, truncated: msg.stop_reason === 'max_tokens' }
    } catch (e) {
        if (e?.name === 'APIUserAbortError') return { aborted: true }
        return { error: describeAIError(e) }
    } finally {
        aiStreams.delete(reqId)
    }
})

ipcMain.handle('ai:abort', (_, reqId) => {
    aiStreams.get(reqId)?.abort()
})

ipcMain.handle('ai:json', async (_, { apiKey, schema, ...opts }) => {
    try {
        const client = getClient(apiKey)
        const msg = await client.beta.messages.create({
            ...aiParams(opts),
            output_config: {
                effort: opts.effort || 'medium',
                format: { type: 'json_schema', schema },
            },
        })
        if (msg.stop_reason === 'refusal') return { error: 'O modelo recusou este pedido.' }
        const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('')
        return { data: JSON.parse(text) }
    } catch (e) {
        return { error: describeAIError(e) }
    }
})

// ---------- ciclo de vida ----------
if (!app.requestSingleInstanceLock()) {
    app.quit()
} else {
    app.on('second-instance', (_, argv) => {
        const files = filesFromArgv(argv)
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
            if (files.length) importPaths(files).then(list => win.webContents.send('open-files', list))
        }
    })
    app.on('open-file', (e, file) => { // macOS
        e.preventDefault()
        if (win) importPaths([file]).then(list => win.webContents.send('open-files', list))
        else pendingFiles.push(file)
    })

    app.whenReady().then(async () => {
        for (const d of [booksDir(), coversDir(), dataDir()]) await fsp.mkdir(d, { recursive: true })
        registerProtocol()
        const files = [...filesFromArgv(process.argv), ...pendingFiles.splice(0)]
        if (files.length) pendingFiles.push(...await importPaths(files))
        createWindow()
        app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
    })
    app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
}
