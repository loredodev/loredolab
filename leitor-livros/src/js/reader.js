// O leitor: renderização do livro, navegação, aparência, anotações, busca,
// tradução, dicionário, leitura em voz alta, assistente de IA e ferramentas de foco.
import '../foliate/view.js'
import { Overlayer } from '../foliate/overlayer.js'
import * as CFI from '../foliate/epubcfi.js'
import { openBook, FORMAT_LABEL } from './formats.js'
import { store } from './store.js'
import { THEMES, FONTS, getTheme, bookCSS } from './themes.js'
import { ReadAloud, speak } from './tts.js'
import { aiChat, aiReady, aiFlashcards, QUICK_PROMPTS, renderMarkdown } from './ai.js'
import {
    $, $$, h, icon, iconBtn, toast, modal, promptDialog,
    fmtDuration, fmtDateTime, uid, debounce, fill, add
} from './ui.js'
import { exportAnnotations } from './exporter.js'

export const COLORS = {
    amarelo: { name: 'Amarelo', hex: '#f6c84c' },
    verde: { name: 'Verde', hex: '#7cc47f' },
    azul: { name: 'Azul', hex: '#5fa8e8' },
    rosa: { name: 'Rosa', hex: '#ef86b0' },
    laranja: { name: 'Laranja', hex: '#f59e4c' },
    roxo: { name: 'Roxo', hex: '#a98be0' },
}
export const STYLES = {
    highlight: { name: 'Marca-texto', draw: Overlayer.highlight },
    underline: { name: 'Sublinhado', draw: Overlayer.underline },
    squiggly: { name: 'Ondulado', draw: Overlayer.squiggly },
    strikethrough: { name: 'Tachado', draw: Overlayer.strikethrough },
}

export const LANGS = [
    ['pt', 'Português'], ['en', 'Inglês'], ['es', 'Espanhol'], ['fr', 'Francês'], ['de', 'Alemão'],
    ['it', 'Italiano'], ['nl', 'Holandês'], ['ru', 'Russo'], ['pl', 'Polonês'], ['tr', 'Turco'],
    ['sv', 'Sueco'], ['el', 'Grego'], ['la', 'Latim'], ['he', 'Hebraico'], ['ar', 'Árabe'],
    ['hi', 'Hindi'], ['ja', 'Japonês'], ['ko', 'Coreano'], ['zh-CN', 'Chinês (simpl.)'], ['zh-TW', 'Chinês (trad.)'],
]

const formatLang = x => typeof x === 'string' ? x : Array.isArray(x) ? x[0] : ''
const formatText = x => !x ? '' : typeof x === 'string' ? x
    : Array.isArray(x) ? x.map(formatText).join(', ')
        : x.name ? formatText(x.name) : Object.values(x)[0] ?? ''

