// Assistente de estudo com Claude (opcional — requer chave da API da Anthropic)
import { store } from './store.js'

const MAX_CONTEXT_CHARS = 400000

const baseSystem = ({ title, author }) => `Você é um tutor de leitura que ajuda o leitor a dominar o livro "${title}"${author ? ` de ${author}` : ''}.
Responda sempre em português do Brasil, com clareza e de forma didática, usando Markdown simples (títulos curtos, listas, negrito).
Baseie-se no trecho do livro fornecido. Quando algo não estiver no trecho, diga isso e, se útil, complemente com conhecimento geral deixando claro que é complemento.
Evite revelar acontecimentos posteriores ao ponto em que o leitor está (sem spoilers), a menos que ele peça explicitamente.`

const contextBlock = (chapterLabel, chapterText) =>
    `<capitulo_atual titulo="${chapterLabel ?? ''}">\n${(chapterText ?? '').slice(0, MAX_CONTEXT_CHARS)}\n</capitulo_atual>`

const opts = () => ({
    apiKey: store.settings.aiKey,
    model: store.settings.aiModel,
    effort: store.settings.aiEffort,
})

export const aiReady = () => !!store.settings.aiKey

// conversa com streaming. history: [{role, content}]
export const aiChat = ({ book, chapterLabel, chapterText, history }, onDelta) => {
    const system = [
        { type: 'text', text: baseSystem(book) },
        { type: 'text', text: contextBlock(chapterLabel, chapterText), cache_control: { type: 'ephemeral' } },
    ]
    return window.api.ai.chat({ ...opts(), system, messages: history }, onDelta)
}

export const QUICK_PROMPTS = [
    { id: 'resumo', icon: 'note', label: 'Resumir capítulo', prompt: 'Faça um resumo completo e bem estruturado deste capítulo: ideia central, pontos principais em tópicos e uma frase final que sintetize tudo.' },
    { id: 'chave', icon: 'target', label: 'Ideias-chave', prompt: 'Liste as 5 a 10 ideias, conceitos ou acontecimentos mais importantes deste capítulo, explicando cada um em 1–2 frases e por que importa.' },
    { id: 'mapa', icon: 'layers', label: 'Mapa mental', prompt: 'Monte um mapa mental deste capítulo em forma de lista hierárquica (tema central → ramos → detalhes), para eu memorizar a estrutura.' },
    { id: 'quiz', icon: 'check', label: 'Quiz de revisão', prompt: 'Crie um quiz com 6 perguntas de múltipla escolha (A–D) sobre este capítulo, variando entre lembrar, entender e aplicar. Coloque o gabarito comentado no final, depois de uma linha "---".' },
    { id: 'personagens', icon: 'book', label: 'Personagens e conceitos', prompt: 'Liste os personagens (ou conceitos/termos técnicos, se for não ficção) que aparecem até aqui neste capítulo, com uma descrição curta de cada um e como se relacionam. Sem spoilers.' },
    { id: 'aplicar', icon: 'sparkles', label: 'Como aplicar', prompt: 'Como posso aplicar o que este capítulo ensina na vida real? Dê exemplos práticos e um pequeno exercício.' },
    { id: 'feynman', icon: 'message', label: 'Explique fácil', prompt: 'Explique o conteúdo deste capítulo como se eu tivesse 12 anos (técnica Feynman), usando analogias simples.' },
]

// Gera flashcards estruturados a partir do capítulo
export const aiFlashcards = async ({ book, chapterLabel, chapterText, count = 10 }) => {
    const schema = {
        type: 'object',
        properties: {
            cards: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        front: { type: 'string', description: 'Pergunta objetiva' },
                        back: { type: 'string', description: 'Resposta curta e precisa' },
                    },
                    required: ['front', 'back'],
                    additionalProperties: false,
                },
            },
        },
        required: ['cards'],
        additionalProperties: false,
    }
    return window.api.ai.json({
        ...opts(),
        schema,
        system: baseSystem(book),
        messages: [{
            role: 'user',
            content: `${contextBlock(chapterLabel, chapterText)}\n\nCrie ${count} flashcards de alta qualidade para memorizar o essencial deste capítulo (princípio da informação mínima: uma ideia por cartão, perguntas específicas, respostas curtas). Em português.`,
        }],
    })
}

// Markdown mínimo e seguro para exibir respostas
export const renderMarkdown = md => {
    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
    const inline = s => esc(s)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    const lines = md.split('\n')
    let html = ''
    let list = null
    const closeList = () => { if (list) { html += `</${list}>`; list = null } }
    for (const line of lines) {
        let m
        if ((m = line.match(/^(#{1,4})\s+(.*)/))) { closeList(); const l = Math.min(4, m[1].length + 2); html += `<h${l}>${inline(m[2])}</h${l}>` }
        else if ((m = line.match(/^(\s*)[-*•]\s+(.*)/))) {
            if (list !== 'ul') { closeList(); html += '<ul>'; list = 'ul' }
            html += `<li${m[1].length >= 2 ? ' class="sub"' : ''}>${inline(m[2])}</li>`
        }
        else if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) {
            if (list !== 'ol') { closeList(); html += '<ol>'; list = 'ol' }
            html += `<li>${inline(m[1])}</li>`
        }
        else if (/^---+\s*$/.test(line)) { closeList(); html += '<hr>' }
        else if (/^>\s?/.test(line)) { closeList(); html += `<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>` }
        else if (!line.trim()) { closeList() }
        else { closeList(); html += `<p>${inline(line)}</p>` }
    }
    closeList()
    return html
}
