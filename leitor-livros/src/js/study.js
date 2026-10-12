// Estudo: revisão espaçada de flashcards, vocabulário e todas as anotações
import { store, schedule, intervalPreview } from './store.js'
import { $, h, icon, iconBtn, toast, modal, confirmDialog, fmtDate, fmtDateTime, fill } from './ui.js'
import { speak } from './tts.js'
import { annotationsToMarkdown } from './exporter.js'

const COLOR_HEX = { amarelo: '#f6c84c', verde: '#7cc47f', azul: '#5fa8e8', rosa: '#ef86b0', laranja: '#f59e4c', roxo: '#a98be0' }

export const dueCards = () => store.study.cards.filter(c => c.due <= Date.now())

// ---------------------------------------------------------------- Revisão
export class Review {
    constructor(app) {
        this.app = app
        this.root = $('#review-view')
        this.bookFilter = ''
    }

    render() {
        const cards = store.study.cards
        const due = dueCards().filter(c => !this.bookFilter || c.bookId === this.bookFilter)
        const books = [...new Set(cards.map(c => c.bookId))].map(id => store.book(id)).filter(Boolean)
        const learned = cards.filter(c => c.interval >= 21).length
        fill(this.root, 
            h('header.page-head',
                h('div', h('h1', 'Revisão'), h('p.muted', 'Repetição espaçada: revise no momento certo para nunca mais esquecer o que leu.')),
                h('div.lib-actions', h('button.btn', { onclick: () => this.#newCard() }, icon('plus', 16), ' Novo cartão'))),
            h('div.tiles',
                tile('Para revisar hoje', due.length, 'cards'),
                tile('Total de cartões', cards.length, 'layers'),
                tile('Memorizados (21+ dias)', learned, 'check')),
            books.length > 1 ? h('div.chips',
                h('button.chip', { class: !this.bookFilter ? 'on' : '', onclick: () => { this.bookFilter = ''; this.render() } }, 'Todos os livros'),
                books.map(b => h('button.chip', { class: this.bookFilter === b.id ? 'on' : '', onclick: () => { this.bookFilter = b.id; this.render() } }, b.title))) : null,
            due.length
                ? h('div.center', h('button.btn.primary.big', { onclick: () => this.#session(due) }, icon('play', 18), ` Começar revisão (${due.length})`))
                : h('div.empty', icon('check', 48), h('h2', cards.length ? 'Tudo revisado por hoje!' : 'Nenhum flashcard ainda'),
                    h('p.muted', cards.length ? 'Volte amanhã para continuar fortalecendo sua memória.'
                        : 'Crie cartões selecionando um trecho no leitor → “Flashcard”, ou peça ao assistente de IA para gerar automaticamente.')),
            cards.length ? h('h3.section-title', 'Todos os cartões') : null,
            cards.length ? h('div.card-table', cards.filter(c => !this.bookFilter || c.bookId === this.bookFilter)
                .sort((a, b) => a.due - b.due).map(c => h('div.ct-row',
                    h('div.ct-main', h('strong', c.front), h('div.muted', c.back)),
                    h('small.muted', store.book(c.bookId)?.title ?? ''),
                    h('small', c.due <= Date.now() ? 'agora' : fmtDate(c.due)),
                    iconBtn('edit', 'Editar', () => this.#newCard(c)),
                    iconBtn('trash', 'Apagar', async () => {
                        if (!await confirmDialog('Apagar cartão', 'Apagar este flashcard?', { okLabel: 'Apagar', danger: true })) return
                        store.study.cards = store.study.cards.filter(x => x !== c)
                        store.save('study'); this.render()
                    })))) : null)
    }

    #newCard(card) {
        const front = h('textarea.input', { rows: 3 }, card?.front ?? '')
        const back = h('textarea.input', { rows: 4 }, card?.back ?? '')
        const bookSel = h('select.input', h('option', { value: '' }, '— Nenhum livro —'),
            store.library.books.map(b => h('option', { value: b.id, selected: card?.bookId === b.id }, b.title)))
        modal({
            title: card ? 'Editar cartão' : 'Novo cartão',
            body: h('div.form', h('label.field', h('span', 'Frente (pergunta)'), front),
                h('label.field', h('span', 'Verso (resposta)'), back), h('label.field', h('span', 'Livro'), bookSel)),
            actions: [{ label: 'Cancelar' }, {
                label: 'Salvar', primary: true, run: () => {
                    if (!front.value.trim()) return false
                    if (card) Object.assign(card, { front: front.value.trim(), back: back.value.trim(), bookId: bookSel.value })
                    else store.addCard({ front: front.value.trim(), back: back.value.trim(), bookId: bookSel.value })
                    store.save('study'); this.render()
                },
            }],
        })
    }

    #session(queue) {
        queue = queue.slice().sort(() => Math.random() - 0.5)
        let i = 0, shown = false, correct = 0
        const body = h('div.review-session')
        const m = modal({ title: 'Revisão', body, wide: true, onClose: () => { store.save('study'); this.render(); this.app.updateBadges() } })
        const show = () => {
            if (i >= queue.length) {
                fill(body, h('div.center.col',
                    h('div.big-emoji', '🎉'), h('h2', 'Revisão concluída!'),
                    h('p', `${queue.length} cartões · ${correct} lembrados de primeira`),
                    h('button.btn.primary', { onclick: () => m.close() }, 'Fechar')))
                return
            }
            const c = queue[i]
            const grade = g => {
                if (g > 0 && !c.lapsedNow) correct++
                schedule(c, g)
                if (g === 0) { c.lapsedNow = true; queue.push(c) } else delete c.lapsedNow
                i++; shown = false; store.save('study'); show()
            }
            fill(body, 
                h('div.rs-progress', h('i', { style: { width: `${(i / queue.length) * 100}%` } })),
                h('div.rs-meta', `${i + 1} / ${queue.length}`, ' · ', store.book(c.bookId)?.title ?? ''),
                h('div.flashcard', { class: shown ? 'flipped' : '', onclick: () => { if (!shown) { shown = true; show() } } },
                    h('div.fc-front', c.front),
                    shown ? h('div.fc-back', c.back) : h('div.fc-hint', 'Clique ou pressione Espaço para ver a resposta')),
                shown ? h('div.grades',
                    h('button.grade.g0', { onclick: () => grade(0) }, 'Errei', h('small', intervalPreview(c, 0))),
                    h('button.grade.g1', { onclick: () => grade(1) }, 'Difícil', h('small', intervalPreview(c, 1))),
                    h('button.grade.g2', { onclick: () => grade(2) }, 'Bom', h('small', intervalPreview(c, 2))),
                    h('button.grade.g3', { onclick: () => grade(3) }, 'Fácil', h('small', intervalPreview(c, 3))))
                    : h('div.center', h('button.btn.primary', { onclick: () => { shown = true; show() } }, 'Mostrar resposta')))
            body.onkeydown = e => {
                if (e.key === ' ' && !shown) { e.preventDefault(); shown = true; show() }
                else if (shown && ['1', '2', '3', '4'].includes(e.key)) grade(Number(e.key) - 1)
            }
            body.tabIndex = 0
            body.focus()
        }
        show()
    }
}

const tile = (label, value, ic) => h('div.tile', icon(ic, 20), h('div.tile-val', String(value)), h('div.tile-lbl', label))

// ---------------------------------------------------------------- Vocabulário
export class Vocab {
    constructor(app) { this.app = app; this.root = $('#vocab-view'); this.q = '' }
    render() {
        const list = store.study.vocab.slice().sort((a, b) => b.created - a.created)
            .filter(v => !this.q || `${v.word} ${v.translation}`.toLowerCase().includes(this.q.toLowerCase()))
        fill(this.root, 
            h('header.page-head',
                h('div', h('h1', 'Vocabulário'), h('p.muted', 'Palavras que você traduziu ou consultou enquanto lia — ótimo para aprender idiomas lendo.')),
                h('div.lib-actions',
                    h('button.btn', {
                        onclick: () => {
                            let n = 0
                            for (const v of store.study.vocab) {
                                if (store.study.cards.some(c => c.vocabId === v.id)) continue
                                store.addCard({ vocabId: v.id, bookId: v.bookId, front: v.word + (v.context ? `\n\n“${v.context.slice(0, 160)}”` : ''), back: v.translation })
                                n++
                            }
                            toast(n ? `${n} palavras viraram flashcards` : 'Todas as palavras já têm flashcards')
                            this.app.updateBadges()
                        },
                    }, icon('cards', 16), ' Criar flashcards'),
                    h('button.btn', {
                        onclick: () => window.api.file.saveText({
                            defaultName: 'vocabulario.csv',
                            content: '﻿palavra;tradução;idioma;livro;contexto\n' + store.study.vocab.map(v =>
                                [v.word, v.translation, v.lang, v.bookTitle, v.context].map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'),
                            filters: [{ name: 'CSV (Excel/Anki)', extensions: ['csv'] }],
                        }).then(p => p && toast('Vocabulário exportado')),
                    }, icon('download', 16), ' Exportar CSV'))),
            h('div.search-wrap.wide', icon('search', 16), h('input.input.search', {
                placeholder: 'Filtrar palavras…', value: this.q,
                oninput: e => { this.q = e.target.value; this.render(); const i = $('#vocab-view input.search'); i.focus(); i.selectionStart = i.value.length },
            })),
            list.length ? h('div.vocab-grid', list.map(v => h('div.vocab-card',
                h('div.vc-head', h('strong', v.word), iconBtn('volume', 'Ouvir', () => speak(v.word, v.lang))),
                h('div.vc-tr', v.translation),
                v.context ? h('div.vc-ctx', `“${v.context}”`) : null,
                h('div.vc-foot', h('small.muted', `${v.bookTitle ?? ''} · ${fmtDate(v.created)}`),
                    iconBtn('trash', 'Apagar', () => { store.study.vocab = store.study.vocab.filter(x => x !== v); store.save('study'); this.render() })))))
                : h('div.empty', icon('translate', 48), h('h2', 'Nenhuma palavra ainda'),
                    h('p.muted', 'No leitor, selecione uma palavra → Traduzir. Palavras curtas são salvas aqui automaticamente.')))
    }
}

// ---------------------------------------------------------------- Todas as anotações
export class AllNotes {
    constructor(app) { this.app = app; this.root = $('#notes-view'); this.q = '' }
    async render() {
        fill(this.root, h('p.muted.pad', 'Carregando anotações…'))
        const books = store.library.books.slice().sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))
        const datas = await Promise.all(books.map(b => store.bookData(b.id)))
        const q = this.q.toLowerCase()
        const sections = []
        let total = 0
        books.forEach((b, i) => {
            const d = datas[i]
            const anns = d.annotations.filter(a => !q || `${a.text} ${a.note}`.toLowerCase().includes(q))
            if (!anns.length && !(d.notes?.trim() && !q)) return
            total += anns.length
            sections.push(h('section.notes-book',
                h('header', h('h3', b.title), h('span.muted', b.author ?? ''),
                    h('div.spacer'),
                    h('button.btn.small', { onclick: () => this.app.openBook(b) }, 'Abrir'),
                    h('button.btn.small', {
                        onclick: () => window.api.file.saveText({
                            defaultName: `${b.title} - anotações.md`, content: annotationsToMarkdown(b, d),
                            filters: [{ name: 'Markdown', extensions: ['md'] }],
                        }).then(p => p && toast('Exportado')),
                    }, icon('download', 14), ' MD')),
                anns.sort((x, y) => (x.fraction ?? 0) - (y.fraction ?? 0)).map(a => h('div.ann', { style: { '--c': COLOR_HEX[a.color] ?? '#f6c84c' } },
                    h('div.ann-meta', h('span', a.chapter ?? ''), h('span', fmtDateTime(a.created))),
                    h('blockquote.ann-text', a.text),
                    a.note ? h('div.ann-note', a.note) : null)),
                d.notes?.trim() && !q ? h('details.nb', h('summary', 'Caderno'), h('pre', d.notes)) : null))
        })
        fill(this.root, 
            h('header.page-head', h('div', h('h1', 'Anotações'), h('p.muted', `${total} destaques em ${sections.length} livros`)),
                h('div.lib-actions', h('button.btn', { onclick: () => this.#exportAll(books, datas) }, icon('download', 16), ' Exportar tudo'))),
            h('div.search-wrap.wide', icon('search', 16), h('input.input.search', {
                placeholder: 'Buscar em todas as anotações…', value: this.q,
                onchange: e => { this.q = e.target.value; this.render() },
            })),
            sections.length ? h('div', sections) : h('div.empty', icon('highlighter', 48), h('h2', 'Nenhuma anotação'), h('p.muted', 'Seus destaques e notas de todos os livros aparecem aqui.')))
    }
    #exportAll(books, datas) {
        const md = books.map((b, i) => datas[i].annotations.length || datas[i].notes?.trim() ? annotationsToMarkdown(b, datas[i]) : '')
            .filter(Boolean).join('\n\n---\n\n')
        window.api.file.saveText({ defaultName: 'todas-as-anotacoes.md', content: md, filters: [{ name: 'Markdown', extensions: ['md'] }] })
            .then(p => p && toast('Exportado'))
    }
}

