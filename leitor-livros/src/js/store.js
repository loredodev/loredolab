// Camada de dados: biblioteca, dados por livro, estudo, estatísticas e configurações
import { debounce, todayKey, uid } from './ui.js'

export const DEFAULT_SETTINGS = {
    // aparência da leitura
    theme: 'papel',
    customBg: '#fbf6ea', customFg: '#2b2620',
    fontFamily: 'Literata',
    fontSize: 19,
    lineHeight: 1.6,
    letterSpacing: 0,
    wordSpacing: 0,
    paragraphSpacing: 0.6,
    textIndent: 1.5,
    fontWeight: 400,
    justify: true,
    hyphenate: true,
    overrideFont: true,
    layout: 'auto', // auto (2 páginas quando cabe) | single | scrolled
    pageWidth: 680,
    margin: 56,
    gap: 6,
    animated: true,
    pageSound: false,
    paperTexture: true,
    gpuMode: 'auto', // auto | padrao | desligada
    bookFrame: true,
    showHeaderFooter: true,
    brightness: 100,
    warmth: 0,
    pdfDarkInvert: true,
    // geral
    uiTheme: 'escuro',
    targetLang: 'pt',
    autoSaveVocab: true,
    dictLang: 'en',
    wikiLang: 'pt',
    ttsVoice: '', ttsRate: 1, ttsPitch: 1,
    autoTurnSeconds: 30,
    pomodoroMinutes: 25,
    breakMinutes: 5,
    dailyGoalMinutes: 30,
    yearlyGoalBooks: 12,
    // IA
    aiKey: '',
    aiModel: 'claude-opus-5-5',
    aiEffort: 'medium',
    libraryView: 'grid',
    librarySort: 'recent',
}

const state = {
    library: { books: [], collections: [] },
    study: { cards: [], vocab: [] },
    stats: { days: {} },
    settings: { ...DEFAULT_SETTINGS },
}

const savers = {}
const saver = name => savers[name] ??= debounce(() => window.api.store.set(name, state[name]), 400)

export const store = {
    get library() { return state.library },
    get study() { return state.study },
    get stats() { return state.stats },
    get settings() { return state.settings },

    async load() {
        const [library, study, stats, settings] = await Promise.all(
            ['library', 'study', 'stats', 'settings'].map(n => window.api.store.get(n)))
        if (library) state.library = { books: [], collections: [], ...library }
        if (study) state.study = { cards: [], vocab: [], ...study }
        if (stats) state.stats = { days: {}, ...stats }
        if (settings) state.settings = { ...DEFAULT_SETTINGS, ...settings }
    },
    save(name) { saver(name)() },
    flushAll() { for (const s of Object.values(savers)) s.flush() },

    // ----- biblioteca -----
    book(id) { return state.library.books.find(b => b.id === id) },
    upsertBook(rec) {
        const existing = this.book(rec.id)
        if (existing) Object.assign(existing, rec)
        else state.library.books.push({
            title: rec.originalName?.replace(/\.[^.]+$/, '') ?? 'Sem título',
            author: '', progress: 0, status: 'want', favorite: false, rating: 0,
            collections: [], addedAt: Date.now(), lastOpened: 0, totalTime: 0,
            ...rec,
        })
        this.save('library')
        return this.book(rec.id)
    },
    updateBook(id, patch) {
        const b = this.book(id)
        if (b) { Object.assign(b, patch); this.save('library') }
        return b
    },
    async removeBook(id) {
        const b = this.book(id)
        if (!b) return
        state.library.books = state.library.books.filter(x => x.id !== id)
        state.study.cards = state.study.cards.filter(c => c.bookId !== id)
        this.save('library'); this.save('study')
        await window.api.books.remove(b.fileName, id)
        await window.api.store.delete('book-' + id)
    },

    // ----- dados por livro -----
    async bookData(id) {
        const d = await window.api.store.get('book-' + id)
        return { annotations: [], bookmarks: [], notes: '', chat: [], ...d }
    },
    saveBookData: (() => {
        const map = {}
        return (id, data) => (map[id] ??= debounce(d => window.api.store.set('book-' + id, d), 500))(data)
    })(),

    // ----- estatísticas -----
    addReading(bookId, ms, pages = 0) {
        const key = todayKey()
        const day = state.stats.days[key] ??= { ms: 0, pages: 0, books: {} }
        day.ms += ms
        day.pages += pages
        day.books[bookId] = (day.books[bookId] ?? 0) + ms
        const b = this.book(bookId)
        if (b) b.totalTime = (b.totalTime ?? 0) + ms
        this.save('stats'); this.save('library')
    },
    streak() {
        let n = 0
        const d = new Date()
        const goal = state.settings.dailyGoalMinutes * 60000
        // hoje conta se já leu algo; se não, a sequência vem de ontem
        if (!(state.stats.days[todayKey(d)]?.ms > 0)) d.setDate(d.getDate() - 1)
        while (state.stats.days[todayKey(d)]?.ms >= Math.min(goal, 60000)) {
            n++
            d.setDate(d.getDate() - 1)
        }
        return n
    },

    // ----- estudo -----
    addCard(card) {
        const c = {
            id: uid(), created: Date.now(), due: Date.now(), interval: 0, ease: 2.5, reps: 0, lapses: 0,
            ...card,
        }
        state.study.cards.push(c)
        this.save('study')
        return c
    },
    addVocab(entry) {
        const exists = state.study.vocab.find(v => v.word.toLowerCase() === entry.word.toLowerCase() && v.bookId === entry.bookId)
        if (exists) return exists
        const v = { id: uid(), created: Date.now(), ...entry }
        state.study.vocab.push(v)
        this.save('study')
        return v
    },
}

// Repetição espaçada (SM-2 simplificado). grade: 0=errei 1=difícil 2=bom 3=fácil
export const schedule = (card, grade) => {
    const DAY = 86400000
    if (grade === 0) {
        card.lapses++
        card.reps = 0
        card.interval = 0
        card.ease = Math.max(1.3, card.ease - 0.2)
        card.due = Date.now() + 10 * 60000
    } else {
        card.reps++
        if (card.reps === 1) card.interval = grade === 3 ? 4 : 1
        else if (card.reps === 2) card.interval = grade === 3 ? 7 : grade === 1 ? 2 : 3
        else card.interval = Math.round(card.interval * (grade === 1 ? 1.2 : card.ease * (grade === 3 ? 1.3 : 1)))
        card.ease = Math.max(1.3, card.ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0))
        card.due = Date.now() + card.interval * DAY
    }
    card.lastReview = Date.now()
    return card
}

export const intervalPreview = (card, grade) => {
    const c = schedule({ ...card }, grade)
    const ms = c.due - Date.now()
    if (ms < 3600000) return `${Math.max(1, Math.round(ms / 60000))} min`
    const d = Math.round(ms / 86400000)
    return d < 30 ? `${d} d` : `${Math.round(d / 30)} m`
}
