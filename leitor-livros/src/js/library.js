// Biblioteca: estante de livros, importação, filtros, coleções
import { store } from './store.js'
import { openBook, FORMAT_LABEL } from './formats.js'
import { $, h, icon, iconBtn, toast, modal, confirmDialog, promptDialog, contextMenu, fmtDuration, fmtDate, fill } from './ui.js'

const formatText = x => !x ? '' : typeof x === 'string' ? x
    : Array.isArray(x) ? x.map(formatText).join(', ')
        : x.name ? formatText(x.name) : Object.values(x)[0] ?? ''

const STATUS = { want: 'Quero ler', reading: 'Lendo', done: 'Concluído', paused: 'Pausado', dropped: 'Abandonado' }

// capa gerada para livros sem capa
const hue = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 360
export const generatedCover = rec => h('div.gen-cover', {
    style: { '--h': hue(rec.title ?? rec.id) },
}, h('div.gc-title', rec.title), h('div.gc-author', rec.author ?? ''), h('div.gc-fmt', FORMAT_LABEL[rec.ext] ?? ''))

export const coverEl = rec => rec.cover
    ? h('img.cover-img', { src: rec.cover, alt: '', loading: 'lazy', onerror: e => e.target.replaceWith(generatedCover(rec)) })
    : generatedCover(rec)

const blobToJPEG = async blob => {
    const bmp = await createImageBitmap(blob)
    const scale = Math.min(1, 480 / bmp.width)
    const canvas = new OffscreenCanvas(Math.round(bmp.width * scale), Math.round(bmp.height * scale))
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const out = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.86 })
    return new Uint8Array(await out.arrayBuffer())
}

export const extractMeta = async rec => {
    let book
    try {
        book = await openBook(rec)
        const m = book.metadata ?? {}
        const patch = {
            title: formatText(m.title) || rec.title,
            author: formatText(m.author) || '',
            language: (Array.isArray(m.language) ? m.language[0] : m.language) || '',
            publisher: formatText(m.publisher) || '',
            description: formatText(m.description)?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600) || '',
            metaDone: true,
        }
        try {
            const cover = await book.getCover?.()
            if (cover) patch.cover = await window.api.books.saveCover(rec.id, await blobToJPEG(cover))
        } catch (e) { console.warn('capa', e) }
        store.updateBook(rec.id, patch)
    } catch (e) {
        console.warn('metadados', e)
        store.updateBook(rec.id, { metaDone: true, metaError: e.message })
    } finally {
        try { book?.destroy?.() } catch {}
    }
}

export class Library {
    constructor(app) {
        this.app = app
        this.root = $('#library-view')
        this.filter = 'all'
        this.query = ''
    }

    async importRecords(list, { open = false } = {}) {
        const errors = list.filter(x => x.error)
        for (const e of errors) toast(e.error, { type: 'error' })
        const recs = list.filter(x => !x.error)
        if (!recs.length) return
        let added = 0
        for (const r of recs) {
            const existed = !!store.book(r.id)
            store.upsertBook(r)
            if (!existed) added++
        }
        this.render()
        if (added) toast(`${added} livro${added > 1 ? 's' : ''} adicionado${added > 1 ? 's' : ''} à biblioteca`)
        else if (!open) toast('Esse livro já está na biblioteca')
        if (open && recs.length === 1) this.app.openBook(store.book(recs[0].id))
        for (const r of recs) {
            const b = store.book(r.id)
            if (!b.metaDone) { await extractMeta(b); this.render() }
        }
    }

    async pick() { this.importRecords(await window.api.books.pick()) }
    async pickFolder() {
        toast('Procurando livros na pasta…')
        this.importRecords(await window.api.books.pickFolder())
    }

