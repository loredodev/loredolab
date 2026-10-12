// Configurações gerais, voz, metas, IA e backup
import { store } from './store.js'
import { $, h, icon, toast, confirmDialog, fill } from './ui.js'
import { LANGS } from './reader.js'
import { ReadAloud, speak } from './tts.js'

export class Settings {
    constructor(app) { this.app = app; this.root = $('#settings-view') }

    render(focus) {
        const s = store.settings
        const save = (k, v) => { s[k] = v; store.save('settings'); this.app.applyUITheme() }
        const field = (label, input, hint) => h('label.field', h('span', label), input, hint ? h('small.muted', hint) : null)
        const num = (k, min, max) => h('input.input', { type: 'number', min, max, value: s[k], onchange: e => save(k, Math.max(min, Math.min(max, Number(e.target.value) || min))) })
        const sel = (k, opts) => h('select.input', { onchange: e => save(k, e.target.value) }, opts.map(([v, l]) => h('option', { value: v, selected: s[k] === v }, l)))
        const check = (k, label) => h('label.switch', h('input', { type: 'checkbox', checked: !!s[k], onchange: e => save(k, e.target.checked) }), h('span.track'), h('span', label))
        const card = (id, title, ic, ...kids) => h(`section.set-card#set-${id}`, h('h3', icon(ic, 18), ' ', title), ...kids)

        const voices = ReadAloud.voices()
        const keyInput = h('input.input', { type: 'password', value: s.aiKey, placeholder: 'sk-ant-…', autocomplete: 'off', onchange: e => save('aiKey', e.target.value.trim()) })

        fill(this.root, 
            h('header.page-head', h('div', h('h1', 'Configurações'), h('p.muted', 'Aparência da leitura (fonte, tema, margens) fica no botão “Aa” dentro do leitor.'))),
            h('div.set-grid',
                card('ui', 'Interface', 'palette',
                    field('Tema do aplicativo', sel('uiTheme', [['escuro', 'Escuro (madeira)'], ['claro', 'Claro'], ['sistema', 'Seguir o sistema']]))),
                card('goals', 'Metas', 'target',
                    field('Meta diária de leitura (minutos)', num('dailyGoalMinutes', 5, 600)),
                    field('Meta de livros por ano', num('yearlyGoalBooks', 1, 500))),
                card('translate', 'Tradução e dicionário', 'translate',
                    field('Traduzir para', sel('targetLang', LANGS)),
                    field('Idioma padrão do dicionário', sel('dictLang', LANGS)),
                    field('Idioma da Wikipédia', sel('wikiLang', LANGS.filter(([c]) => !c.includes('-')))),
                    check('autoSaveVocab', 'Salvar automaticamente palavras traduzidas no vocabulário')),
                card('voice', 'Leitura em voz alta', 'volume',
                    field('Voz', h('select.input', { onchange: e => save('ttsVoice', e.target.value) },
                        h('option', { value: '' }, 'Automática (idioma do livro)'),
                        voices.map(v => h('option', { value: v.voiceURI, selected: s.ttsVoice === v.voiceURI }, `${v.name} (${v.lang})`))),
                        voices.length ? null : 'Nenhuma voz encontrada. No Windows, instale vozes em Configurações → Hora e idioma → Fala.'),
                    field(`Velocidade: ${s.ttsRate}×`, h('input', { type: 'range', min: 0.5, max: 2.5, step: 0.1, value: s.ttsRate, onchange: e => { save('ttsRate', Number(e.target.value)); this.render() } })),
                    field(`Tom: ${s.ttsPitch}`, h('input', { type: 'range', min: 0.5, max: 1.8, step: 0.1, value: s.ttsPitch, onchange: e => { save('ttsPitch', Number(e.target.value)); this.render() } })),
                    h('button.btn', { onclick: () => speak('Olá! Esta é a voz que vai ler seus livros.', 'pt-BR') }, icon('play', 16), ' Testar')),
                card('focus', 'Foco', 'timer',
                    field('Virar página automaticamente a cada (segundos)', num('autoTurnSeconds', 5, 600)),
                    field('Pomodoro — foco (minutos)', num('pomodoroMinutes', 5, 120)),
                    field('Pomodoro — pausa (minutos)', num('breakMinutes', 1, 60))),
                card('ai', 'Assistente de IA (Claude)', 'sparkles',
                    h('p.small', 'Opcional. Ativa resumos, explicações, quizzes, mapas mentais, flashcards automáticos e conversa sobre o livro.'),
                    field('Chave da API da Anthropic', keyInput, 'Crie em console.anthropic.com → API Keys. Fica salva apenas neste computador. O uso é cobrado pela Anthropic.'),
                    field('Modelo', sel('aiModel', [['claude-opus-5-5', 'Claude Opus 5.5 (recomendado)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (mais rápido)'], ['claude-haiku-5-5', 'Claude Haiku 5.5 (mais barato)']])),
                    field('Profundidade do raciocínio', sel('aiEffort', [['low', 'Rápida'], ['medium', 'Equilibrada'], ['high', 'Profunda']])),
                    h('div.row',
                        h('button.btn', {
                            onclick: async () => {
                                toast('Testando conexão…')
                                const { promise } = window.api.ai.chat({
                                    apiKey: s.aiKey, model: s.aiModel, effort: 'low',
                                    messages: [{ role: 'user', content: 'Responda apenas: OK' }],
                                })
                                const r = await promise
                                toast(r.error ? `Erro: ${r.error}` : 'Conexão funcionando ✔', { type: r.error ? 'error' : 'success', timeout: 5000 })
                            },
                        }, 'Testar conexão'),
                        h('button.link', { onclick: () => window.api.app.openExternal('https://console.anthropic.com/settings/keys') }, 'Obter chave ↗'))),
                card('data', 'Dados e backup', 'cloud',
                    h('p.small', 'O backup inclui biblioteca, anotações, cadernos, flashcards, vocabulário, estatísticas e preferências (não inclui os arquivos dos livros nem a chave da API).'),
                    h('div.row.wrap',
                        h('button.btn', { onclick: () => this.#backup() }, icon('download', 16), ' Fazer backup'),
                        h('button.btn', { onclick: () => this.#restore() }, icon('upload', 16), ' Restaurar backup'),
                        h('button.btn', { onclick: () => window.api.app.openDataFolder() }, icon('folder', 16), ' Abrir pasta de dados'))),
                card('about', 'Sobre', 'info',
                    h('p', h('strong', 'Leitor Loredo'), h('span#app-version.muted')),
                    h('p.small', 'Formatos: EPUB, PDF, MOBI, AZW, AZW3, KF8, PRC, FB2, FBZ, CBZ, CBR, DOCX, ODT, RTF, TXT, Markdown, HTML/XHTML.'),
                    h('p.small.muted', 'Livros com DRM (proteção da loja) não podem ser abertos por nenhum leitor de terceiros.'),
                    h('button.btn', { onclick: () => this.app.showShortcuts() }, icon('keyboard', 16), ' Atalhos de teclado'))))
        window.api.app.info().then(i => { const el = $('#app-version'); if (el) el.textContent = ` versão ${i.version}` })
        if (focus) setTimeout(() => $(`#set-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
        if (!voices.length) window.speechSynthesis?.addEventListener('voiceschanged', () => this.root.classList.contains('active') && this.render(), { once: true })
    }

    async #backup() {
        const books = store.library.books
        const bookData = {}
        for (const b of books) bookData[b.id] = await store.bookData(b.id)
        const settings = { ...store.settings, aiKey: '' }
        const payload = { app: 'leitor-loredo', version: 1, date: Date.now(), library: store.library, study: store.study, stats: store.stats, settings, bookData }
        const p = await window.api.file.saveText({
            defaultName: `leitor-backup-${new Date().toISOString().slice(0, 10)}.json`,
            content: JSON.stringify(payload), filters: [{ name: 'Backup JSON', extensions: ['json'] }],
        })
        if (p) toast('Backup salvo ✔')
    }

    async #restore() {
        const text = await window.api.file.openText({ filters: [{ name: 'Backup JSON', extensions: ['json'] }] })
        if (!text) return
        let data
        try { data = JSON.parse(text) } catch { return toast('Arquivo de backup inválido', { type: 'error' }) }
        if (data.app !== 'leitor-loredo') return toast('Este arquivo não é um backup do Leitor Loredo', { type: 'error' })
        if (!await confirmDialog('Restaurar backup', 'Os dados do backup serão mesclados com os atuais (anotações e cartões do backup substituem os do mesmo livro). Continuar?')) return
        const lib = store.library
        for (const b of data.library?.books ?? []) {
            const cur = store.book(b.id)
            if (cur) Object.assign(cur, { ...b, cover: cur.cover ?? b.cover })
            else lib.books.push({ ...b, missingFile: true })
        }
        lib.collections = [...new Set([...lib.collections, ...(data.library?.collections ?? [])])]
        const ids = new Set(store.study.cards.map(c => c.id))
        store.study.cards.push(...(data.study?.cards ?? []).filter(c => !ids.has(c.id)))
        const vids = new Set(store.study.vocab.map(v => v.id))
        store.study.vocab.push(...(data.study?.vocab ?? []).filter(v => !vids.has(v.id)))
        for (const [k, d] of Object.entries(data.stats?.days ?? {})) if (!store.stats.days[k] || store.stats.days[k].ms < d.ms) store.stats.days[k] = d
        const key = store.settings.aiKey
        Object.assign(store.settings, data.settings ?? {}, { aiKey: key })
        for (const [id, d] of Object.entries(data.bookData ?? {})) await window.api.store.set('book-' + id, d)
        for (const n of ['library', 'study', 'stats', 'settings']) store.save(n)
        toast('Backup restaurado ✔')
        this.app.applyUITheme()
        this.render()
    }
}
