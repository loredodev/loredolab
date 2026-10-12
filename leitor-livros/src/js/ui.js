// Utilitários de interface: seletores, criação de elementos, ícones, toasts e modais

export const $ = (sel, root = document) => root.querySelector(sel)
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// h('div.class#id', {attrs}, ...children)
export const h = (tag, attrs, ...children) => {
    const [, name = 'div', rest = ''] = tag.match(/^([a-z0-9-]*)(.*)$/i)
    const el = document.createElement(name || 'div')
    for (const part of rest.match(/[.#][^.#]+/g) ?? []) {
        if (part[0] === '.') el.classList.add(part.slice(1))
        else el.id = part.slice(1)
    }
    if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
        children.unshift(attrs)
        attrs = null
    }
    for (const [k, v] of Object.entries(attrs ?? {})) {
        if (v == null || v === false) continue
        if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v)
        else if (k === 'class') { if (v) el.classList.add(...String(v).split(/\s+/).filter(Boolean)) }
        else if (k === 'style' && typeof v === 'object') {
            for (const [p, val] of Object.entries(v))
                p.startsWith('--') ? el.style.setProperty(p, val) : (el.style[p] = val)
        }
        else if (k === 'html') el.innerHTML = v
        else if (k in el && typeof v !== 'string') el[k] = v
        else el.setAttribute(k, v === true ? '' : v)
    }
    for (const c of children.flat(Infinity)) {
        if (c == null || c === false) continue
        el.append(c instanceof Node ? c : document.createTextNode(String(c)))
    }
    return el
}

// replaceChildren que ignora null/false (permite filhos condicionais)
export const fill = (el, ...kids) =>
    el.replaceChildren(...kids.flat(Infinity).filter(k => k != null && k !== false))

// append que ignora null/false
export const add = (el, ...kids) =>
    el.append(...kids.flat(Infinity).filter(k => k != null && k !== false))

const ICONS = {
    library: '<path d="M4 19V5a2 2 0 0 1 2-2h3v18H6a2 2 0 0 1-2-2Z"/><path d="M9 3h4v18H9"/><path d="m14 4 3.5-1 4 16.5-3.5 1Z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    bookOpen: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2Z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    back: '<path d="M15 18 9 12l6-6"/>',
    next: '<path d="m9 18 6-6-6-6"/>',
    toc: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    bookmark: '<path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>',
    highlighter: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
    type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c1 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H17a5 5 0 0 0 5-5c0-4.9-4.5-9.4-10-9.4Z"/>',
    translate: '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    play: '<path d="m6 3 14 9-14 9Z"/>',
    pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    focus: '<circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>',
    note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    notebook: '<path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 2v20M12 7h4M12 11h4"/>',
    cards: '<rect x="2" y="6" width="14" height="14" rx="2"/><path d="M8 2h12a2 2 0 0 1 2 2v12"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15v2M11 10v7M15 12v5M19 6v11"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>',
    dictionary: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M9 7h6M9 11h4"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
    ruler: '<path d="M3 10h18v4H3z"/><path d="M7 10v2M11 10v2M15 10v2M19 10v2"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.5 1.5 2.8 2.5 2.8Z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    tag: '<path d="M12 2H2v10l9.3 9.3a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z"/><path d="M7 7h.01"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
    autoplay: '<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><path d="m10 8 6 4-6 4Z"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2H4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .01-1 1.03V20c0 1 0 1 1 1Z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2h-4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1Z"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
    keyboard: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/>',
}

export const icon = (name, size = 18) => {
    const span = document.createElement('span')
    span.className = 'icon'
    span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ''}</svg>`
    return span
}

export const iconBtn = (name, title, onclick, extra = {}) =>
    h('button.icon-btn', { title, 'aria-label': title, onclick, type: 'button', ...extra }, icon(name))

// ---------- toast ----------
export const toast = (msg, { type = 'info', timeout = 3200, action } = {}) => {
    let host = $('#toasts')
    if (!host) document.body.append(host = h('div#toasts'))
    const t = h(`div.toast.${type}`, h('span', msg),
        action ? h('button.link', { onclick: () => { action.run(); t.remove() } }, action.label) : null)
    host.append(t)
    setTimeout(() => t.classList.add('out'), timeout)
    setTimeout(() => t.remove(), timeout + 400)
}

// ---------- modal ----------
export const modal = ({ title, body, actions = [], wide = false, onClose }) => {
    const close = () => { overlay.remove(); onClose?.() }
    const overlay = h('div.modal-overlay', {
        onmousedown: e => { if (e.target === overlay) close() },
    })
    const box = h(`div.modal${wide ? '.wide' : ''}`, { role: 'dialog', 'aria-modal': 'true' },
        h('header', h('h2', title), iconBtn('close', 'Fechar', close)),
        h('div.modal-body', body),
        actions.length ? h('footer', actions.map(a => h(`button.btn${a.primary ? '.primary' : ''}${a.danger ? '.danger' : ''}`,
            { onclick: async () => { if (await a.run?.() !== false) close() } }, a.label))) : null)
    overlay.append(box)
    overlay.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close() } })
    document.body.append(overlay)
    setTimeout(() => (box.querySelector('input, textarea, select, button.primary') ?? box).focus?.(), 30)
    return { close, box }
}

export const confirmDialog = (title, message, { okLabel = 'Confirmar', danger = false } = {}) =>
    new Promise(resolve => {
        let ok = false
        modal({
            title, body: h('p', message),
            actions: [
                { label: 'Cancelar' },
                { label: okLabel, primary: !danger, danger, run: () => { ok = true } },
            ],
            onClose: () => resolve(ok),
        })
    })

export const promptDialog = (title, { label = '', value = '', multiline = false, placeholder = '' } = {}) =>
    new Promise(resolve => {
        let result = null
        const input = multiline
            ? h('textarea.input', { rows: 6, placeholder }, value)
            : h('input.input', { value, placeholder })
        const m = modal({
            title,
            body: h('label.field', label ? h('span', label) : null, input),
            actions: [{ label: 'Cancelar' }, { label: 'Salvar', primary: true, run: () => { result = input.value } }],
            onClose: () => resolve(result),
        })
        if (!multiline) input.addEventListener('keydown', e => {
            if (e.key === 'Enter') { result = input.value; m.close() }
        })
    })

// ---------- formatação ----------
export const fmtDuration = ms => {
    const min = Math.round(ms / 60000)
    if (min < 60) return `${min} min`
    const hrs = Math.floor(min / 60)
    return `${hrs} h ${min % 60 ? (min % 60) + ' min' : ''}`.trim()
}
export const fmtDate = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
export const fmtDateTime = ts => new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
export const todayKey = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export const debounce = (fn, ms) => {
    let t
    const f = (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
    f.flush = (...args) => { clearTimeout(t); fn(...args) }
    return f
}

// menu de contexto simples
export const contextMenu = (x, y, items) => {
    $('.ctx-menu')?.remove()
    const menu = h('div.ctx-menu', items.filter(Boolean).map(it => it === '-'
        ? h('hr')
        : h('button', { onclick: () => { menu.remove(); it.run() }, class: it.danger ? 'danger' : '' },
            it.icon ? icon(it.icon, 16) : null, it.label)))
    document.body.append(menu)
    const r = menu.getBoundingClientRect()
    menu.style.left = Math.min(x, innerWidth - r.width - 8) + 'px'
    menu.style.top = Math.min(y, innerHeight - r.height - 8) + 'px'
    setTimeout(() => document.addEventListener('mousedown', function off(e) {
        if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('mousedown', off) }
    }), 0)
}
