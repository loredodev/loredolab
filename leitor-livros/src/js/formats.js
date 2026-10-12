// Abre qualquer formato suportado e devolve um objeto "book" compatível com o foliate-js.
// EPUB, MOBI/AZW/AZW3, FB2/FBZ, CBZ e PDF usam os leitores do foliate-js.
// TXT, Markdown, HTML, DOCX, ODT, RTF e CBR são convertidos aqui.
import { makeBook } from '../foliate/view.js'

export const FORMAT_LABEL = {
    epub: 'EPUB', pdf: 'PDF', mobi: 'MOBI', azw: 'AZW', azw3: 'AZW3', kf8: 'KF8', prc: 'PRC',
    fb2: 'FB2', fbz: 'FBZ', zip: 'ZIP', cbz: 'CBZ', cbr: 'CBR', txt: 'TXT', text: 'TXT',
    md: 'MD', markdown: 'MD', html: 'HTML', htm: 'HTML', xhtml: 'XHTML', docx: 'DOCX', odt: 'ODT', rtf: 'RTF',
}

const MIME = {
    epub: 'application/epub+zip', pdf: 'application/pdf', cbz: 'application/vnd.comicbook+zip',
    fb2: 'application/x-fictionbook+xml', fbz: 'application/x-zip-compressed-fb2',
}

export const fetchBookFile = async rec => {
    const res = await fetch(`app://books/${rec.fileName}`)
    if (!res.ok) throw new Error('Arquivo do livro não encontrado. Ele pode ter sido removido.')
    const blob = await res.blob()
    const name = rec.ext === 'fbz' ? `${rec.id}.fb2.zip` : `${rec.id}.${rec.ext}`
    return new File([blob], name, { type: MIME[rec.ext] ?? '' })
}

export const openBook = async rec => {
    const file = await fetchBookFile(rec)
    const title = rec.originalName?.replace(/\.[^.]+$/, '') ?? 'Documento'
    switch (rec.ext) {
        case 'txt': case 'text':
            return makeTextBook(await decodeText(file), title)
        case 'md': case 'markdown': {
            const { marked } = await import('../../node_modules/marked/lib/marked.esm.js')
            return makeHTMLBook(marked.parse(await decodeText(file)), { title })
        }
        case 'html': case 'htm': case 'xhtml':
            return makeHTMLBook(await decodeText(file), { title, isFullDoc: true })
        case 'docx': {
            const mammoth = await loadMammoth()
            const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() })
            return makeHTMLBook(value, { title })
        }
        case 'odt':
            return makeHTMLBook(await odtToHTML(file), { title })
        case 'rtf':
            return makeHTMLBook(rtfToHTML(await file.text()), { title })
        case 'cbr':
            return makeImageBook(await window.api.books.extractCBR(rec.fileName), title)
        default: {
            const book = await makeBook(file)
            book.metadata ??= {}
            if (!book.metadata.title || book.metadata.title === file.name) book.metadata.title = title
            return book
        }
    }
}

// ---------- texto ----------
const decodeText = async file => {
    const buf = await file.arrayBuffer()
    const bytes = new Uint8Array(buf)
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(buf)
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(buf)
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(buf)
    } catch {
        return new TextDecoder('windows-1252').decode(buf)
    }
}

const escHTML = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

const HEADING_RE = /^\s*((cap[ií]tulo|chapter|parte|part|livro|book|pr[oó]logo|prologue|ep[ií]logo|epilogue|introdu[cç][aã]o|introduction|pref[aá]cio|preface)\b.{0,80}|[IVXLC]{1,7}\.?|\d{1,3}\.?)\s*$/i

const makeTextBook = (text, title) => {
    const lines = text.replace(/\r\n?/g, '\n').split('\n')
    const html = []
    let para = []
    const flush = () => {
        if (para.length) html.push(`<p>${escHTML(para.join(' ').trim())}</p>`)
        para = []
    }
    // textos com quebras simples por linha: cada linha vazia separa parágrafos;
    // se não houver linhas vazias, cada linha vira um parágrafo
    const hasBlank = lines.some(l => !l.trim())
    for (const line of lines) {
        const t = line.trim()
        if (!t) { flush(); continue }
        if (t.length < 90 && HEADING_RE.test(t)) {
            flush()
            html.push(`<h2>${escHTML(t)}</h2>`)
            continue
        }
        para.push(t)
        if (!hasBlank) flush()
    }
    flush()
    return makeHTMLBook(html.join('\n'), { title })
}

