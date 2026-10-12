// Temas de leitura, fontes e geração do CSS injetado nas páginas do livro

export const THEMES = {
    papel: { name: 'Papel', bg: '#fbf6ea', fg: '#2b2620', link: '#8a4b14', page: '#efe6d2', texture: true },
    branco: { name: 'Branco', bg: '#ffffff', fg: '#1a1a1a', link: '#1a5fb4', page: '#e9e9e9' },
    sepia: { name: 'Sépia', bg: '#f1e4c8', fg: '#4a3826', link: '#8a4b14', page: '#e0cfa9', texture: true },
    pergaminho: { name: 'Pergaminho', bg: '#ead9b5', fg: '#3d2c18', link: '#7a3d0c', page: '#d6c091', texture: true },
    cinza: { name: 'Cinza suave', bg: '#e6e4df', fg: '#2a2a2a', link: '#2b5f8a', page: '#d2cfc8' },
    verde: { name: 'Verde descanso', bg: '#dfeedd', fg: '#203222', link: '#2a6a3a', page: '#c9dcc6' },
    azul: { name: 'Azul névoa', bg: '#e3ebf3', fg: '#1d2a38', link: '#2a5a8a', page: '#ccd8e4' },
    rosa: { name: 'Rosa antigo', bg: '#f5e6e4', fg: '#3a2626', link: '#8a3a3a', page: '#e5cfcc' },
    noite: { name: 'Noite', bg: '#22201d', fg: '#d8d0c2', link: '#e0a96d', page: '#161412', dark: true },
    ardosia: { name: 'Ardósia', bg: '#1f2630', fg: '#cfd8e3', link: '#7fb2e5', page: '#141920', dark: true },
    amoled: { name: 'Preto total', bg: '#000000', fg: '#bdbdbd', link: '#e0a96d', page: '#000000', dark: true },
    terminal: { name: 'Terminal', bg: '#0e1410', fg: '#7fdc8f', link: '#b6f0c0', page: '#070a08', dark: true },
    custom: { name: 'Personalizado', bg: '#fbf6ea', fg: '#2b2620', link: '#8a4b14', page: '#e6dccb' },
}

export const getTheme = s => {
    const t = { ...(THEMES[s.theme] ?? THEMES.papel) }
    if (s.theme === 'custom') {
        t.bg = s.customBg
        t.fg = s.customFg
        t.dark = luminance(s.customBg) < 0.4
        t.page = shade(s.customBg, t.dark ? -0.35 : -0.08)
    }
    return t
}

const luminance = hex => {
    const n = parseInt(hex.slice(1), 16)
    const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(v => v / 255)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16)
    const f = v => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))))
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('')
}

const FS = 'app://app/node_modules/@fontsource'
// [nome exibido, pasta fontsource, tipo, pesos disponíveis]
export const FONTS = [
    { name: 'Original do livro', css: null, kind: 'Padrão' },
    { name: 'Literata', pkg: 'literata', kind: 'Serifada' },
    { name: 'Merriweather', pkg: 'merriweather', kind: 'Serifada' },
    { name: 'Lora', pkg: 'lora', kind: 'Serifada' },
    { name: 'EB Garamond', pkg: 'eb-garamond', kind: 'Serifada' },
    { name: 'Crimson Pro', pkg: 'crimson-pro', kind: 'Serifada' },
    { name: 'Libre Baskerville', pkg: 'libre-baskerville', kind: 'Serifada' },
    { name: 'Source Serif 4', pkg: 'source-serif-4', kind: 'Serifada' },
    { name: 'Noto Serif', pkg: 'noto-serif', kind: 'Serifada' },
    { name: 'Alegreya', pkg: 'alegreya', kind: 'Serifada' },
    { name: 'Playfair Display', pkg: 'playfair-display', kind: 'Serifada' },
    { name: 'Open Sans', pkg: 'open-sans', kind: 'Sem serifa' },
    { name: 'Roboto', pkg: 'roboto', kind: 'Sem serifa' },
    { name: 'Inter', pkg: 'inter', kind: 'Sem serifa' },
    { name: 'Atkinson Hyperlegible', pkg: 'atkinson-hyperlegible', kind: 'Acessível' },
    { name: 'OpenDyslexic', pkg: 'opendyslexic', kind: 'Acessível (dislexia)' },
    { name: 'Georgia', system: 'Georgia, serif', kind: 'Do sistema' },
    { name: 'Times New Roman', system: '"Times New Roman", Times, serif', kind: 'Do sistema' },
    { name: 'Palatino', system: '"Palatino Linotype", Palatino, "Book Antiqua", serif', kind: 'Do sistema' },
    { name: 'Cambria', system: 'Cambria, serif', kind: 'Do sistema' },
    { name: 'Segoe UI', system: '"Segoe UI", system-ui, sans-serif', kind: 'Do sistema' },
    { name: 'Verdana', system: 'Verdana, sans-serif', kind: 'Do sistema' },
    { name: 'Arial', system: 'Arial, Helvetica, sans-serif', kind: 'Do sistema' },
]