    books() {
        const q = this.query.trim().toLowerCase()
        let list = store.library.books.filter(b => {
            if (this.filter === 'fav' && !b.favorite) return false
            if (STATUS[this.filter] && b.status !== this.filter) return false
            if (this.filter.startsWith('col:') && !b.collections?.includes(this.filter.slice(4))) return false
            if (q && !(`${b.title} ${b.author} ${b.ext}`.toLowerCase().includes(q))) return false
            return true
        })
        const sort = store.settings.librarySort
        const by = {
            recent: (a, b) => (b.lastOpened || b.addedAt) - (a.lastOpened || a.addedAt),
            added: (a, b) => b.addedAt - a.addedAt,
            title: (a, b) => a.title.localeCompare(b.title, 'pt'),
            author: (a, b) => (a.author || '~').localeCompare(b.author || '~', 'pt'),
            progress: (a, b) => (b.progress ?? 0) - (a.progress ?? 0),
            rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
        }[sort] ?? (() => 0)
        return list.sort(by)
    }

    render() {
        const s = store.settings
        const all = store.library.books
        const counts = {
            all: all.length,
            reading: all.filter(b => b.status === 'reading').length,
            want: all.filter(b => b.status === 'want').length,
            done: all.filter(b => b.status === 'done').length,
            fav: all.filter(b => b.favorite).length,
        }
        const chip = (key, label, n) => h('button.chip', {
            class: this.filter === key ? 'on' : '', onclick: () => { this.filter = key; this.render() },
        }, label, n != null ? h('span.count', n) : null)

        const continueBook = all.filter(b => b.status === 'reading' && b.lastOpened).sort((a, b) => b.lastOpened - a.lastOpened)[0]
        const list = this.books()

        const search = h('input.input.search', {
            placeholder: 'Buscar por título, autor ou formato…', value: this.query,
            oninput: e => { this.query = e.target.value; this.#renderGrid(); },
        })

        fill(this.root, 
            h('header.lib-head',
                h('div', h('h1', 'Sua estante'), h('p.muted', `${all.length} livro${all.length === 1 ? '' : 's'} · ${counts.done} concluído${counts.done === 1 ? '' : 's'}`)),
                h('div.lib-actions',
                    h('button.btn.primary', { onclick: () => this.pick() }, icon('plus', 16), ' Adicionar livros'),
                    h('button.btn', { onclick: () => this.pickFolder() }, icon('folder', 16), ' Importar pasta'))),
            continueBook && !this.query && this.filter === 'all' ? this.#continueCard(continueBook) : null,
            h('div.lib-toolbar',
                h('div.search-wrap', icon('search', 16), search),
                h('select.input.sort', {
                    onchange: e => { s.librarySort = e.target.value; store.save('settings'); this.#renderGrid() },
                }, [['recent', 'Lidos recentemente'], ['added', 'Adicionados recentemente'], ['title', 'Título (A–Z)'],
                    ['author', 'Autor (A–Z)'], ['progress', 'Progresso'], ['rating', 'Avaliação']]
                    .map(([v, l]) => h('option', { value: v, selected: s.librarySort === v }, l))),
                h('div.seg.small',
                    h('button', { class: s.libraryView === 'grid' ? 'on' : '', title: 'Estante', onclick: () => { s.libraryView = 'grid'; store.save('settings'); this.render() } }, icon('grid', 16)),
                    h('button', { class: s.libraryView === 'list' ? 'on' : '', title: 'Lista', onclick: () => { s.libraryView = 'list'; store.save('settings'); this.render() } }, icon('list', 16)))),
            h('div.chips',
                chip('all', 'Todos', counts.all), chip('reading', 'Lendo', counts.reading), chip('want', 'Quero ler', counts.want),
                chip('done', 'Concluídos', counts.done), chip('fav', '♥ Favoritos', counts.fav),
                store.library.collections.map(c => chip(`col:${c}`, `# ${c}`, all.filter(b => b.collections?.includes(c)).length)),
                h('button.chip.ghost', { onclick: () => this.#newCollection() }, '+ Coleção')),
            h('div#lib-grid'))
        this.#renderGrid(list)
    }

    #renderGrid(list = this.books()) {
        const grid = $('#lib-grid', this.root)
        if (!grid) return
        const view = store.settings.libraryView
        grid.className = view === 'list' ? 'book-list' : 'shelf'
        if (!store.library.books.length) {
            fill(grid, h('div.empty',
                icon('library', 56),
                h('h2', 'Sua estante está vazia'),
                h('p', 'Arraste livros para esta janela ou clique em “Adicionar livros”.'),
                h('p.muted.small', 'EPUB · PDF · MOBI · AZW · AZW3 · FB2 · CBZ · CBR · DOCX · ODT · RTF · TXT · Markdown · HTML'),
                h('button.btn.primary', { onclick: () => this.pick() }, icon('plus', 16), ' Adicionar livros')))
            return
        }
        if (!list.length) { fill(grid, h('p.muted.pad', 'Nenhum livro encontrado com esse filtro.')); return }
        fill(grid, ...list.map(b => view === 'list' ? this.#row(b) : this.#card(b)))
    }

    #continueCard(b) {
        return h('section.continue',
            h('div.cont-cover', { onclick: () => this.app.openBook(b) }, coverEl(b)),
            h('div.cont-info',
                h('span.eyebrow', 'Continue de onde parou'),
                h('h2', b.title), h('p.muted', b.author),
                h('div.progress-line', h('i', { style: { width: `${Math.round((b.progress ?? 0) * 100)}%` } })),
                h('p.small.muted', `${Math.round((b.progress ?? 0) * 100)}% lido · ${fmtDuration(b.totalTime ?? 0)} de leitura`),
                h('button.btn.primary', { onclick: () => this.app.openBook(b) }, icon('bookOpen', 16), ' Continuar lendo')))
    }

    #card(b) {
        const pct = Math.round((b.progress ?? 0) * 100)
        return h('div.book-card', {
            tabindex: 0, title: `${b.title}${b.author ? ' — ' + b.author : ''}`,
            onclick: () => this.app.openBook(b),
            onkeydown: e => { if (e.key === 'Enter') this.app.openBook(b) },
            oncontextmenu: e => { e.preventDefault(); this.#menu(b, e.clientX, e.clientY) },
        },
        h('div.cover', coverEl(b),
            b.favorite ? h('span.fav', '♥') : null,
            b.status === 'done' ? h('span.badge.done', '✓ Lido') : pct > 0 ? h('span.badge', `${pct}%`) : h('span.badge.new', 'Novo'),
            h('button.card-more', {
                title: 'Opções', onclick: e => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); this.#menu(b, r.left, r.bottom) },
            }, icon('more', 16)),
            pct > 0 && pct < 100 ? h('div.cover-progress', h('i', { style: { width: `${pct}%` } })) : null),
        h('div.card-title', b.title),
        h('div.card-author', b.author || FORMAT_LABEL[b.ext]))
    }

    #row(b) {
        const pct = Math.round((b.progress ?? 0) * 100)
        return h('div.book-row', {
            onclick: () => this.app.openBook(b),
            oncontextmenu: e => { e.preventDefault(); this.#menu(b, e.clientX, e.clientY) },
        },
        h('div.row-cover', coverEl(b)),
        h('div.row-main', h('div.card-title', b.title), h('div.card-author', b.author)),
        h('span.fmt', FORMAT_LABEL[b.ext]),
        h('span.status', STATUS[b.status] ?? ''),
        h('div.row-progress', h('div.progress-line', h('i', { style: { width: `${pct}%` } })), h('small', `${pct}%`)),
        h('small.muted', b.lastOpened ? fmtDate(b.lastOpened) : '—'),
        iconBtn('more', 'Opções', e => { e.stopPropagation(); this.#menu(b, e.clientX, e.clientY) }))
    }

    #menu(b, x, y) {
        contextMenu(x, y, [
            { icon: 'bookOpen', label: 'Abrir', run: () => this.app.openBook(b) },
            { icon: 'heart', label: b.favorite ? 'Remover dos favoritos' : 'Favoritar', run: () => { store.updateBook(b.id, { favorite: !b.favorite }); this.render() } },
            '-',
            ...Object.entries(STATUS).map(([k, l]) => ({ icon: b.status === k ? 'check' : null, label: `Marcar: ${l}`, run: () => { store.updateBook(b.id, { status: k, ...(k === 'done' ? { finishedAt: Date.now() } : {}) }); this.render() } })),
            '-',
            { icon: 'tag', label: 'Coleções…', run: () => this.#collections(b) },
            { icon: 'edit', label: 'Editar título e autor…', run: () => this.#edit(b) },
            { icon: 'info', label: 'Detalhes', run: () => this.#details(b) },
            { icon: 'folder', label: 'Mostrar arquivo', run: () => window.api.books.showInFolder(b.fileName) },
            '-',
            { icon: 'trash', label: 'Remover da biblioteca', danger: true, run: () => this.#remove(b) },
        ])
    }

    async #remove(b) {
        if (!await confirmDialog('Remover livro', `Remover “${b.title}” da biblioteca? As anotações deste livro também serão apagadas.`, { okLabel: 'Remover', danger: true })) return
        await store.removeBook(b.id)
        this.render()
        toast('Livro removido')
    }

    #edit(b) {
        const t = h('input.input', { value: b.title })
        const a = h('input.input', { value: b.author ?? '' })
        modal({
            title: 'Editar livro',
            body: h('div.form', h('label.field', h('span', 'Título'), t), h('label.field', h('span', 'Autor'), a)),
            actions: [{ label: 'Cancelar' }, { label: 'Salvar', primary: true, run: () => { store.updateBook(b.id, { title: t.value.trim() || b.title, author: a.value.trim() }); this.render() } }],
        })
    }

    #details(b) {
        const kv = (k, v) => v ? h('div.kv', h('span', k), h('span', v)) : null
        modal({
            title: b.title,
            body: h('div.details',
                h('div.det-cover', coverEl(b)),
                h('div.kvs',
                    kv('Autor', b.author), kv('Formato', FORMAT_LABEL[b.ext]), kv('Status', STATUS[b.status]),
                    kv('Progresso', `${Math.round((b.progress ?? 0) * 100)}%`), kv('Tempo de leitura', fmtDuration(b.totalTime ?? 0)),
                    kv('Adicionado', fmtDate(b.addedAt)), kv('Concluído', b.finishedAt ? fmtDate(b.finishedAt) : ''),
                    kv('Editora', b.publisher), kv('Idioma', b.language), kv('Tamanho', `${(b.size / 1048576).toFixed(1)} MB`),
                    kv('Arquivo original', b.originalName)),
                b.description ? h('p.desc', b.description) : null),
            actions: [{ label: 'Fechar' }, { label: 'Abrir livro', primary: true, run: () => this.app.openBook(b) }],
        })
    }

    async #newCollection() {
        const name = (await promptDialog('Nova coleção', { label: 'Nome (ex.: Faculdade, Filosofia, Inglês)' }))?.trim()
        if (!name) return
        if (!store.library.collections.includes(name)) store.library.collections.push(name)
        store.save('library')
        this.render()
    }

    #collections(b) {
        const cols = store.library.collections
        b.collections ??= []
        const boxes = cols.map(c => h('label.check', h('input', { type: 'checkbox', checked: b.collections.includes(c), value: c }), c))
        const newName = h('input.input', { placeholder: 'Nova coleção…' })
        modal({
            title: 'Coleções',
            body: h('div.form', cols.length ? h('div.col-list', boxes) : h('p.muted', 'Nenhuma coleção ainda.'), newName),
            actions: [{ label: 'Cancelar' }, {
                label: 'Salvar', primary: true, run: () => {
                    const sel = boxes.map(l => l.querySelector('input')).filter(i => i.checked).map(i => i.value)
                    const n = newName.value.trim()
                    if (n) { if (!cols.includes(n)) cols.push(n); sel.push(n) }
                    store.updateBook(b.id, { collections: [...new Set(sel)] })
                    store.save('library')
                    this.render()
                },
            }],
        })
    }
}
