// Exportação de anotações e caderno
import { toast, fmtDateTime } from './ui.js'

const COLOR_NAMES = { amarelo: 'Amarelo', verde: 'Verde', azul: 'Azul', rosa: 'Rosa', laranja: 'Laranja', roxo: 'Roxo' }
const COLOR_HEX = { amarelo: '#f6c84c', verde: '#7cc47f', azul: '#5fa8e8', rosa: '#ef86b0', laranja: '#f59e4c', roxo: '#a98be0' }
const escHTML = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export const annotationsToMarkdown = (rec, data) => {
    const anns = data.annotations.slice().sort((a, b) => (a.fraction ?? 0) - (b.fraction ?? 0))
    let md = `# ${rec.title}\n`
    if (rec.author) md += `*${rec.author}*\n`
    md += `\nExportado em ${new Date().toLocaleString('pt-BR')} · ${anns.length} destaques · ${data.bookmarks.length} marcadores\n`
    let chapter = null
    for (const a of anns) {
        if (a.chapter !== chapter) { chapter = a.chapter; md += `\n## ${chapter || 'Sem capítulo'}\n` }
        md += `\n> ${a.text.replace(/\n+/g, '\n> ')}\n`
        md += `\n<sub>${COLOR_NAMES[a.color] ?? a.color} · ${Math.round((a.fraction ?? 0) * 100)}% · ${fmtDateTime(a.created)}</sub>\n`
        if (a.note) md += `\n**Nota:** ${a.note}\n`
    }
    if (data.bookmarks.length) {
        md += `\n## Marcadores\n\n`
        for (const b of data.bookmarks) md += `- Pág. ${b.page ?? '?'} (${Math.round((b.fraction ?? 0) * 100)}%) — ${b.chapter ?? ''}: ${b.excerpt ?? ''}…\n`
    }
    if (data.notes?.trim()) md += `\n## Caderno\n\n${data.notes}\n`
    return md
}

const toTXT = (rec, data) => annotationsToMarkdown(rec, data)
    .replace(/^#+\s*/gm, '').replace(/<\/?sub>/g, '').replace(/\*\*/g, '').replace(/^> /gm, '  “').replace(/^\*(.*)\*$/gm, '$1')

const toHTML = (rec, data) => {
    const anns = data.annotations.slice().sort((a, b) => (a.fraction ?? 0) - (b.fraction ?? 0))
    let body = ''
    let chapter = null
    for (const a of anns) {
        if (a.chapter !== chapter) { chapter = a.chapter; body += `<h2>${escHTML(chapter || 'Sem capítulo')}</h2>` }
        body += `<blockquote style="border-left:4px solid ${COLOR_HEX[a.color] ?? '#f6c84c'}">${escHTML(a.text)}</blockquote>`
        if (a.note) body += `<p class="note"><strong>Nota:</strong> ${escHTML(a.note)}</p>`
    }
    if (data.notes?.trim()) body += `<h2>Caderno</h2><pre>${escHTML(data.notes)}</pre>`
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escHTML(rec.title)} — anotações</title>
<style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:0 20px;color:#2b2620;background:#fbf6ea;line-height:1.6}
h1{margin-bottom:0}h2{margin-top:2em;border-bottom:1px solid #d8ccb4;padding-bottom:.2em}
blockquote{margin:1.2em 0;padding:.4em 1em;background:#fff8e6}.note{margin:-.6em 0 1.2em 1.2em;font-style:italic;color:#5a4a36}
pre{white-space:pre-wrap;font-family:inherit}</style></head><body>
<h1>${escHTML(rec.title)}</h1><p><em>${escHTML(rec.author ?? '')}</em></p>${body}</body></html>`
}

export const exportAnnotations = async (rec, data, format) => {
    const content = format === 'html' ? toHTML(rec, data) : format === 'txt' ? toTXT(rec, data) : annotationsToMarkdown(rec, data)
    const ext = format === 'html' ? 'html' : format === 'txt' ? 'txt' : 'md'
    const p = await window.api.file.saveText({
        defaultName: `${rec.title.replace(/[\\/:*?"<>|]/g, '')} - anotações.${ext}`,
        content,
        filters: [{ name: ext.toUpperCase(), extensions: [ext] }],
    })
    if (p) toast('Anotações exportadas ✔')
}