// ---------- livro a partir de HTML ----------
const SECTION_TARGET = 60000 // caracteres por seção quando não há títulos

const BASE_CSS = `
img, svg, video { max-width: 100%; height: auto; }
table { border-collapse: collapse; max-width: 100%; }
td, th { border: 1px solid rgba(128,128,128,.4); padding: .3em .5em; }
pre, code { white-space: pre-wrap; font-family: ui-monospace, Consolas, monospace; font-size: .9em; }
blockquote { margin-left: 1.5em; font-style: italic; }
h1, h2, h3 { line-height: 1.25; }
`

export const makeHTMLBook = (html, { title = 'Documento', author = '', isFullDoc = false } = {}) => {
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    for (const el of parsed.querySelectorAll('script, iframe, object, embed, link[rel="import"]')) el.remove()
    for (const el of parsed.querySelectorAll('*')) for (const a of Array.from(el.attributes))
        if (/^on/i.test(a.name)) el.removeAttribute(a.name)
    const docTitle = (isFullDoc && parsed.title?.trim()) || title
    const lang = parsed.documentElement.lang || ''
    const headStyles = Array.from(parsed.head.querySelectorAll('style'), s => s.outerHTML).join('')

    // divide o corpo em seções em cada h1/h2 de primeiro nível
    const nodes = Array.from(parsed.body.childNodes)
    const groups = []
    let current = []
    let size = 0
    const push = () => { if (current.length) groups.push(current); current = []; size = 0 }
    for (const n of nodes) {
        const isHeading = n.nodeType === 1 && /^H[12]$/.test(n.tagName)
        if (isHeading && size > 400) push()
        current.push(n)
        size += n.textContent?.length ?? 0
        if (size > SECTION_TARGET && !isHeading) push()
    }
    push()
    if (!groups.length) groups.push([parsed.createTextNode('')])

    const urls = []
    const sections = groups.map((group, index) => {
        const wrap = parsed.createElement('div')
        for (const n of group) wrap.append(n)
        const body = wrap.innerHTML
        const label = wrap.querySelector('h1, h2, h3')?.textContent.trim().replace(/\s+/g, ' ')
        const str = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><title>${escHTML(docTitle)}</title><style>${BASE_CSS}</style>${headStyles}</head><body>${body}</body></html>`
        let url
        return {
            id: index,
            label: label?.slice(0, 120),
            linear: 'yes',
            size: str.length,
            load: () => {
                if (!url) { url = URL.createObjectURL(new Blob([str], { type: 'text/html' })); urls.push(url) }
                return url
            },
            unload: () => {},
            createDocument: () => new DOMParser().parseFromString(str, 'text/html'),
        }
    })

    let partCount = 0
    const toc = sections.map((s, i) => ({ label: s.label || `Parte ${++partCount}`, href: String(i) }))
    // ids para links internos (#ancora)
    const idMap = new Map()
    sections.forEach((s, i) => {
        for (const el of s.createDocument().querySelectorAll('[id]')) idMap.set(el.id, i)
    })

    return {
        metadata: { title: docTitle, author, language: lang },
        dir: 'ltr',
        sections,
        toc,
        resolveHref: href => {
            const [a, b] = href.split('#')
            if (a && /^\d+$/.test(a)) return { index: Number(a), anchor: b ? doc => doc.getElementById(b) : undefined }
            if (b && idMap.has(b)) return { index: idMap.get(b), anchor: doc => doc.getElementById(b) }
            return { index: 0 }
        },
        splitTOCHref: href => [Number(href.split('#')[0]) || 0, null],
        getTOCFragment: doc => doc.body,
        isExternal: uri => /^\w+:/i.test(uri),
        destroy: () => urls.forEach(u => URL.revokeObjectURL(u)),
    }
}

// ---------- quadrinhos a partir de imagens (CBR) ----------
const makeImageBook = (images, title) => {
    const ext = n => n.split('.').pop().toLowerCase()
    const typeOf = n => ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', avif: 'image/avif' })[ext(n)]
    const files = images.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    if (!files.length) throw new Error('Nenhuma imagem encontrada no arquivo CBR.')
    const urls = new Map()
    const load = i => {
        if (urls.has(i)) return urls.get(i)[1]
        const img = URL.createObjectURL(new Blob([files[i].data], { type: typeOf(files[i].name) }))
        const page = URL.createObjectURL(new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0"><img src="${img}"></body></html>`], { type: 'text/html' }))
        urls.set(i, [img, page])
        return page
    }
    return {
        metadata: { title },
        rendition: { layout: 'pre-paginated' },
        sections: files.map((f, i) => ({ id: i, load: () => load(i), size: f.data.length })),
        toc: files.map((f, i) => ({ label: f.name.split('/').pop(), href: String(i) })),
        getCover: async () => new Blob([files[0].data], { type: typeOf(files[0].name) }),
        resolveHref: href => ({ index: Number(href) }),
        splitTOCHref: href => [Number(href), null],
        getTOCFragment: doc => doc.documentElement,
        destroy: () => { for (const arr of urls.values()) arr.forEach(u => URL.revokeObjectURL(u)) },
    }
}