export class Reader {
    constructor(app) {
        this.app = app
        this.root = $('#reader-view')
        this.panel = null
        this.selection = null
        this.lastActivity = Date.now()
        this.tts = new ReadAloud(this)
        this.tts.addEventListener('state', () => this.#renderTTSBar())
        this.tts.addEventListener('error', e => toast(e.detail, { type: 'error', timeout: 7000 }))
        this.#buildChrome()
        this.#bindGlobalKeys()
    }

    get settings() { return store.settings }

    // ======================================================================
    // Estrutura da tela
    // ======================================================================
    #buildChrome() {
        const tb = (name, title, fn, id) => iconBtn(name, title, fn, id ? { id } : {})
        fill(this.root, 
            h('header.reader-top',
                tb('back', 'Voltar à biblioteca (Esc)', () => this.app.showLibrary()),
                h('div.reader-title',
                    h('div.rt-book#rt-book'),
                    h('div.rt-chapter#rt-chapter')),
                h('div.reader-tools',
                    tb('toc', 'Sumário (T)', () => this.togglePanel('toc'), 'btn-toc'),
                    tb('search', 'Buscar no livro (Ctrl+F)', () => this.togglePanel('search'), 'btn-search'),
                    tb('bookmark', 'Marcar página (Ctrl+B)', () => this.toggleBookmark(), 'btn-bookmark'),
                    tb('highlighter', 'Anotações e marcadores (N)', () => this.togglePanel('notes'), 'btn-notes'),
                    tb('notebook', 'Caderno de estudo', () => this.togglePanel('notebook'), 'btn-notebook'),
                    h('span.sep'),
                    tb('type', 'Aparência: fonte, tema, layout (A)', () => this.togglePanel('appearance'), 'btn-appearance'),
                    tb('translate', 'Tradutor e dicionário', () => this.togglePanel('translate'), 'btn-translate'),
                    tb('sparkles', 'Assistente de estudo (IA)', () => this.togglePanel('ai'), 'btn-ai'),
                    h('span.sep'),
                    tb('volume', 'Ler em voz alta (R)', () => this.toggleTTS(), 'btn-tts'),
                    tb('autoplay', 'Virar páginas automaticamente', () => this.toggleAutoTurn(), 'btn-autoturn'),
                    tb('ruler', 'Régua de leitura', () => this.toggleRuler(), 'btn-ruler'),
                    h('button.icon-btn.timer-btn#btn-timer', {
                        title: 'Pomodoro / sessão de foco', onclick: () => this.togglePomodoro(),
                    }, icon('timer'), h('span#timer-label')),
                    tb('focus', 'Modo foco — esconde tudo (F)', () => this.toggleFocus(), 'btn-focus'),
                    tb('maximize', 'Tela cheia (F11)', () => window.api.app.toggleFullscreen()),
                    tb('info', 'Informações do livro', () => this.togglePanel('info'), 'btn-info'),
                )),
            h('div.reader-body',
                h('main.stage#stage',
                    h('button.nav-zone.left', { title: 'Página anterior', onclick: () => this.prev() }, icon('back', 28)),
                    h('div.book#book',
                        h('div.book-edges'),
                        h('div.book-host#book-host'),
                        h('div.fold')),
                    h('button.nav-zone.right', { title: 'Próxima página', onclick: () => this.next() }, icon('next', 28)),
                    h('div.ruler#ruler'),
                    h('div.loading#reader-loading', h('div.spinner'), h('span', 'Abrindo livro…')),
                ),
                h('aside.panel#panel', { 'aria-live': 'polite' })),
            h('footer.reader-bottom',
                h('div.progress-wrap',
                    h('input#progress', { type: 'range', min: 0, max: 1, step: 'any', value: 0, 'aria-label': 'Progresso' }),
                    h('div.ticks#ticks')),
                h('div.progress-info',
                    h('span#pi-page'), h('span#pi-percent'), h('span#pi-left'))),
            h('div.tts-bar#tts-bar'),
            h('div.sel-pop#sel-pop'),
        )
        const progress = $('#progress', this.root)
        progress.addEventListener('input', debounce(() => this.view?.goToFraction(parseFloat(progress.value)), 60))
        progress.addEventListener('mousemove', e => {
            const r = progress.getBoundingClientRect()
            const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
            progress.title = `${Math.round(f * 100)}%`
        })
        // roda do mouse vira página (modo paginado)
        $('#stage', this.root).addEventListener('wheel', e => this.#onWheel(e), { passive: true })
        $('#stage', this.root).addEventListener('mousemove', e => this.#moveRuler(e.clientY))
    }

    // ======================================================================
    // Abrir / fechar
    // ======================================================================
    async open(rec) {
        this.close()
        this.rec = rec
        this.root.classList.remove('focus-mode')
        $('#reader-loading', this.root).hidden = false
        $('#rt-book', this.root).textContent = rec.title
        $('#rt-chapter', this.root).textContent = rec.author ?? ''
        this.data = await store.bookData(rec.id)
        let book
        try {
            book = await openBook(rec)
        } catch (e) {
            console.error(e)
            $('#reader-loading', this.root).hidden = true
            this.app.showLibrary()
            const msg = /DRM|encrypt/i.test(e.message) ? 'Este livro está protegido por DRM e não pode ser aberto.' : e.message
            toast(`Não foi possível abrir o livro: ${msg}`, { type: 'error', timeout: 6000 })
            return false
        }
        this.book = book
        const view = this.view = document.createElement('foliate-view')
        view.classList.add('fview')
        $('#book-host', this.root).append(view)
        await view.open(book)
        this.isFixed = view.isFixedLayout
        this.language = formatLang(book.metadata?.language) || ''
        this.root.classList.toggle('fixed-layout', this.isFixed)

        view.addEventListener('load', e => this.#onLoad(e.detail))
        view.addEventListener('relocate', e => this.#onRelocate(e.detail))
        view.addEventListener('create-overlay', e => this.#drawAnnotationsFor(e.detail.index))
        view.addEventListener('draw-annotation', e => {
            const { draw, annotation } = e.detail
            const style = STYLES[annotation.style] ?? STYLES.highlight
            const color = COLORS[annotation.color]?.hex ?? annotation.color ?? COLORS.amarelo.hex
            draw(style.draw, { color, width: 2 })
        })
        view.addEventListener('show-annotation', e => this.#onAnnotationClick(e.detail))
        view.addEventListener('external-link', e => {
            e.preventDefault()
            window.api.app.openExternal(e.detail.href_ ?? e.detail.a.href)
        })
        book.transformTarget?.addEventListener('data', ({ detail }) => {
            detail.data = Promise.resolve(detail.data).catch(err => { console.error(err); return '' })
        })

        // metadados
        const title = formatText(book.metadata?.title) || rec.title
        $('#rt-book', this.root).textContent = title
        document.title = `${title} — Leitor Loredo`
        store.updateBook(rec.id, { lastOpened: Date.now(), status: rec.status === 'done' ? 'done' : 'reading' })

        this.applyAppearance()
        this.#buildTicks()

        try {
            await view.init({ lastLocation: this.data.lastLocation, showTextStart: !this.data.lastLocation })
        } catch (e) {
            console.error(e)
            await view.goTo(0).catch(() => {})
        }
        $('#reader-loading', this.root).hidden = true
        this.#startSessionTimer()
        this.#updateBookmarkBtn()
        if (this.panelName) this.renderPanel()
        return true
    }

    close() {
        if (!this.view) return
        this.tts.stop()
        this.#stopAutoTurn()
        this.#hideSelPop()
        this.#flushSession()
        clearInterval(this.sessionTimer)
        this.view.close?.()
        this.book?.destroy?.()
        this.view.remove()
        this.view = null
        this.book = null
        store.saveBookData(this.rec.id, this.data)
        this.panelName = null
        this.lastResults = null
        this.lastQuery = ''
        this.translateText = ''
        $('#panel', this.root).classList.remove('open')
        this.root.classList.remove('panel-open')
        document.title = 'Leitor Loredo'
    }

    // ======================================================================
    // Aparência
    // ======================================================================
    applyAppearance() {
        const s = this.settings
        const t = getTheme(s)
        const view = this.view
        const bookEl = $('#book', this.root)
        this.root.style.setProperty('--page-bg', t.bg)
        this.root.style.setProperty('--page-fg', t.fg)
        this.root.style.setProperty('--page-edge', t.page)
        this.root.classList.toggle('dark-page', !!t.dark)
        bookEl.classList.toggle('framed', s.bookFrame && !this.isFixed && s.layout !== 'scrolled')
        bookEl.classList.toggle('textured', s.paperTexture && !!t.texture)
        const warm = s.warmth / 100
        const filters = [`brightness(${s.brightness / 100})`]
        if (warm > 0) filters.push(`sepia(${warm * 0.55})`, `saturate(${1 + warm * 0.3})`)
        $('#book-host', this.root).style.filter = filters.join(' ')
        if (!view?.renderer) return
        if (this.isFixed) {
            const invert = t.dark && s.pdfDarkInvert
            view.style.filter = invert ? 'invert(.88) hue-rotate(180deg)' : ''
            view.renderer.setAttribute('zoom', this.data?.zoom ?? 'fit-page')
            this.#syncSpread()
            return
        }
        const r = view.renderer
        r.setAttribute('flow', s.layout === 'scrolled' ? 'scrolled' : 'paginated')
        r.setAttribute('max-column-count', s.layout === 'single' ? 1 : 2)
        r.setAttribute('max-inline-size', `${s.pageWidth}px`)
        r.setAttribute('margin', `${s.showHeaderFooter ? Math.max(s.margin, 44) : s.margin}px`)
        r.setAttribute('gap', `${s.gap}%`)
        r.toggleAttribute('animated', !!s.animated)
        r.setStyles?.(bookCSS(s))
        view.style.setProperty('--overlayer-highlight-opacity', t.dark ? '.38' : '.42')
        view.style.setProperty('--overlayer-highlight-blend-mode', t.dark ? 'screen' : 'multiply')
        const cols = s.layout === 'single' || s.layout === 'scrolled' ? 1 : 2
        bookEl.style.maxWidth = s.layout === 'scrolled' ? `${s.pageWidth + 160}px`
            : `${cols * s.pageWidth + (cols === 2 ? 2 : 1) * (s.pageWidth * s.gap / 50) + 120}px`
        requestAnimationFrame(() => this.#syncSpread())
    }

    #syncSpread() {
        const r = this.view?.renderer
        const spread = !this.isFixed && this.settings.layout !== 'scrolled' && (r?.heads?.length ?? 0) >= 2
        $('#book', this.root).classList.toggle('spread', spread)
        if (this.lastDetail) this.#updateMarginals(this.lastDetail)
    }

    setSetting(key, value) {
        this.settings[key] = value
        store.save('settings')
        this.applyAppearance()
    }

    // ======================================================================
    // Eventos do livro
    // ======================================================================
    #onLoad({ doc, index }) {
        doc.addEventListener('keydown', e => this.#onKey(e))
        doc.addEventListener('pointerup', e => setTimeout(() => this.#checkSelection(doc, index, e), 10))
        doc.addEventListener('pointerdown', () => this.#hideSelPop())
        doc.addEventListener('wheel', e => this.#onWheel(e), { passive: true })
        doc.addEventListener('mousemove', e => {
            this.markActivity()
            const fr = doc.defaultView.frameElement?.getBoundingClientRect()
            if (fr) this.#moveRuler(fr.top + e.clientY)
        })
        doc.addEventListener('click', e => this.#onDocClick(e, doc))
        doc.addEventListener('dblclick', () => setTimeout(() => this.#checkSelection(doc, index), 20))
        doc.addEventListener('contextmenu', e => {
            const sel = doc.getSelection()
            if (sel && !sel.isCollapsed) { e.preventDefault(); this.#checkSelection(doc, index) }
        })
        // continua leitura em voz alta na nova seção
        if (this.tts.playing && this.ttsWaitingSection) {
            this.ttsWaitingSection = false
            setTimeout(() => this.tts.continueInNewSection(doc), 300)
        }
    }

    #onDocClick(e, doc) {
        if (e.target.closest?.('a[href]')) return
        const sel = doc.getSelection()
        if (sel && !sel.isCollapsed) return
        if (Date.now() - (this.annotationClickAt ?? 0) < 300) return
        // clique nas laterais da página vira a página
        const fr = doc.defaultView.frameElement?.getBoundingClientRect()
        const book = $('#book', this.root).getBoundingClientRect()
        if (!fr) return
        const x = fr.left + e.clientX
        const rel = (x - book.left) / book.width
        if (this.settings.layout === 'scrolled') return
        if (rel < 0.18) this.prev()
        else if (rel > 0.82) this.next()
    }

    #onWheel(e) {
        if (!this.view || this.settings.layout === 'scrolled' || (this.isFixed && this.data?.zoom && this.data.zoom !== 'fit-page')) return
        if (document.querySelector('.modal-overlay')) return
        const now = Date.now()
        if (now - (this.lastWheel ?? 0) < 320 || Math.abs(e.deltaY) < 4) return
        this.lastWheel = now
        e.deltaY > 0 ? this.next() : this.prev()
    }

    #onRelocate(detail) {
        this.lastDetail = detail
        this.markActivity()
        const { fraction, location, tocItem, section, cfi } = detail
        // progresso
        $('#progress', this.root).value = fraction
        const pct = Math.round(fraction * 100)
        $('#pi-percent', this.root).textContent = `${pct}%`
        let pageText
        if (this.isFixed) pageText = `Página ${section.current + 1} de ${section.total}`
        else if (location) pageText = `Página ${location.current + 1} de ${location.total}`
        $('#pi-page', this.root).textContent = pageText ?? ''
        // tempo restante estimado
        const cur = this.isFixed ? section.current : location?.current
        const total = this.isFixed ? section.total : location?.total
        if (cur != null) {
            const now = Date.now()
            if (this.lastLoc != null && cur === this.lastLoc + 1 && this.lastLocAt) {
                const dt = now - this.lastLocAt
                if (dt > 2000 && dt < 600000) {
                    const prevAvg = this.rec.msPerPage ?? dt
                    this.rec.msPerPage = Math.round(prevAvg * 0.85 + dt * 0.15)
                }
            }
            if (this.lastLoc != null && cur !== this.lastLoc)
                this.pagesThisSession = (this.pagesThisSession ?? 0) + 1
            if (this.lastFraction != null && fraction !== this.lastFraction && this.settings.pageSound) playPageSound()
            this.lastFraction = fraction
            this.lastLoc = cur
            this.lastLocAt = now
            const per = this.rec.msPerPage ?? 90000
            const left = (total - cur - 1) * per
            $('#pi-left', this.root).textContent = left > 60000 ? `≈ ${fmtDuration(left)} para terminar` : pct >= 99 ? 'Fim do livro 🎉' : ''
        }
        // capítulo
        const chapter = tocItem?.label ?? ''
        this.chapterLabel = chapter
        $('#rt-chapter', this.root).textContent = chapter
        this.#syncSpread()
        // salvar
        this.data.lastLocation = cfi
        store.saveBookData(this.rec.id, this.data)
        const patch = { progress: fraction, msPerPage: this.rec.msPerPage }
        if (fraction >= 0.995 && this.rec.status !== 'done') {
            patch.status = 'done'
            patch.finishedAt = Date.now()
            toast('Parabéns! Você terminou este livro. 🎉', { type: 'success', timeout: 5000 })
        }
        store.updateBook(this.rec.id, patch)
        this.#updateBookmarkBtn()
        if (this.panelName === 'toc') this.#highlightTOC()
        this.#hideSelPop()
    }

    #updateMarginals(detail) {
        const r = this.view?.renderer
        if (!r?.heads || this.isFixed) return
        const s = this.settings
        const show = s.showHeaderFooter
        const title = $('#rt-book', this.root).textContent
        const chapter = detail.tocItem?.label ?? ''
        const n = r.heads.length
        r.heads.forEach((el, i) => {
            el.textContent = !show ? '' : n === 1 ? chapter || title : i === 0 ? title : chapter
        })
        const page = (detail.location?.current ?? 0) + 1
        r.feet.forEach((el, i) => { el.textContent = show ? String(page + i) : '' })
    }

    #buildTicks() {
        const ticks = $('#ticks', this.root)
        fill(ticks, )
        if (this.isFixed) return
        const fracs = this.view.getSectionFractions()
        if (fracs.length > 150) return
        for (const f of fracs.slice(1, -1)) ticks.append(h('i', { style: { left: `${f * 100}%` } }))
    }

    // ======================================================================
    // Navegação
    // ======================================================================
    prev() { this.markActivity(); return this.view?.goLeft() }
    next() { this.markActivity(); return this.view?.goRight() }

    async nextSectionForTTS() {
        const r = this.view?.renderer
        if (!r) return false
        const before = this.view.lastLocation?.section?.current
        this.ttsWaitingSection = true
        await r.nextSection?.()
        const after = this.view.lastLocation?.section?.current
        if (before === after) { this.ttsWaitingSection = false; return false }
        return true
    }

    #bindGlobalKeys() {
        document.addEventListener('keydown', e => {
            if (!this.root.classList.contains('active')) return
            this.#onKey(e)
        })
    }

    #onKey(e) {
        const tag = (e.target.tagName ?? '').toLowerCase()
        if (['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable) return
        if (document.querySelector('.modal-overlay')) return
        const k = e.key
        const ctrl = e.ctrlKey || e.metaKey
        if (ctrl && k.toLowerCase() === 'f') { e.preventDefault(); this.togglePanel('search', true) }
        else if (ctrl && k.toLowerCase() === 'b') { e.preventDefault(); this.toggleBookmark() }
        else if (ctrl && (k === '=' || k === '+')) { e.preventDefault(); this.#bumpFont(1) }
        else if (ctrl && k === '-') { e.preventDefault(); this.#bumpFont(-1) }
        else if (ctrl) return
        else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'h') { e.preventDefault(); this.prev() }
        else if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'l') { e.preventDefault(); e.shiftKey && k === ' ' ? this.prev() : this.next() }
        else if (k === 'ArrowUp' && this.settings.layout !== 'scrolled') { e.preventDefault(); this.prev() }
        else if (k === 'ArrowDown' && this.settings.layout !== 'scrolled') { e.preventDefault(); this.next() }
        else if (k === 'Home') this.view?.renderer.firstSection?.()
        else if (k === 'End') this.view?.renderer.lastSection?.()
        else if (k === 'Escape') {
            if ($('.sel-pop.show', this.root)) this.#hideSelPop()
            else if (this.panelName) this.togglePanel(this.panelName)
            else if (this.root.classList.contains('focus-mode')) this.toggleFocus()
            else this.app.showLibrary()
        }
        else if (k === 'F11') { e.preventDefault(); window.api.app.toggleFullscreen() }
        else if (k === 't' || k === 'T') this.togglePanel('toc')
        else if (k === 'n' || k === 'N') this.togglePanel('notes')
        else if (k === 'a' || k === 'A') this.togglePanel('appearance')
        else if (k === 'f' || k === 'F') this.toggleFocus()
        else if (k === 'r' || k === 'R') this.toggleTTS()
        else if (k === 'd' || k === 'D') this.toggleNight()
        else if (k === '[') this.view?.history.back()
        else if (k === ']') this.view?.history.forward()
        else if (k === '?') this.app.showShortcuts()
    }

    #bumpFont(d) {
        if (this.isFixed) return this.#zoom(d > 0 ? 1.15 : 1 / 1.15)
        this.setSetting('fontSize', Math.max(10, Math.min(48, this.settings.fontSize + d)))
        if (this.panelName === 'appearance') this.renderPanel()
    }

    toggleNight() {
        const s = this.settings
        if (getTheme(s).dark) this.setSetting('theme', s.lastLightTheme ?? 'papel')
        else { s.lastLightTheme = s.theme; this.setSetting('theme', s.lastDarkTheme ?? 'noite') }
        if (this.panelName === 'appearance') this.renderPanel()
    }

    #zoom(factor) {
        const cur = this.data.zoom
        let z = typeof cur === 'number' ? cur : 1
        if (factor === 'fit-page' || factor === 'fit-width') z = factor
        else z = Math.max(0.3, Math.min(5, z * factor))
        this.data.zoom = z
        store.saveBookData(this.rec.id, this.data)
        this.view.renderer.setAttribute('zoom', z)
    }

    // ======================================================================
    // Seleção de texto
    // ======================================================================
    #checkSelection(doc, index) {
        const sel = doc.getSelection()
        if (!sel || sel.isCollapsed || !sel.rangeCount) return
        const range = sel.getRangeAt(0)
        const text = sel.toString().trim()
        if (!text) return
        this.selection = { doc, index, range: range.cloneRange(), text }
        this.#showSelPop(doc, range)
    }

    #rangeRect(doc, range) {
        const fr = doc.defaultView.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 }
        const rects = Array.from(range.getClientRects())
        const r = rects.length ? rects[0] : range.getBoundingClientRect()
        const last = rects.length ? rects[rects.length - 1] : r
        // considera transformações de zoom (PDF)
        const frame = doc.defaultView.frameElement
        const scale = frame ? fr.width / (frame.offsetWidth || fr.width) : 1
        return {
            top: fr.top + r.top * scale,
            bottom: fr.top + last.bottom * scale,
            left: fr.left + r.left * scale,
            right: fr.left + last.right * scale,
        }
    }

    #showSelPop(doc, range, annotation) {
        const pop = $('#sel-pop', this.root)
        const rect = this.#rangeRect(doc, range)
        const text = annotation?.text ?? this.selection?.text ?? ''
        const short = text.split(/\s+/).length <= 3
        const swatches = h('div.swatches', Object.entries(COLORS).map(([key, c]) =>
            h('button.swatch', {
                title: c.name, style: { background: c.hex },
                class: annotation?.color === key ? 'active' : '',
                onclick: () => annotation ? this.updateAnnotation(annotation, { color: key }) : this.annotate({ color: key }),
            })))
        const styles = h('div.styles', Object.entries(STYLES).map(([key, st]) =>
            h('button.style-btn', {
                title: st.name, class: (annotation?.style ?? '') === key ? 'active' : '',
                onclick: () => annotation ? this.updateAnnotation(annotation, { style: key }) : this.annotate({ style: key }),
            }, h(`span.style-prev.${key}`, 'Ab'))))
        const act = (ic, label, fn) => h('button.pop-act', { onclick: fn, title: label }, icon(ic, 16), h('span', label))
        fill(pop, 
            h('div.pop-row', swatches, h('span.vsep'), styles),
            annotation?.note ? h('div.pop-note', annotation.note) : null,
            h('div.pop-row.actions',
                act('note', annotation?.note ? 'Editar nota' : 'Nota', () => annotation ? this.editNote(annotation) : this.annotate({ withNote: true })),
                act('translate', 'Traduzir', () => this.openTranslate(text)),
                act('dictionary', short ? 'Dicionário' : 'Definir', () => this.openTranslate(text, { dictionary: true })),
                act('sparkles', 'Explicar (IA)', () => this.explainWithAI(text)),
                act('cards', 'Flashcard', () => this.makeFlashcard(text, annotation)),
                act('volume', 'Ouvir', () => speak(text, this.language || undefined)),
                act('copy', 'Copiar', () => { navigator.clipboard.writeText(text); toast('Copiado'); this.#hideSelPop() }),
                act('search', 'Buscar', () => { this.togglePanel('search', true); setTimeout(() => this.runSearch(text), 50) }),
                act('globe', 'Wikipédia', () => this.openTranslate(text, { wiki: true })),
                annotation ? act('trash', 'Apagar', () => this.deleteAnnotation(annotation)) : null,
            ))
        pop.classList.add('show')
        const pr = pop.getBoundingClientRect()
        const stage = $('#stage', this.root).getBoundingClientRect()
        let top = rect.top - pr.height - 10
        if (top < stage.top + 4) top = rect.bottom + 10
        let left = (rect.left + rect.right) / 2 - pr.width / 2
        left = Math.max(8, Math.min(innerWidth - pr.width - 8, left))
        pop.style.top = `${Math.min(top, innerHeight - pr.height - 8)}px`
        pop.style.left = `${left}px`
        this.popAnnotation = annotation ?? null
    }

    #hideSelPop() {
        $('#sel-pop', this.root)?.classList.remove('show')
        this.popAnnotation = null
    }

    #clearSelection() {
        this.selection?.doc.getSelection()?.removeAllRanges()
        this.selection = null
        this.#hideSelPop()
    }

    // ======================================================================
    // Anotações
    // ======================================================================
    async annotate({ color, style, withNote } = {}) {
        const sel = this.selection
        if (!sel) return
        const cfi = this.view.getCFI(sel.index, sel.range)
        const { tocItem } = this.view.getProgressOf(sel.index, sel.range)
        const a = {
            id: uid(), value: cfi, index: sel.index,
            text: sel.text, note: '',
            color: color ?? this.settings.lastColor ?? 'amarelo',
            style: style ?? this.settings.lastStyle ?? 'highlight',
            chapter: tocItem?.label ?? '',
            fraction: this.view.lastLocation?.fraction ?? 0,
            created: Date.now(),
        }
        if (color) this.settings.lastColor = color
        if (style) this.settings.lastStyle = style
        store.save('settings')
        this.data.annotations.push(a)
        this.#saveData()
        await this.view.addAnnotation(a)
        this.#clearSelection()
        if (withNote) this.editNote(a)
        if (this.panelName === 'notes') this.renderPanel()
        return a
    }

    async updateAnnotation(a, patch) {
        Object.assign(a, patch, { updated: Date.now() })
        if (patch.color) this.settings.lastColor = patch.color
        if (patch.style) this.settings.lastStyle = patch.style
        this.#saveData()
        await this.view.addAnnotation(a)
        this.#hideSelPop()
        if (this.panelName === 'notes') this.renderPanel()
    }

    async deleteAnnotation(a) {
        this.data.annotations = this.data.annotations.filter(x => x.id !== a.id)
        this.#saveData()
        await this.view.deleteAnnotation(a)
        this.#hideSelPop()
        if (this.panelName === 'notes') this.renderPanel()
        toast('Anotação apagada', {
            action: { label: 'Desfazer', run: async () => { this.data.annotations.push(a); this.#saveData(); await this.view.addAnnotation(a); if (this.panelName === 'notes') this.renderPanel() } },
        })
    }

    async editNote(a) {
        this.#hideSelPop()
        const note = await promptDialog('Nota', {
            label: `“${a.text.slice(0, 160)}${a.text.length > 160 ? '…' : ''}”`,
            value: a.note, multiline: true, placeholder: 'Escreva seu comentário, dúvida ou reflexão…',
        })
        if (note == null) return
        await this.updateAnnotation(a, { note: note.trim() })
    }

    #drawAnnotationsFor(index) {
        for (const a of this.data?.annotations ?? []) {
            const idx = a.index ?? this.#indexOf(a.value)
            if (idx === index) this.view.addAnnotation(a)
        }
    }

    #indexOf(cfi) {
        try { return this.view.resolveCFI(cfi).index } catch { return -1 }
    }

    #onAnnotationClick({ value, range }) {
        const a = this.data.annotations.find(x => x.value === value)
        if (!a) return
        this.annotationClickAt = Date.now()
        const doc = range.startContainer.ownerDocument
        this.selection = null
        this.#showSelPop(doc, range, a)
    }

    #saveData() { store.saveBookData(this.rec.id, this.data) }

    // ----- marcadores -----
    #currentBookmark() {
        const loc = this.view?.lastLocation
        if (!loc?.range) return null
        const start = this.view.getCFI(loc.section?.current ?? 0, collapsed(loc.range, false))
        const end = this.view.getCFI(loc.section?.current ?? 0, collapsed(loc.range, true))
        return this.data.bookmarks.find(b => {
            try { return CFI.compare(b.value, start) >= 0 && CFI.compare(b.value, end) <= 0 } catch { return false }
        })
    }

    #updateBookmarkBtn() {
        $('#btn-bookmark', this.root)?.classList.toggle('on', !!this.#currentBookmark())
    }

    toggleBookmark() {
        if (!this.view?.lastLocation) return
        const existing = this.#currentBookmark()
        if (existing) {
            this.data.bookmarks = this.data.bookmarks.filter(b => b !== existing)
            toast('Marcador removido')
        } else {
            const loc = this.view.lastLocation
            const excerpt = loc.range?.toString().replace(/\s+/g, ' ').trim().slice(0, 140) ?? ''
            this.data.bookmarks.push({
                id: uid(), value: this.view.getCFI(loc.section?.current ?? 0, collapsed(loc.range, false)),
                chapter: loc.tocItem?.label ?? '', excerpt, fraction: loc.fraction,
                page: (this.isFixed ? loc.section?.current : loc.location?.current) + 1, created: Date.now(),
            })
            toast('Página marcada 🔖')
        }
        this.#saveData()
        this.#updateBookmarkBtn()
        if (this.panelName === 'notes') this.renderPanel()
    }

    // ======================================================================
    // Flashcards
    // ======================================================================
    async makeFlashcard(text, annotation) {
        this.#hideSelPop()
        const front = h('textarea.input', { rows: 3, placeholder: 'Pergunta (ex.: “O que o autor define como…?”)' })
        const back = h('textarea.input', { rows: 4 }, annotation?.note ? `${text}\n\n${annotation.note}` : text)
        const cloze = h('button.btn', {
            onclick: () => {
                // gera lacuna com a palavra mais longa do trecho
                const words = text.match(/[\p{L}\p{N}-]{5,}/gu) ?? []
                const target = words.sort((a, b) => b.length - a.length)[0]
                if (!target) return
                front.value = text.replace(target, '_____')
                back.value = target
            },
        }, 'Gerar lacuna (cloze)')
        modal({
            title: 'Novo flashcard',
            body: h('div.form',
                h('label.field', h('span', 'Frente'), front),
                h('label.field', h('span', 'Verso'), back),
                h('div.row', cloze, h('small.muted', 'Os cartões entram na revisão espaçada da tela “Revisão”.'))),
            actions: [{ label: 'Cancelar' }, {
                label: 'Criar', primary: true, run: () => {
                    if (!front.value.trim()) { toast('Escreva a pergunta', { type: 'error' }); return false }
                    store.addCard({ bookId: this.rec.id, front: front.value.trim(), back: back.value.trim(), source: this.chapterLabel ?? '' })
                    toast('Flashcard criado 🧠')
                },
            }],
        })
    }

    // ======================================================================
    // Painéis laterais
    // ======================================================================
    togglePanel(name, forceOpen) {
        const panel = $('#panel', this.root)
        if (this.panelName === name && !forceOpen) {
            this.panelName = null
            panel.classList.remove('open')
            this.root.classList.remove('panel-open')
            if (name === 'search') this.view?.clearSearch()
        } else {
            this.panelName = name
            panel.classList.add('open')
            this.root.classList.add('panel-open')
            this.renderPanel()
        }
        $$('.reader-tools .icon-btn', this.root).forEach(b => b.classList.remove('active'))
        if (this.panelName) $(`#btn-${this.panelName}`, this.root)?.classList.add('active')
        setTimeout(() => this.view?.renderer?.render?.(), 320)
    }

    renderPanel() {
        const panel = $('#panel', this.root)
        const titles = {
            toc: 'Sumário', search: 'Buscar no livro', notes: 'Anotações e marcadores', notebook: 'Caderno de estudo',
            appearance: 'Aparência', translate: 'Tradutor e dicionário', ai: 'Assistente de estudo', info: 'Sobre o livro',
        }
        const body = h('div.panel-body')
        fill(panel, 
            h('header.panel-head', h('h3', titles[this.panelName]), iconBtn('close', 'Fechar', () => this.togglePanel(this.panelName))),
            body)
        const fn = {
            toc: this.#panelTOC, search: this.#panelSearch, notes: this.#panelNotes, notebook: this.#panelNotebook,
            appearance: this.#panelAppearance, translate: this.#panelTranslate, ai: this.#panelAI, info: this.#panelInfo,
        }[this.panelName]
        fn?.call(this, body)
    }

    // ----- sumário -----
    #panelTOC(body) {
        const toc = this.book?.toc ?? []
        if (!toc.length) { add(body, h('p.muted', 'Este livro não tem sumário.')); return }
        const make = (items, depth = 0) => h('ul.toc-list', items.map(item => h('li',
            h('button.toc-item', {
                style: { paddingLeft: `${10 + depth * 14}px` }, 'data-href': item.href,
                onclick: () => { this.view.goTo(item.href) },
            }, item.label?.trim() || '—'),
            item.subitems?.length ? make(item.subitems, depth + 1) : null)))
        add(body, make(toc))
        this.#highlightTOC(true)
    }