const fontFaces = font => {
    if (!font?.pkg) return ''
    const subsets = font.pkg === 'opendyslexic' ? ['latin'] : ['latin', 'latin-ext']
    const out = []
    for (const subset of subsets) for (const style of ['normal', 'italic']) for (const weight of [400, 700]) {
        out.push(`@font-face{font-family:"${font.name}";font-style:${style};font-weight:${weight};font-display:swap;src:url("${FS}/${font.pkg}/files/${font.pkg}-${subset}-${weight}-${style}.woff2") format("woff2");${subset === 'latin' ? 'unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;' : ''}}`)
    }
    return out.join('\n')
}

export const fontStack = name => {
    const f = FONTS.find(x => x.name === name)
    if (!f || !f.css && !f.pkg && !f.system) return null
    if (f.system) return f.system
    return `"${f.name}", Georgia, serif`
}

// textura de papel (ruído SVG)
const PAPER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.36 0 0 0 0 0.22 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export const paperTexture = PAPER

export const bookCSS = (s, { fixed = false } = {}) => {
    const t = getTheme(s)
    const font = FONTS.find(f => f.name === s.fontFamily)
    const stack = fontStack(s.fontFamily)
    const override = s.overrideFont && stack
    const imp = override ? ' !important' : ''
    return `
${fontFaces(font)}
@namespace epub "http://www.idpf.org/2007/ops";
html {
    color-scheme: ${t.dark ? 'dark' : 'light'};
    background: ${t.bg}${s.paperTexture && t.texture ? ` ${PAPER}` : ''} !important;
    color: ${t.fg} !important;
    font-size: ${s.fontSize}px !important;
    -webkit-font-smoothing: antialiased;
}
body { background: transparent !important; color: ${t.fg} !important;
    ${override ? `font-family: ${stack} !important;` : ''}
    font-weight: ${s.fontWeight};
    letter-spacing: ${s.letterSpacing}em; word-spacing: ${s.wordSpacing}em; }
${override ? `body *:not(pre):not(code):not(kbd):not(samp):not(tt) { font-family: inherit${imp}; }` : ''}
body * { color: inherit; }
a:link, a:visited { color: ${t.link} !important; }
p, li, blockquote, dd, div {
    line-height: ${s.lineHeight}${imp};
}
p, li, blockquote, dd {
    text-align: ${s.justify ? 'justify' : 'start'};
    -webkit-hyphens: ${s.hyphenate ? 'auto' : 'manual'};
    hyphens: ${s.hyphenate ? 'auto' : 'manual'};
    widows: 2; orphans: 2;
}
p { margin-top: 0 !important; margin-bottom: ${s.paragraphSpacing}em !important; }
p + p { text-indent: ${s.textIndent}em; }
[align="left"] { text-align: left; } [align="right"] { text-align: right; }
[align="center"] { text-align: center; } [align="justify"] { text-align: justify; }
h1, h2, h3, h4 { line-height: 1.25 !important; text-indent: 0 !important; text-align: center; hyphens: manual; }
h1 + p, h2 + p, h3 + p, hr + p { text-indent: 0 !important; }
pre { white-space: pre-wrap !important; }
img, svg { max-width: 100%; }
${t.dark ? 'img { filter: brightness(.85); }' : ''}
aside[epub|type~="endnote"], aside[epub|type~="footnote"], aside[epub|type~="note"], aside[epub|type~="rearnote"] { display: none; }
::selection { background: ${t.dark ? 'rgba(224,169,109,.35)' : 'rgba(255,196,0,.35)'}; }
.ll-tts { background: ${t.dark ? 'rgba(224,169,109,.18)' : 'rgba(255,214,102,.35)'} !important; border-radius: 3px; }
`
}