// ---------- DOCX ----------
let mammothPromise
const loadMammoth = () => mammothPromise ??= new Promise((resolve, reject) => {
    if (window.mammoth) return resolve(window.mammoth)
    const s = document.createElement('script')
    s.src = 'app://app/node_modules/mammoth/mammoth.browser.min.js'
    s.onload = () => resolve(window.mammoth)
    s.onerror = () => reject(new Error('Falha ao carregar o conversor DOCX'))
    document.head.append(s)
})

// ---------- ODT ----------
const odtToHTML = async file => {
    const { configure, ZipReader, BlobReader, TextWriter, BlobWriter } = await import('../foliate/vendor/zip.js')
    configure({ useWebWorkers: false })
    const reader = new ZipReader(new BlobReader(file))
    const entries = await reader.getEntries()
    const content = entries.find(e => e.filename === 'content.xml')
    if (!content) throw new Error('Arquivo ODT inválido')
    const xml = new DOMParser().parseFromString(await content.getData(new TextWriter()), 'application/xml')
    const images = new Map()
    for (const e of entries) if (e.filename.startsWith('Pictures/'))
        images.set(e.filename, URL.createObjectURL(await e.getData(new BlobWriter())))
    const TEXT = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'
    const XLINK = 'http://www.w3.org/1999/xlink'
    const conv = node => {
        let out = ''
        for (const n of node.childNodes) {
            if (n.nodeType === 3) { out += escHTML(n.nodeValue); continue }
            if (n.nodeType !== 1) continue
            switch (n.localName) {
                case 'h': {
                    const lvl = Math.min(6, Number(n.getAttributeNS(TEXT, 'outline-level')) || 2)
                    out += `<h${lvl}>${conv(n)}</h${lvl}>`; break
                }
                case 'p': out += `<p>${conv(n)}</p>`; break
                case 'span': out += conv(n); break
                case 'a': out += `<a href="${escHTML(n.getAttributeNS(XLINK, 'href') ?? '')}">${conv(n)}</a>`; break
                case 'line-break': out += '<br>'; break
                case 'tab': out += '&emsp;'; break
                case 's': out += '&nbsp;'.repeat(Number(n.getAttributeNS(TEXT, 'c')) || 1); break
                case 'list': out += `<ul>${conv(n)}</ul>`; break
                case 'list-item': out += `<li>${conv(n)}</li>`; break
                case 'table': out += `<table>${conv(n)}</table>`; break
                case 'table-row': out += `<tr>${conv(n)}</tr>`; break
                case 'table-cell': out += `<td>${conv(n)}</td>`; break
                case 'image': {
                    const src = images.get(n.getAttributeNS(XLINK, 'href'))
                    if (src) out += `<img src="${src}">`
                    break
                }
                case 'note': out += `<sup title="${escHTML(n.textContent)}">*</sup>`; break
                case 'tracked-changes': case 'sequence-decls': case 'variable-decls': break
                default: out += conv(n)
            }
        }
        return out
    }
    const body = xml.getElementsByTagNameNS('urn:oasis:names:tc:opendocument:xmlns:office:1.0', 'text')[0]
    return conv(body ?? xml.documentElement)
}