    #highlightTOC(scroll) {
        const href = this.view?.lastLocation?.tocItem?.href
        $$('.toc-item', this.root).forEach(b => b.classList.toggle('current', b.dataset.href === href))
        if (scroll) $('.toc-item.current', this.root)?.scrollIntoView({ block: 'center' })
    }

    // ----- busca -----
    #panelSearch(body) {
        const input = h('input.input#search-input', { placeholder: 'Palavra ou frase…', value: this.lastQuery ?? '' })
        const opt = (id, label) => h('label.check', h('input', { type: 'checkbox', id, checked: !!this.searchOpts?.[id] }), label)
        const results = h('div.search-results#search-results')
        input.addEventListener('keydown', e => { if (e.key === 'Enter') this.runSearch(input.value) })
        add(body, 
            h('div.search-box', input, h('button.btn.primary', { onclick: () => this.runSearch(input.value) }, 'Buscar')),
            h('div.row.wrap', opt('matchCase', 'Maiúsc./minúsc.'), opt('matchWholeWords', 'Palavra inteira'), opt('matchDiacritics', 'Acentos')),
            results)
        if (this.lastResults) results.append(...this.lastResults)
        setTimeout(() => input.focus(), 50)
    }

    async runSearch(query) {
        query = query?.trim()
        if (!query || !this.view) return
        const input = $('#search-input', this.root)
        if (input) input.value = query
        this.lastQuery = query
        const searchOpts = this.searchOpts = {
            matchCase: $('#matchCase', this.root)?.checked,
            matchWholeWords: $('#matchWholeWords', this.root)?.checked,
            matchDiacritics: $('#matchDiacritics', this.root)?.checked,
        }
        const out = $('#search-results', this.root)
        const list = h('div')
        const status = h('p.muted', 'Buscando…')
        fill(out, status, list)
        let count = 0
        const token = this.searchToken = {}
        for await (const r of this.view.search({ query, ...searchOpts, drawOptions: { color: '#e09a3c', width: 2, radius: 3 } })) {
            if (token !== this.searchToken) return
            if (r === 'done') break
            if (r.progress != null) { status.textContent = `Buscando… ${Math.round(r.progress * 100)}%`; continue }
            const items = r.subitems ?? [r]
            if (r.label != null) list.append(h('div.sr-chapter', r.label || 'Seção'))
            for (const { cfi, excerpt } of items) {
                count++
                list.append(h('button.sr-item', { onclick: () => this.view.goTo(cfi) },
                    excerpt.pre, h('mark', excerpt.match), excerpt.post))
            }
        }
        status.textContent = count ? `${count} resultado${count > 1 ? 's' : ''}` : 'Nada encontrado.'
        this.lastResults = [status, list]
    }

    // ----- anotações -----
    #panelNotes(body) {
        const f = this.notesFilter ??= { kind: 'all', color: '', q: '' }
        const anns = this.data.annotations.slice().sort((a, b) => (a.fraction ?? 0) - (b.fraction ?? 0))
        const bms = this.data.bookmarks.slice().sort((a, b) => (a.fraction ?? 0) - (b.fraction ?? 0))
        const tabs = h('div.seg', [['all', `Tudo (${anns.length + bms.length})`], ['notes', 'Com nota'], ['bookmarks', `Marcadores (${bms.length})`]]
            .map(([k, l]) => h('button', { class: f.kind === k ? 'on' : '', onclick: () => { f.kind = k; this.renderPanel() } }, l)))
        const colors = h('div.swatches.small',
            h('button.swatch.all', { class: !f.color ? 'active' : '', title: 'Todas as cores', onclick: () => { f.color = ''; this.renderPanel() } }, '∗'),
            Object.entries(COLORS).map(([k, c]) => h('button.swatch', {
                style: { background: c.hex }, title: c.name, class: f.color === k ? 'active' : '',
                onclick: () => { f.color = f.color === k ? '' : k; this.renderPanel() },
            })))
        const q = h('input.input', { placeholder: 'Filtrar…', value: f.q, oninput: debounce(e => { f.q = e.target.value; this.renderPanel(); $('#panel input.input')?.focus() }, 300) })
        const list = h('div.ann-list')
        const match = t => !f.q || t?.toLowerCase().includes(f.q.toLowerCase())
        if (f.kind !== 'bookmarks') for (const a of anns) {
            if (f.kind === 'notes' && !a.note) continue
            if (f.color && a.color !== f.color) continue
            if (!match(a.text) && !match(a.note)) continue
            list.append(h('div.ann', { style: { '--c': COLORS[a.color]?.hex ?? '#f6c84c' } },
                h('div.ann-meta', h('span', a.chapter || ''), h('span', fmtDateTime(a.created))),
                h(`blockquote.ann-text.${a.style}`, { onclick: () => this.view.goTo(a.value) }, a.text),
                a.note ? h('div.ann-note', a.note) : null,
                h('div.ann-actions',
                    iconBtn('edit', 'Nota', () => this.editNote(a)),
                    iconBtn('cards', 'Flashcard', () => this.makeFlashcard(a.text, a)),
                    iconBtn('translate', 'Traduzir', () => this.openTranslate(a.text)),
                    iconBtn('copy', 'Copiar', () => { navigator.clipboard.writeText(a.text); toast('Copiado') }),
                    iconBtn('trash', 'Apagar', () => this.deleteAnnotation(a)))))
        }
        if (f.kind !== 'notes' && !f.color) for (const b of bms) {
            if (!match(b.excerpt) && !match(b.chapter)) continue
            list.append(h('div.ann.bm',
                h('div.ann-meta', h('span', icon('bookmark', 14), ` Pág. ${b.page ?? '?'} · ${b.chapter ?? ''}`), h('span', fmtDateTime(b.created))),
                h('div.ann-text', { onclick: () => this.view.goTo(b.value) }, b.excerpt ? `${b.excerpt}…` : `${Math.round(b.fraction * 100)}%`),
                h('div.ann-actions', iconBtn('trash', 'Remover', () => {
                    this.data.bookmarks = this.data.bookmarks.filter(x => x !== b)
                    this.#saveData(); this.#updateBookmarkBtn(); this.renderPanel()
                }))))
        }
        if (!list.children.length) list.append(h('div.empty-small',
            h('p', 'Nada por aqui ainda.'),
            h('p.muted', 'Selecione um trecho do livro para destacar, sublinhar ou anotar. Use Ctrl+B para marcar a página.')))
        add(body, tabs, h('div.row', colors), q, list,
            h('div.panel-foot',
                h('button.btn', { onclick: () => exportAnnotations(this.rec, this.data, 'md') }, icon('download', 16), ' Exportar Markdown'),
                h('button.btn', { onclick: () => exportAnnotations(this.rec, this.data, 'html') }, 'HTML'),
                h('button.btn', { onclick: () => exportAnnotations(this.rec, this.data, 'txt') }, 'TXT'),
                h('button.btn', {
                    onclick: () => {
                        let n = 0
                        for (const a of this.data.annotations) {
                            if (store.study.cards.some(c => c.annotationId === a.id)) continue
                            store.addCard({ bookId: this.rec.id, annotationId: a.id, front: a.note ? a.note : `Complete/explique: “${a.text.slice(0, 200)}”`, back: a.text, source: a.chapter })
                            n++
                        }
                        toast(n ? `${n} flashcards criados a partir dos destaques` : 'Todos os destaques já viraram flashcards')
                    },
                }, icon('cards', 16), ' Destaques → flashcards')))
    }

    // ----- caderno -----
    #panelNotebook(body) {
        const ta = h('textarea.notebook', {
            placeholder: 'Seu caderno para este livro.\n\nDicas:\n• Escreva um resumo de cada capítulo com suas palavras.\n• Anote perguntas e conexões com outras leituras.\n• Use # para títulos e - para listas.',
            oninput: debounce(() => { this.data.notes = ta.value; this.#saveData() }, 400),
        }, this.data.notes ?? '')
        const insert = text => {
            const pos = ta.selectionStart ?? ta.value.length
            ta.value = ta.value.slice(0, pos) + text + ta.value.slice(pos)
            ta.focus()
            ta.selectionStart = ta.selectionEnd = pos + text.length
            this.data.notes = ta.value
            this.#saveData()
        }
        add(body, 
            h('div.row.wrap',
                h('button.btn', { onclick: () => insert(`\n## ${this.chapterLabel || 'Capítulo'}\n\n`) }, '+ Título do capítulo'),
                h('button.btn', {
                    onclick: () => {
                        const t = this.selection?.text ?? this.view?.lastLocation?.range?.toString().trim().slice(0, 300)
                        if (t) insert(`\n> ${t.replace(/\s+/g, ' ')}\n\n`)
                    },
                }, '+ Citação'),
                h('button.btn', { onclick: () => insert(`\n- [ ] `) }, '+ Tarefa'),
                h('button.btn', {
                    onclick: () => window.api.file.saveText({
                        defaultName: `${this.rec.title} - caderno.md`, content: `# ${this.rec.title}\n\n${ta.value}`,
                        filters: [{ name: 'Markdown', extensions: ['md'] }, { name: 'Texto', extensions: ['txt'] }],
                    }).then(p => p && toast('Caderno exportado')),
                }, icon('download', 16), ' Exportar')),
            ta,
            h('p.muted.small', 'Salvo automaticamente.'))
    }

    // ----- aparência -----
    #panelAppearance(body) {
        const s = this.settings
        const section = (title, ...children) => h('section.ap-sec', h('h4', title), ...children)
        const slider = (key, label, min, max, step, unit = '', fmt) => {
            const val = h('span.val', fmt ? fmt(s[key]) : `${s[key]}${unit}`)
            return h('label.slider',
                h('span.lbl', label), val,
                h('input', {
                    type: 'range', min, max, step, value: s[key],
                    oninput: e => {
                        const v = parseFloat(e.target.value)
                        val.textContent = fmt ? fmt(v) : `${v}${unit}`
                        this.setSettingLive(key, v)
                    },
                }))
        }
        const toggle = (key, label) => h('label.switch',
            h('input', { type: 'checkbox', checked: !!s[key], onchange: e => this.setSetting(key, e.target.checked) }),
            h('span.track'), h('span', label))

        const themes = h('div.theme-grid', Object.entries(THEMES).map(([k, t]) => h('button.theme-chip', {
            class: s.theme === k ? 'on' : '', title: t.name,
            style: { background: k === 'custom' ? `linear-gradient(135deg, ${s.customBg} 50%, ${s.customFg} 50%)` : t.bg, color: t.fg },
            onclick: () => {
                if (getTheme({ ...s, theme: k }).dark) s.lastDarkTheme = k; else s.lastLightTheme = k
                this.setSetting('theme', k); this.renderPanel()
            },
        }, h('span.aa', 'Aa'), h('span.tn', t.name))))
        const custom = s.theme === 'custom' ? h('div.row',
            h('label.color', 'Fundo', h('input', { type: 'color', value: s.customBg, oninput: e => this.setSettingLive('customBg', e.target.value) })),
            h('label.color', 'Texto', h('input', { type: 'color', value: s.customFg, oninput: e => this.setSettingLive('customFg', e.target.value) }))) : null

        if (this.isFixed) {
            add(body, 
                section('Tema', themes, custom, toggle('pdfDarkInvert', 'Inverter cores do PDF/quadrinho em temas escuros')),
                section('Zoom',
                    h('div.row.wrap',
                        h('button.btn', { onclick: () => this.#zoom('fit-page') }, 'Página inteira'),
                        h('button.btn', { onclick: () => this.#zoom('fit-width') }, 'Ajustar largura'),
                        iconBtn('zoomOut', 'Diminuir', () => this.#zoom(1 / 1.15)),
                        iconBtn('zoomIn', 'Aumentar', () => this.#zoom(1.15)))),
                section('Conforto visual',
                    slider('brightness', 'Brilho', 40, 120, 1, '%'),
                    slider('warmth', 'Luz noturna (tom quente)', 0, 100, 1, '%')),
                h('p.muted.small', 'PDFs e quadrinhos têm layout fixo: as opções de fonte e espaçamento valem para EPUB, MOBI, AZW3, FB2, DOCX, TXT e outros formatos de texto.'))
            return
        }

        const fontSel = h('select.input', {
            onchange: e => { this.setSetting('fontFamily', e.target.value); this.renderPanel() },
        }, (() => {
            const groups = {}
            for (const f of FONTS) (groups[f.kind] ??= []).push(f)
            return Object.entries(groups).map(([kind, fonts]) => h('optgroup', { label: kind },
                fonts.map(f => h('option', { value: f.name, selected: s.fontFamily === f.name }, f.name))))
        })())
        const fontPreview = h('div.font-preview', {
            style: { fontFamily: FONTS.find(f => f.name === s.fontFamily)?.system ?? `"${s.fontFamily}", Georgia, serif` },
        }, 'O sábio não diz tudo o que pensa, mas pensa tudo o que diz.')

        const layoutSeg = h('div.seg', [['auto', '2 páginas'], ['single', '1 página'], ['scrolled', 'Rolagem']]
            .map(([k, l]) => h('button', { class: s.layout === k ? 'on' : '', onclick: () => { this.setSetting('layout', k); this.renderPanel() } }, l)))

        add(body, 
            section('Tema', themes, custom),
            section('Fonte', fontSel, fontPreview,
                slider('fontSize', 'Tamanho', 10, 44, 1, 'px'),
                slider('fontWeight', 'Peso', 300, 700, 100, '', v => v <= 300 ? 'Leve' : v <= 400 ? 'Normal' : v <= 500 ? 'Médio' : v <= 600 ? 'Semi' : 'Negrito'),
                toggle('overrideFont', 'Usar esta fonte no livro todo (ignorar a do livro)')),
            section('Texto',
                slider('lineHeight', 'Altura da linha', 1, 2.6, 0.05, '', v => v.toFixed(2)),
                slider('paragraphSpacing', 'Espaço entre parágrafos', 0, 2, 0.1, 'em'),
                slider('textIndent', 'Recuo da 1ª linha', 0, 4, 0.25, 'em'),
                slider('letterSpacing', 'Espaçamento de letras', -0.05, 0.25, 0.01, 'em'),
                slider('wordSpacing', 'Espaçamento de palavras', 0, 0.6, 0.02, 'em'),
                toggle('justify', 'Justificar texto'),
                toggle('hyphenate', 'Hifenização automática')),
            section('Página e layout', layoutSeg,
                slider('pageWidth', 'Largura da página', 380, 1100, 10, 'px'),
                slider('margin', 'Margem superior/inferior', 16, 140, 2, 'px'),
                slider('gap', 'Margens laterais', 2, 16, 0.5, '%'),
                toggle('bookFrame', 'Aparência de livro (bordas de páginas e lombada)'),
                toggle('paperTexture', 'Textura de papel'),
                toggle('showHeaderFooter', 'Cabeçalho e número de página'),
                toggle('animated', 'Animação ao virar página'),
                toggle('pageSound', 'Som de folha ao virar página')),
            section('Conforto visual',
                slider('brightness', 'Brilho', 40, 120, 1, '%'),
                slider('warmth', 'Luz noturna (tom quente)', 0, 100, 1, '%')),
            h('div.row', h('button.btn', {
                onclick: async () => {
                    const { DEFAULT_SETTINGS } = await import('./store.js')
                    for (const k of ['theme', 'fontFamily', 'fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing', 'paragraphSpacing',
                        'textIndent', 'fontWeight', 'justify', 'hyphenate', 'overrideFont', 'layout', 'pageWidth', 'margin', 'gap',
                        'animated', 'paperTexture', 'bookFrame', 'showHeaderFooter', 'brightness', 'warmth']) s[k] = DEFAULT_SETTINGS[k]
                    this.setSetting('theme', s.theme); this.renderPanel()
                },
            }, icon('undo', 16), ' Restaurar padrão')))
    }

    setSettingLive = (() => {
        const apply = debounce(() => this.applyAppearance(), 120)
        return (key, value) => {
            this.settings[key] = value
            store.save('settings')
            apply()
        }
    })()

    // ----- tradutor / dicionário -----
    openTranslate(text, opts = {}) {
        this.translateText = text
        this.translateOpts = opts
        this.#hideSelPop()
        this.togglePanel('translate', true)
    }

    #panelTranslate(body) {
        const s = this.settings
        const text = this.translateText ?? ''
        const src = h('textarea.input', { rows: 4, placeholder: 'Selecione um trecho no livro ou digite aqui…' }, text)
        const target = h('select.input', {
            onchange: e => { s.targetLang = e.target.value; store.save('settings'); run() },
        }, LANGS.map(([c, n]) => h('option', { value: c, selected: s.targetLang === c }, n)))
        const out = h('div.tr-out')
        const dictOut = h('div.dict-out')
        const wikiOut = h('div.wiki-out')
        const run = async () => {
            const t = src.value.trim()
            if (!t) return
            fill(out, h('p.muted', 'Traduzindo…'))
            const r = await window.api.net.translate({ text: t, to: s.targetLang })
            if (r.error) { fill(out, h('p.error', r.error)); return }
            this.detectedLang = r.detected
            fill(out, 
                h('div.tr-result', r.translation),
                r.alternatives?.length ? h('div.tr-alts', r.alternatives.map(a => h('div', h('em', a.pos), ': ', a.terms.join(', ')))) : null,
                h('div.row.wrap',
                    h('button.btn', { onclick: () => speak(t, r.detected) }, icon('volume', 16), ' Ouvir original'),
                    h('button.btn', { onclick: () => speak(r.translation, s.targetLang) }, icon('volume', 16), ' Ouvir tradução'),
                    h('button.btn', { onclick: () => { navigator.clipboard.writeText(r.translation); toast('Copiado') } }, icon('copy', 16)),
                    t.split(/\s+/).length <= 6 ? h('button.btn', {
                        onclick: () => { this.#saveVocab(t, r.translation, r.detected); toast('Salvo no vocabulário') },
                    }, icon('star', 16), ' Salvar no vocabulário') : null),
                h('small.muted', `Detectado: ${r.detected ?? '?'} · via ${r.provider}`))
            if (s.autoSaveVocab && t.split(/\s+/).length <= 3) this.#saveVocab(t, r.translation, r.detected)
        }
        const dict = async () => {
            const word = src.value.trim().split(/\s+/).slice(0, 3).join(' ')
            if (!word) return
            fill(dictOut, h('p.muted', 'Consultando dicionário…'))
            const lang = (this.detectedLang || this.language || s.dictLang || 'en').slice(0, 2)
            const r = await window.api.net.dictionary({ word, lang })
            if (!r.results?.length) { fill(dictOut, h('p.muted', r.error ?? 'Nada encontrado.')); return }
            fill(dictOut, h('h4', word, r.results[0]?.phonetic ? h('span.muted', ` ${r.results[0].phonetic}`) : ''),
                r.audio ? h('button.btn', { onclick: () => new Audio(r.audio).play() }, icon('volume', 16), ' Pronúncia') : null,
                r.results.map(x => h('div.def',
                    h('div.pos', x.pos),
                    h('ol', x.definitions.map(d => h('li', d.text, d.example ? h('div.ex', `“${d.example}”`) : null))),
                    x.synonyms?.length ? h('div.syn', 'Sinônimos: ', x.synonyms.join(', ')) : null)),
                h('small.muted', `Fonte: ${r.source}`))
        }
        const wiki = async () => {
            const term = src.value.trim()
            if (!term) return
            fill(wikiOut, h('p.muted', 'Buscando na Wikipédia…'))
            const r = await window.api.net.wikipedia({ term, lang: s.wikiLang })
            if (r.error) { fill(wikiOut, h('p.muted', r.error)); return }
            fill(wikiOut, h('div.wiki',
                r.thumbnail ? h('img', { src: r.thumbnail, alt: '' }) : null,
                h('h4', r.title), h('p', r.extract),
                r.url ? h('button.link', { onclick: () => window.api.app.openExternal(r.url) }, 'Abrir artigo completo ↗') : null))
        }
        add(body, src,
            h('div.row', h('span.muted', 'Para'), target, h('button.btn.primary', { onclick: run }, 'Traduzir')),
            h('div.row.wrap',
                h('button.btn', { onclick: dict }, icon('dictionary', 16), ' Dicionário'),
                h('button.btn', { onclick: wiki }, icon('globe', 16), ' Wikipédia'),
                h('button.btn', {
                    onclick: () => {
                        const t = this.view?.lastLocation?.range?.toString().replace(/\s+/g, ' ').trim()
                        if (t) { src.value = t.slice(0, 4800); run() }
                    },
                }, icon('bookOpen', 16), ' Traduzir página atual')),
            out, dictOut, wikiOut,
            h('p.muted.small', 'Tradução, dicionário e Wikipédia precisam de internet.'))
        if (text) {
            if (this.translateOpts?.dictionary) dict()
            else if (this.translateOpts?.wiki) wiki()
            else run()
            this.translateOpts = {}
        }
    }

    #saveVocab(word, translation, lang) {
        const context = this.selection?.range?.startContainer?.parentElement?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 300) ?? ''
        store.addVocab({ word, translation, lang, context, bookId: this.rec.id, bookTitle: this.rec.title })
    }

    // ----- assistente IA -----
    #chapterText() {
        const doc = this.view?.renderer.getContents()[0]?.doc
        return doc?.body?.innerText?.replace(/\n{3,}/g, '\n\n') ?? ''
    }

    explainWithAI(text) {
        this.#hideSelPop()
        this.togglePanel('ai', true)
        this.#aiSend(`Explique este trecho do livro no contexto em que aparece. Esclareça vocabulário difícil, referências e o significado mais profundo:\n\n“${text}”`)
    }

    #panelAI(body) {
        if (!aiReady()) {
            add(body, h('div.ai-setup',
                icon('sparkles', 32),
                h('h4', 'Assistente de estudo com Claude'),
                h('p', 'Resumos de capítulos, explicações de trechos, quizzes, mapas mentais, flashcards automáticos e conversa sobre o livro.'),
                h('p.muted', 'Para usar, cole sua chave da API da Anthropic em Configurações. A chave fica salva só neste computador.'),
                h('button.btn.primary', { onclick: () => this.app.showSettings('ai') }, 'Abrir configurações')))
            return
        }
        this.data.chat ??= []
        const log = h('div.chat-log#chat-log')
        const renderLog = () => {
            fill(log, ...this.data.chat.map(m => h(`div.msg.${m.role}`,
                m.role === 'assistant' ? h('div.md', { html: renderMarkdown(m.content) }) : h('div', m.content))))
            if (!this.data.chat.length) log.append(h('div.chat-empty',
                h('p', `Pergunte qualquer coisa sobre “${this.rec.title}”.`),
                h('p.muted', 'O assistente lê o capítulo em que você está.')))
            log.scrollTop = log.scrollHeight
        }
        this.renderChatLog = renderLog
        const input = h('textarea.input.chat-input', { rows: 2, placeholder: 'Pergunte ao livro… (Enter envia, Shift+Enter quebra linha)' })
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const v = input.value.trim(); if (v) { input.value = ''; this.#aiSend(v) } }
        })
        body.classList.add('ai-body')
        add(body, 
            h('div.quick', QUICK_PROMPTS.map(p => h('button.chip', { onclick: () => this.#aiSend(p.prompt, p.label) }, icon(p.icon, 14), p.label)),
                h('button.chip', { onclick: () => this.#aiFlashcards() }, icon('cards', 14), 'Flashcards automáticos')),
            log,
            h('div.chat-compose', input,
                h('div.col',
                    iconBtn('send', 'Enviar', () => { const v = input.value.trim(); if (v) { input.value = ''; this.#aiSend(v) } }),
                    iconBtn('trash', 'Limpar conversa', () => { this.data.chat = []; this.#saveData(); renderLog() }))))
        renderLog()
    }

    async #aiSend(prompt, label) {
        if (!aiReady()) return this.togglePanel('ai', true)
        if (this.aiBusy) return toast('Aguarde a resposta atual…')
        this.data.chat ??= []
        this.data.chat.push({ role: 'user', content: label ? `${label} — ${this.chapterLabel || 'capítulo atual'}` : prompt })
        const history = this.data.chat.map(m => ({ role: m.role, content: m.content }))
        history[history.length - 1] = { role: 'user', content: prompt }
        const reply = { role: 'assistant', content: '' }
        this.data.chat.push(reply)
        this.renderChatLog?.()
        const log = $('#chat-log', this.root)
        const last = log?.lastElementChild?.querySelector('.md')
        if (last) last.innerHTML = '<p class="muted">Pensando…</p>'
        this.aiBusy = true
        const { promise } = aiChat({
            book: { title: this.rec.title, author: this.rec.author },
            chapterLabel: this.chapterLabel, chapterText: this.#chapterText(), history,
        }, delta => {
            reply.content += delta
            const el = $('#chat-log', this.root)?.lastElementChild?.querySelector('.md')
            if (el) { el.innerHTML = renderMarkdown(reply.content); el.parentElement.parentElement.scrollTop = 1e9 }
        })
        const r = await promise
        this.aiBusy = false
        if (r.error) reply.content = `⚠️ ${r.error}`
        else if (r.text) reply.content = r.text
        this.#saveData()
        this.renderChatLog?.()
    }

    async #aiFlashcards() {
        if (this.aiBusy) return
        this.aiBusy = true
        toast('Gerando flashcards do capítulo…', { timeout: 5000 })
        const r = await aiFlashcards({
            book: { title: this.rec.title, author: this.rec.author },
            chapterLabel: this.chapterLabel, chapterText: this.#chapterText(),
        })
        this.aiBusy = false
        if (r.error) return toast(r.error, { type: 'error', timeout: 6000 })
        const cards = r.data?.cards ?? []
        const checks = cards.map(() => h('input', { type: 'checkbox', checked: true }))
        modal({
            title: `${cards.length} flashcards sugeridos`, wide: true,
            body: h('div.fc-suggest', cards.map((c, i) => h('label.fc-item', checks[i],
                h('div', h('strong', c.front), h('div.muted', c.back))))),
            actions: [{ label: 'Cancelar' }, {
                label: 'Adicionar selecionados', primary: true, run: () => {
                    let n = 0
                    cards.forEach((c, i) => { if (checks[i].checked) { store.addCard({ bookId: this.rec.id, front: c.front, back: c.back, source: this.chapterLabel }); n++ } })
                    toast(`${n} flashcards adicionados à revisão 🧠`)
                },
            }],
        })
    }

    // ----- informações -----
    #panelInfo(body) {
        const rec = this.rec
        const m = this.book?.metadata ?? {}
        const row = (k, v) => v ? h('div.kv', h('span', k), h('span', v)) : null
        const statusSel = h('select.input', {
            onchange: e => store.updateBook(rec.id, { status: e.target.value }),
        }, [['want', 'Quero ler'], ['reading', 'Lendo'], ['done', 'Concluído'], ['paused', 'Pausado'], ['dropped', 'Abandonado']]
            .map(([v, l]) => h('option', { value: v, selected: rec.status === v }, l)))
        const stars = h('div.stars', [1, 2, 3, 4, 5].map(n => h('button', {
            class: (rec.rating ?? 0) >= n ? 'on' : '', title: `${n} estrela${n > 1 ? 's' : ''}`,
            onclick: () => { store.updateBook(rec.id, { rating: rec.rating === n ? 0 : n }); this.renderPanel() },
        }, '★')))
        add(body, 
            rec.cover ? h('img.info-cover', { src: rec.cover, alt: '' }) : null,
            h('h3.info-title', formatText(m.title) || rec.title),
            h('p.info-author', formatText(m.author) || rec.author || ''),
            h('div.row', h('span.muted', 'Status'), statusSel),
            h('div.row', h('span.muted', 'Avaliação'), stars),
            h('div.kvs',
                row('Formato', FORMAT_LABEL[rec.ext] ?? rec.ext),
                row('Progresso', `${Math.round((rec.progress ?? 0) * 100)}%`),
                row('Tempo de leitura', fmtDuration(rec.totalTime ?? 0)),
                row('Destaques', String(this.data.annotations.length)),
                row('Notas', String(this.data.annotations.filter(a => a.note).length)),
                row('Marcadores', String(this.data.bookmarks.length)),
                row('Flashcards', String(store.study.cards.filter(c => c.bookId === rec.id).length)),
                row('Editora', formatText(m.publisher)),
                row('Idioma', formatLang(m.language)),
                row('Publicado', fmtPublished(formatText(m.published))),
                row('Arquivo', rec.originalName)),
            m.description ? h('div.info-desc', { html: sanitizeDesc(formatText(m.description)) }) : null,
            h('div.row.wrap',
                h('button.btn', { onclick: () => window.api.books.showInFolder(rec.fileName) }, icon('folder', 16), ' Mostrar arquivo'),
                h('button.btn', { onclick: () => this.app.showShortcuts() }, icon('keyboard', 16), ' Atalhos')))
    }

    // ======================================================================
    // Leitura em voz alta
    // ======================================================================
    toggleTTS() {
        if (!window.speechSynthesis) return toast('Leitura em voz alta indisponível neste sistema', { type: 'error' })
        if (this.tts.playing) this.tts.toggle()
        else this.tts.start()
    }

    #renderTTSBar() {
        const bar = $('#tts-bar', this.root)
        const t = this.tts
        $('#btn-tts', this.root)?.classList.toggle('on', t.playing)
        if (!t.playing) { bar.classList.remove('show'); return }
        const s = this.settings
        const voices = ReadAloud.voices()
        fill(bar, 
            iconBtn('back', 'Parágrafo anterior', () => t.prev()),
            iconBtn(t.paused ? 'play' : 'pause', t.paused ? 'Continuar' : 'Pausar', () => t.toggle()),
            iconBtn('next', 'Próximo parágrafo', () => t.next()),
            h('label.tts-rate', 'Velocidade',
                h('input', {
                    type: 'range', min: 0.5, max: 2.5, step: 0.1, value: s.ttsRate,
                    onchange: e => { s.ttsRate = parseFloat(e.target.value); store.save('settings'); t.restartChunk() },
                })),
            h('select.input.small', {
                onchange: e => { s.ttsVoice = e.target.value; store.save('settings'); t.restartChunk() },
            }, h('option', { value: '' }, 'Voz automática'),
                voices.map(v => h('option', { value: v.voiceURI, selected: s.ttsVoice === v.voiceURI }, `${v.name} (${v.lang})`))),
            iconBtn('stop', 'Parar', () => t.stop()))
        bar.classList.add('show')
    }

    // ======================================================================
    // Ferramentas de foco
    // ======================================================================
    toggleAutoTurn() {
        if (this.autoTurn) return this.#stopAutoTurn(true)
        const secs = this.settings.autoTurnSeconds
        this.autoTurn = setInterval(() => {
            if (document.hidden || $('.sel-pop.show', this.root)) return
            this.next()
        }, secs * 1000)
        $('#btn-autoturn', this.root).classList.add('on')
        toast(`Virando páginas a cada ${secs} s (ajuste em Configurações)`)
    }
    #stopAutoTurn(msg) {
        clearInterval(this.autoTurn)
        this.autoTurn = null
        $('#btn-autoturn', this.root)?.classList.remove('on')
        if (msg) toast('Virada automática desligada')
    }

    toggleRuler() {
        this.rulerOn = !this.rulerOn
        $('#ruler', this.root).classList.toggle('show', this.rulerOn)
        $('#btn-ruler', this.root).classList.toggle('on', this.rulerOn)
        if (this.rulerOn) toast('Régua de leitura: mova o mouse sobre as linhas')
    }
    #moveRuler(y) {
        if (!this.rulerOn) return
        const stage = $('#stage', this.root).getBoundingClientRect()
        const lh = this.settings.fontSize * this.settings.lineHeight
        $('#ruler', this.root).style.top = `${y - stage.top - lh * 0.75}px`
        $('#ruler', this.root).style.height = `${lh * 1.5}px`
    }

    toggleFocus() {
        this.root.classList.toggle('focus-mode')
        $('#btn-focus', this.root)?.classList.toggle('on', this.root.classList.contains('focus-mode'))
        if (this.root.classList.contains('focus-mode')) toast('Modo foco — passe o mouse no topo para ver os controles. Esc para sair.')
        setTimeout(() => this.view?.renderer?.render?.(), 250)
    }

    togglePomodoro() {
        const label = $('#timer-label', this.root)
        if (this.pomo) {
            clearInterval(this.pomo.t)
            this.pomo = null
            label.textContent = ''
            $('#btn-timer', this.root).classList.remove('on', 'break')
            toast('Sessão de foco encerrada')
            return
        }
        const start = (phase) => {
            const mins = phase === 'focus' ? this.settings.pomodoroMinutes : this.settings.breakMinutes
            const end = Date.now() + mins * 60000
            clearInterval(this.pomo?.t)
            this.pomo = { phase, end, t: setInterval(tick, 1000) }
            $('#btn-timer', this.root).classList.add('on')
            $('#btn-timer', this.root).classList.toggle('break', phase === 'break')
            tick()
        }
        const tick = () => {
            const left = Math.max(0, this.pomo.end - Date.now())
            const m = Math.floor(left / 60000), sec = Math.floor(left / 1000) % 60
            label.textContent = `${m}:${String(sec).padStart(2, '0')}`
            if (left <= 0) {
                chime()
                if (this.pomo.phase === 'focus') { toast('⏰ Hora da pausa! Descanse os olhos.', { timeout: 8000 }); start('break') }
                else { toast('Pausa terminada. Bora ler! 📖', { timeout: 6000 }); start('focus') }
            }
        }
        start('focus')
        toast(`Sessão de foco de ${this.settings.pomodoroMinutes} min iniciada`)
    }

    // ======================================================================
    // Tempo de leitura
    // ======================================================================
    markActivity() { this.lastActivity = Date.now() }

    #startSessionTimer() {
        this.sessionAccum = 0
        this.pagesThisSession = 0
        this.lastTick = Date.now()
        clearInterval(this.sessionTimer)
        this.sessionTimer = setInterval(() => {
            const now = Date.now()
            const dt = now - this.lastTick
            this.lastTick = now
            const active = !document.hidden && (now - this.lastActivity < 180000 || this.tts.playing || this.autoTurn)
            if (active && dt < 60000) this.sessionAccum += dt
            if (this.sessionAccum >= 30000) this.#flushSession()
        }, 5000)
    }

    #flushSession() {
        if (!this.rec || !(this.sessionAccum > 0)) return
        store.addReading(this.rec.id, this.sessionAccum, this.pagesThisSession ?? 0)
        this.sessionAccum = 0
        this.pagesThisSession = 0
    }
}

const fmtPublished = s => {
    if (!s) return ''
    const d = new Date(s)
    return isNaN(d) || !/^\d{4}-\d{2}/.test(s) ? s : d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const collapsed = (range, toEnd) => {
    const r = range.cloneRange()
    r.collapse(!toEnd)
    return r
}

const sanitizeDesc = html => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    for (const el of doc.querySelectorAll('script, style, iframe, img, object')) el.remove()
    for (const el of doc.querySelectorAll('*')) for (const a of Array.from(el.attributes)) if (a.name !== 'href') el.removeAttribute(a.name)
    for (const a of doc.querySelectorAll('a')) a.removeAttribute('href')
    return doc.body.innerHTML
}

// som sintetizado de folha virando
let audioCtx
const playPageSound = () => {
    try {
        audioCtx ??= new AudioContext()
        const dur = 0.28
        const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length
            data[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * t), 2) * (1 - t * 0.6)
        }
        const src = audioCtx.createBufferSource()
        src.buffer = buf
        const filter = audioCtx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 2400
        filter.Q.value = 0.6
        const gain = audioCtx.createGain()
        gain.gain.value = 0.12
        src.connect(filter).connect(gain).connect(audioCtx.destination)
        src.start()
    } catch {}
}

const chime = () => {
    try {
        audioCtx ??= new AudioContext()
        for (const [i, f] of [660, 880, 990].entries()) {
            const o = audioCtx.createOscillator()
            const g = audioCtx.createGain()
            o.frequency.value = f
            g.gain.setValueAtTime(0.0001, audioCtx.currentTime + i * 0.18)
            g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + i * 0.18 + 0.02)
            g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + i * 0.18 + 0.6)
            o.connect(g).connect(audioCtx.destination)
            o.start(audioCtx.currentTime + i * 0.18)
            o.stop(audioCtx.currentTime + i * 0.18 + 0.7)
        }
    } catch {}
}

