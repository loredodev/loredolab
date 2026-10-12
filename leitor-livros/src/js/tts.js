// Leitura em voz alta (vozes do sistema via Web Speech API), parágrafo por parágrafo,
// destacando o trecho lido e virando as páginas automaticamente.

const BLOCK = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, dd, dt, pre, figcaption, td, th'

export class ReadAloud extends EventTarget {
    constructor(reader) {
        super()
        this.reader = reader
        this.playing = false
        this.paused = false
        this.blocks = []
        this.i = 0
        this.chunks = []
        this.c = 0
    }
    get synth() { return window.speechSynthesis }

    static voices() {
        return window.speechSynthesis.getVoices()
            .slice().sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name))
    }

    #collect(doc) {
        const all = Array.from(doc.querySelectorAll(BLOCK))
        // apenas blocos "folha" (sem outros blocos dentro) e com texto
        return all.filter(el => el.textContent.trim() && !el.querySelector(BLOCK))
    }

    #startIndex(doc) {
        const range = this.reader.view.lastLocation?.range
        if (!range || range.startContainer.ownerDocument !== doc) return 0
        const idx = this.blocks.findIndex(el => {
            const r = doc.createRange()
            r.selectNodeContents(el)
            return r.compareBoundaryPoints(Range.END_TO_START, range) > 0
                || range.intersectsNode?.(el)
        })
        return Math.max(0, idx)
    }

    async start() {
        const contents = this.reader.view.renderer.getContents()[0]
        if (!contents?.doc) return
        this.doc = contents.doc
        this.blocks = this.#collect(this.doc)
        this.i = this.#startIndex(this.doc)
        this.playing = true
        this.paused = false
        this.failures = 0
        this.#emit()
        this.#speakBlock()
    }

    #emit() { this.dispatchEvent(new Event('state')) }

    #segments(text) {
        const seg = new Intl.Segmenter(this.reader.language || undefined, { granularity: 'sentence' })
        const out = []
        let buf = ''
        for (const { segment } of seg.segment(text)) {
            if ((buf + segment).length > 220 && buf) { out.push(buf); buf = '' }
            buf += segment
        }
        if (buf.trim()) out.push(buf)
        return out
    }

    #mark(el) {
        this.doc?.querySelectorAll('.ll-tts').forEach(x => x.classList.remove('ll-tts'))
        if (el) {
            el.classList.add('ll-tts')
            const r = this.doc.createRange()
            r.selectNodeContents(el)
            this.reader.view.renderer.scrollToAnchor?.(r)
        }
    }

    async #speakBlock() {
        if (!this.playing) return
        if (this.i >= this.blocks.length) {
            // fim da seção: vai para a próxima e continua
            this.#mark(null)
            const ok = await this.reader.nextSectionForTTS()
            if (!ok) return this.stop()
            return
        }
        const el = this.blocks[this.i]
        this.#mark(el)
        this.chunks = this.#segments(el.textContent.replace(/\s+/g, ' ').trim())
        this.c = 0
        this.#speakChunk()
    }

    #speakChunk() {
        if (!this.playing) return
        if (this.c >= this.chunks.length) {
            this.i++
            return this.#speakBlock()
        }
        const s = this.reader.settings
        const u = new SpeechSynthesisUtterance(this.chunks[this.c])
        const voice = ReadAloud.voices().find(v => v.voiceURI === s.ttsVoice)
        if (voice) { u.voice = voice; u.lang = voice.lang }
        else if (this.reader.language) u.lang = this.reader.language
        u.rate = s.ttsRate
        u.pitch = s.ttsPitch
        u.onend = () => {
            if (!this.playing || this.paused || u !== this.current) return
            this.c++
            this.#speakChunk()
        }
        u.onstart = () => { this.failures = 0 }
        u.onerror = e => {
            if (e.error === 'interrupted' || e.error === 'canceled') return
            // evita percorrer o livro inteiro se não houver voz disponível
            if (++this.failures >= 3) {
                this.stop()
                this.dispatchEvent(new CustomEvent('error', { detail: 'Nenhuma voz disponível para leitura. No Windows, instale vozes em Configurações → Hora e idioma → Fala.' }))
                return
            }
            this.c++
            this.#speakChunk()
        }
        this.current = u
        this.reader.markActivity()
        this.synth.speak(u)
    }

    // chamado pelo leitor depois que a próxima seção carregou
    continueInNewSection(doc) {
        if (!this.playing) return
        this.doc = doc
        this.blocks = this.#collect(doc)
        this.i = 0
        this.#speakBlock()
    }

    pause() {
        if (!this.playing) return
        this.paused = true
        this.synth.cancel()
        this.#emit()
    }
    resume() {
        if (!this.playing) return this.start()
        this.paused = false
        this.#emit()
        this.#speakChunk()
    }
    toggle() { this.playing && !this.paused ? this.pause() : this.resume() }
    next() {
        if (!this.playing) return
        this.synth.cancel()
        this.i++
        this.paused = false
        this.#speakBlock()
    }
    prev() {
        if (!this.playing) return
        this.synth.cancel()
        this.i = Math.max(0, this.i - 1)
        this.paused = false
        this.#speakBlock()
    }
    restartChunk() {
        if (!this.playing || this.paused) return
        this.synth.cancel()
        this.#speakChunk()
    }
    stop() {
        this.playing = false
        this.paused = false
        this.current = null
        this.synth.cancel()
        this.#mark(null)
        this.#emit()
    }
}

// fala um texto avulso (pronúncia de palavras, traduções)
export const speak = (text, lang) => {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    if (lang) {
        u.lang = lang
        const v = ReadAloud.voices().find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()))
        if (v) u.voice = v
    }
    synth.speak(u)
}
