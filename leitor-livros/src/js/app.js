// Inicialização e navegação entre as telas
import { store } from './store.js'
import { Library } from './library.js'
import { Reader } from './reader.js'
import { Review, Vocab, AllNotes, dueCards } from './study.js'
import { Stats } from './stats.js'
import { Settings } from './settings.js'
import { $, $$, h, icon, modal, toast, fill } from './ui.js'

const SHORTCUTS = [
    ['← → / PgUp PgDn / Espaço', 'Virar página'],
    ['Clique nas laterais da página / roda do mouse', 'Virar página'],
    ['Home / End', 'Início / fim do livro'],
    ['[ / ]', 'Voltar / avançar no histórico de navegação'],
    ['T', 'Sumário'],
    ['Ctrl+F', 'Buscar no livro'],
    ['Ctrl+B', 'Marcar página'],
    ['N', 'Anotações e marcadores'],
    ['A', 'Aparência (fonte, tema, layout)'],
    ['Ctrl + / Ctrl −', 'Aumentar / diminuir fonte (ou zoom no PDF)'],
    ['D', 'Alternar modo noturno'],
    ['R', 'Ler em voz alta / pausar'],
    ['F', 'Modo foco'],
    ['F11', 'Tela cheia'],
    ['Esc', 'Fechar painel / voltar à biblioteca'],
    ['Selecionar texto', 'Destacar, sublinhar, anotar, traduzir, definir, explicar com IA, criar flashcard'],
    ['1 2 3 4 (na revisão)', 'Errei / Difícil / Bom / Fácil'],
    ['?', 'Esta lista de atalhos'],
]

class App {
    async init() {
        await store.load()
        this.applyUITheme()
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.applyUITheme())
        this.library = new Library(this)
        this.reader = new Reader(this)
        this.review = new Review(this)
        this.vocab = new Vocab(this)
        this.notes = new AllNotes(this)
        this.stats = new Stats(this)
        this.settingsView = new Settings(this)
        this.#buildNav()
        this.#setupDrop()
        window.api.app.onOpenFiles(list => this.library.importRecords(list, { open: true }))
        window.api.app.onFullscreen(fs => document.body.classList.toggle('fullscreen', fs))
        window.addEventListener('beforeunload', () => { this.reader.close(); store.flushAll() })
        document.addEventListener('keydown', e => {
            if (e.key === '?' && !this.reader.root.classList.contains('active') && !/input|textarea|select/i.test(e.target.tagName)) this.showShortcuts()
            if (e.key === 'F11') { e.preventDefault(); window.api.app.toggleFullscreen() }
        })
        this.show('library')
        const pending = await window.api.books.pending()
        if (pending.length) this.library.importRecords(pending, { open: true })
        // completa metadados que ficaram pendentes
        for (const b of store.library.books.filter(b => !b.metaDone)) {
            const { extractMeta } = await import('./library.js')
            await extractMeta(b)
            if (this.current === 'library') this.library.render()
        }
        setInterval(() => this.updateBadges(), 60000)
    }

    applyUITheme() {
        const t = store.settings.uiTheme
        const dark = t === 'escuro' || (t === 'sistema' && matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    }

    #buildNav() {
        const item = (id, ic, label) => h('button.nav-item', { 'data-view': id, onclick: () => this.show(id) },
            icon(ic, 20), h('span', label), h('span.nav-badge', { 'data-badge': id }))
        fill($('#sidebar'), 
            h('div.brand', h('div.logo', icon('bookOpen', 22)), h('div', h('strong', 'Leitor'), h('span', 'Loredo'))),
            h('nav',
                item('library', 'library', 'Biblioteca'),
                item('review', 'cards', 'Revisão'),
                item('notes', 'highlighter', 'Anotações'),
                item('vocab', 'translate', 'Vocabulário'),
                item('stats', 'chart', 'Estatísticas')),
            h('div.nav-bottom',
                h('div.streak#streak'),
                item('settings', 'settings', 'Configurações')))
        this.updateBadges()
    }

    updateBadges() {
        const due = dueCards().length
        const badge = $('[data-badge="review"]')
        if (badge) { badge.textContent = due || ''; badge.classList.toggle('show', due > 0) }
        const streak = store.streak()
        const el = $('#streak')
        if (el) fill(el, ...(streak ? [icon('flame', 16), h('span', `${streak} dia${streak > 1 ? 's' : ''} seguidos`)] : []))
    }

    show(name, arg) {
        if (this.current === 'reader' && name !== 'reader') {
            this.reader.close()
            document.body.classList.remove('reading')
        }
        this.current = name
        $$('.view').forEach(v => v.classList.toggle('active', v.id === `${name}-view`))
        $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === name))
        const views = { library: this.library, review: this.review, vocab: this.vocab, notes: this.notes, stats: this.stats, settings: this.settingsView }
        views[name]?.render(arg)
        this.updateBadges()
    }

    showLibrary() { this.show('library') }
    showSettings(section) { this.show('settings', section) }

    async openBook(rec) {
        if (!rec) return
        this.current = 'reader'
        $$('.view').forEach(v => v.classList.toggle('active', v.id === 'reader-view'))
        document.body.classList.add('reading')
        const ok = await this.reader.open(rec)
        if (!ok) document.body.classList.remove('reading')
    }

    showShortcuts() {
        modal({
            title: 'Atalhos de teclado',
            body: h('table.shortcuts', SHORTCUTS.map(([k, d]) => h('tr', h('td', h('kbd', k)), h('td', d)))),
        })
    }

    #setupDrop() {
        const overlay = h('div.drop-overlay', h('div', icon('upload', 48), h('p', 'Solte os livros para adicionar à biblioteca')))
        document.body.append(overlay)
        let depth = 0
        document.addEventListener('dragenter', e => {
            if (!e.dataTransfer?.types.includes('Files')) return
            depth++
            overlay.classList.add('show')
        })
        document.addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; overlay.classList.remove('show') } })
        document.addEventListener('dragover', e => e.preventDefault())
        document.addEventListener('drop', async e => {
            e.preventDefault()
            depth = 0
            overlay.classList.remove('show')
            const files = Array.from(e.dataTransfer?.files ?? [])
            if (!files.length) return
            const list = await window.api.books.importFiles(files)
            const open = files.length === 1 && this.current === 'reader'
            if (this.current === 'reader' && !open) this.show('library')
            this.library.importRecords(list, { open: files.length === 1 })
        })
    }
}

const app = new App()
window.app = app
app.init().catch(e => {
    console.error(e)
    toast(`Erro ao iniciar: ${e.message}`, { type: 'error', timeout: 10000 })
})