// ---------- RTF ----------
export const rtfToHTML = rtf => {
    let i = 0
    const out = []
    let para = ''
    const stack = []
    let st = { b: false, i: false, u: false, skip: false, uc: 1 }
    const destinations = new Set(['fonttbl', 'colortbl', 'stylesheet', 'info', 'pict', 'header', 'footer',
        'headerl', 'headerr', 'footerl', 'footerr', 'object', 'themedata', 'colorschememapping',
        'latentstyles', 'datastore', 'xmlnstbl', 'listtable', 'listoverridetable', 'rsidtbl', 'generator', 'fldinst'])
    let open = { b: false, i: false, u: false }
    const syncFmt = () => {
        for (const [k, tag] of [['u', 'u'], ['i', 'em'], ['b', 'strong']])
            if (open[k] && !st[k]) { para += `</${tag}>`; open[k] = false }
        for (const [k, tag] of [['b', 'strong'], ['i', 'em'], ['u', 'u']])
            if (!open[k] && st[k]) { para += `<${tag}>`; open[k] = true }
    }
    const closeFmt = () => {
        for (const [k, tag] of [['u', 'u'], ['i', 'em'], ['b', 'strong']])
            if (open[k]) { para += `</${tag}>`; open[k] = false }
    }
    const emit = text => {
        if (st.skip) return
        syncFmt()
        para += escHTML(text)
    }
    const endPara = () => {
        closeFmt()
        if (para.replace(/<[^>]+>/g, '').trim()) out.push(`<p>${para}</p>`)
        para = ''
    }
    let pendingSkip = 0
    const cp1252 = new TextDecoder('windows-1252')
    while (i < rtf.length) {
        const c = rtf[i]
        if (c === '{') { stack.push({ ...st }); i++; continue }
        if (c === '}') { st = stack.pop() ?? st; i++; continue }
        if (c === '\\') {
            const next = rtf[i + 1]
            if (next === '\\' || next === '{' || next === '}') { if (pendingSkip > 0) pendingSkip--; else emit(next); i += 2; continue }
            if (next === '*') { st.skip = true; i += 2; continue }
            if (next === "'") {
                const byte = parseInt(rtf.substr(i + 2, 2), 16)
                if (pendingSkip > 0) pendingSkip--
                else emit(cp1252.decode(new Uint8Array([byte])))
                i += 4; continue
            }
            if (next === '~') { emit(' '); i += 2; continue }
            if (next === '\n' || next === '\r') { endPara(); i += 2; continue }
            const m = /^\\([a-z]+)(-?\d+)? ?/i.exec(rtf.slice(i, i + 40))
            if (!m) { i++; continue }
            i += m[0].length
            const [, word, numStr] = m
            const num = numStr != null ? Number(numStr) : null
            if (destinations.has(word)) { st.skip = true; continue }
            switch (word) {
                case 'par': case 'line': case 'sect': case 'page': endPara(); break
                case 'tab': emit('\t'); break
                case 'b': st.b = num !== 0; break
                case 'i': st.i = num !== 0; break
                case 'ul': st.u = num !== 0; break
                case 'ulnone': st.u = false; break
                case 'plain': st.b = st.i = st.u = false; break
                case 'uc': st.uc = num ?? 1; break
                case 'u': emit(String.fromCharCode(num < 0 ? num + 65536 : num)); pendingSkip = st.uc; break
                case 'emdash': emit('—'); break
                case 'endash': emit('–'); break
                case 'lquote': emit('‘'); break
                case 'rquote': emit('’'); break
                case 'ldblquote': emit('“'); break
                case 'rdblquote': emit('”'); break
                case 'bullet': emit('•'); break
            }
            continue
        }
        if (c === '\r' || c === '\n') { i++; continue }
        if (pendingSkip > 0) { pendingSkip--; i++; continue }
        emit(c)
        i++
    }
    endPara()
    return out.join('\n')
}
