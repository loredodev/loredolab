// Estatísticas de leitura: metas, sequência, gráfico diário, mapa de calor, ranking por livro
import { store } from './store.js'
import { $, h, icon, fmtDuration, todayKey, fill } from './ui.js'

const SVGNS = 'http://www.w3.org/2000/svg'
const svg = (tag, attrs = {}, ...kids) => {
    const el = document.createElementNS(SVGNS, tag)
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    el.append(...kids)
    return el
}

export class Stats {
    constructor(app) { this.app = app; this.root = $('#stats-view') }

    render() {
        const s = store.settings
        const days = store.stats.days
        const today = days[todayKey()] ?? { ms: 0, pages: 0 }
        const goalMs = s.dailyGoalMinutes * 60000
        const sumRange = n => {
            let ms = 0
            const d = new Date()
            for (let i = 0; i < n; i++) { ms += days[todayKey(d)]?.ms ?? 0; d.setDate(d.getDate() - 1) }
            return ms
        }
        const totalMs = Object.values(days).reduce((a, d) => a + d.ms, 0)
        const year = new Date().getFullYear()
        const doneThisYear = store.library.books.filter(b => b.status === 'done' && b.finishedAt && new Date(b.finishedAt).getFullYear() === year).length
        const pct = Math.min(100, Math.round(today.ms / goalMs * 100))

        fill(this.root, 
            h('header.page-head', h('div', h('h1', 'Estatísticas'), h('p.muted', 'Acompanhe seu hábito de leitura e bata suas metas.'))),
            h('div.tiles',
                h('div.tile.goal',
                    ring(pct),
                    h('div', h('div.tile-val', fmtDuration(today.ms)), h('div.tile-lbl', `hoje · meta ${s.dailyGoalMinutes} min`))),
                h('div.tile', icon('flame', 20), h('div.tile-val', `${store.streak()} dia${store.streak() === 1 ? '' : 's'}`), h('div.tile-lbl', 'sequência de leitura')),
                h('div.tile', icon('clock', 20), h('div.tile-val', fmtDuration(sumRange(7))), h('div.tile-lbl', 'últimos 7 dias')),
                h('div.tile', icon('book', 20), h('div.tile-val', `${doneThisYear} / ${s.yearlyGoalBooks}`), h('div.tile-lbl', `livros concluídos em ${year}`)),
                h('div.tile', icon('chart', 20), h('div.tile-val', fmtDuration(totalMs)), h('div.tile-lbl', 'tempo total de leitura'))),
            h('section.chart-card',
                h('h3', 'Minutos lidos por dia'), h('p.muted.small', 'Últimos 30 dias · a linha tracejada é sua meta diária'),
                this.#dailyChart(30)),
            h('section.chart-card',
                h('h3', 'Seu ano de leitura'), h('p.muted.small', 'Cada quadrado é um dia; mais escuro = mais tempo lendo'),
                this.#heatmap()),
            h('section.chart-card',
                h('h3', 'Tempo por livro'),
                this.#perBook()))
    }

    #dailyChart(n) {
        const goal = store.settings.dailyGoalMinutes
        const data = []
        const d = new Date()
        d.setDate(d.getDate() - (n - 1))
        for (let i = 0; i < n; i++) {
            data.push({ key: todayKey(d), date: new Date(d), min: Math.round((store.stats.days[todayKey(d)]?.ms ?? 0) / 60000) })
            d.setDate(d.getDate() + 1)
        }
        const W = 900, H = 220, padL = 36, padB = 26, padT = 10
        const max = Math.max(goal * 1.2, ...data.map(x => x.min), 10)
        const step = niceStep(max)
        const top = Math.ceil(max / step) * step
        const y = v => padT + (H - padT - padB) * (1 - v / top)
        const bw = (W - padL) / n
        const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': 'Minutos lidos por dia nos últimos 30 dias' })
        for (let v = 0; v <= top; v += step) {
            root.append(svg('line', { x1: padL, x2: W, y1: y(v), y2: y(v), class: 'grid' }))
            root.append(svg('text', { x: padL - 6, y: y(v) + 4, class: 'axis', 'text-anchor': 'end' }, String(v)))
        }
        const tip = h('div.chart-tip')
        data.forEach((p, i) => {
            const x = padL + i * bw + bw * 0.18
            const w = bw * 0.64
            const yy = y(p.min)
            const hgt = Math.max(0, y(0) - yy)
            const r = Math.min(4, w / 2, hgt)
            if (p.min > 0) root.append(svg('path', {
                d: `M${x},${y(0)} V${yy + r} Q${x},${yy} ${x + r},${yy} H${x + w - r} Q${x + w},${yy} ${x + w},${yy + r} V${y(0)} Z`,
                class: p.min >= goal ? 'bar met' : 'bar',
            }))
            if (i % 5 === 0 || i === n - 1) root.append(svg('text', { x: x + w / 2, y: H - 8, class: 'axis', 'text-anchor': 'middle' },
                p.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })))
            const hit = svg('rect', { x: padL + i * bw, y: padT, width: bw, height: H - padT - padB, class: 'hit' })
            hit.addEventListener('mouseenter', () => {
                tip.innerHTML = `<strong>${p.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</strong><br>${p.min} min${p.min >= goal ? ' · meta batida ✓' : ''}`
                tip.style.display = 'block'
                const box = root.getBoundingClientRect()
                tip.style.left = `${((padL + i * bw + bw / 2) / W) * box.width}px`
                tip.style.top = `${(yy / H) * box.height - 8}px`
            })
            hit.addEventListener('mouseleave', () => { tip.style.display = 'none' })
            root.append(hit)
        })
        root.append(svg('line', { x1: padL, x2: W, y1: y(goal), y2: y(goal), class: 'goal-line' }))
        root.append(svg('line', { x1: padL, x2: W, y1: y(0), y2: y(0), class: 'baseline' }))
        return h('div.chart-wrap', root, tip)
    }

    #heatmap() {
        const weeks = 53
        const end = new Date()
        const start = new Date(end)
        start.setDate(start.getDate() - (weeks * 7 - 1) - end.getDay())
        const cell = 13, gap = 3
        const W = weeks * (cell + gap) + 30, H = 7 * (cell + gap) + 20
        const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'heatmap', role: 'img', 'aria-label': 'Mapa de calor de leitura no último ano' })
        const goal = store.settings.dailyGoalMinutes
        const d = new Date(start)
        const tip = h('div.chart-tip')
        let lastMonth = -1
        for (let w = 0; w < weeks + 1; w++) {
            for (let day = 0; day < 7; day++) {
                if (d > end) break
                const min = (store.stats.days[todayKey(d)]?.ms ?? 0) / 60000
                const level = min <= 0 ? 0 : min < goal * 0.34 ? 1 : min < goal * 0.67 ? 2 : min < goal ? 3 : 4
                const x = 30 + w * (cell + gap), y = 16 + day * (cell + gap)
                const rect = svg('rect', { x, y, width: cell, height: cell, rx: 3, class: `hm l${level}` })
                const label = `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}: ${Math.round(min)} min`
                rect.addEventListener('mouseenter', () => {
                    tip.textContent = label
                    tip.style.display = 'block'
                    const box = root.getBoundingClientRect()
                    tip.style.left = `${(x + cell / 2) / W * box.width}px`
                    tip.style.top = `${y / H * box.height - 6}px`
                })
                rect.addEventListener('mouseleave', () => { tip.style.display = 'none' })
                root.append(rect)
                if (day === 0 && d.getMonth() !== lastMonth) {
                    lastMonth = d.getMonth()
                    root.append(svg('text', { x, y: 10, class: 'axis' }, d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')))
                }
                d.setDate(d.getDate() + 1)
            }
        }
        for (const [i, l] of [[1, 'seg'], [3, 'qua'], [5, 'sex']]) root.append(svg('text', { x: 0, y: 16 + i * (cell + gap) + 10, class: 'axis' }, l))
        const legend = h('div.hm-legend', h('span.muted.small', 'Menos'), [0, 1, 2, 3, 4].map(l => h(`i.hm-sw.l${l}`)), h('span.muted.small', 'Mais (meta)'))
        return h('div.chart-wrap', root, tip, legend)
    }

    #perBook() {
        const books = store.library.books.filter(b => b.totalTime > 0).sort((a, b) => b.totalTime - a.totalTime).slice(0, 10)
        if (!books.length) return h('p.muted', 'Comece a ler para ver suas estatísticas aqui.')
        const max = books[0].totalTime
        return h('div.hbars', books.map(b => h('div.hbar',
            h('span.hb-label', { title: b.title }, b.title),
            h('div.hb-track', h('i', { style: { width: `${Math.max(2, b.totalTime / max * 100)}%` } })),
            h('span.hb-val', fmtDuration(b.totalTime)),
            h('span.hb-pct.muted', `${Math.round((b.progress ?? 0) * 100)}%`))))
    }
}

const niceStep = max => {
    const raw = max / 4
    const p = Math.pow(10, Math.floor(Math.log10(raw)))
    return [1, 2, 5, 10].map(m => m * p).find(s => s >= raw)
}

const ring = pct => {
    const r = 22, c = 2 * Math.PI * r
    return svg('svg', { width: 56, height: 56, viewBox: '0 0 56 56', class: 'ring' },
        svg('circle', { cx: 28, cy: 28, r, class: 'ring-bg' }),
        svg('circle', { cx: 28, cy: 28, r, class: 'ring-fg', 'stroke-dasharray': `${c * pct / 100} ${c}`, transform: 'rotate(-90 28 28)' }),
        svg('text', { x: 28, y: 32, 'text-anchor': 'middle', class: 'ring-txt' }, `${pct}%`))
}
