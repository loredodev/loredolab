# 📖 Leitor Loredo

Leitor de livros para PC (Windows, Linux e macOS) feito para **ler com conforto e dominar o que você lê**.
Visual de livro de verdade — duas páginas lado a lado, lombada no meio, bordas de folhas, textura de papel e som de página virando.

## Formatos suportados

| Tipo | Formatos |
|---|---|
| E-books | **EPUB**, **MOBI**, **AZW**, **AZW3 / KF8**, **PRC**, **FB2**, **FBZ** |
| Documentos | **PDF**, **DOCX** (Word), **ODT** (LibreOffice), **RTF** |
| Texto | **TXT** (detecta capítulos automaticamente), **Markdown**, **HTML / XHTML** |
| Quadrinhos / mangá | **CBZ**, **CBR** |

> Livros com DRM (proteção de loja, como alguns da Amazon) não podem ser abertos por nenhum leitor de terceiros.

## Recursos

**Leitura**
- 2 páginas (como livro aberto), 1 página ou rolagem contínua; animação e som ao virar página
- 13 temas: Papel, Branco, Sépia, Pergaminho, Cinza, Verde descanso, Azul névoa, Rosa antigo, Noite, Ardósia, Preto total (AMOLED), Terminal e **Personalizado** (escolha as cores)
- 22 fontes: Literata, Merriweather, Lora, EB Garamond, Crimson Pro, Libre Baskerville, Source Serif, Noto Serif, Alegreya, Playfair, Open Sans, Roboto, Inter, **Atkinson Hyperlegible**, **OpenDyslexic** (dislexia) e fontes do sistema
- Tamanho, peso, altura da linha, espaço entre parágrafos, recuo, espaçamento de letras e palavras, justificação, hifenização, largura da página e margens
- Brilho e **luz noturna** (tom quente); inversão de cores do PDF em temas escuros; zoom para PDF e quadrinhos
- Cabeçalho com título/capítulo e número de página, barra de progresso com marcas de capítulo e **tempo estimado para terminar**

**Anotações**
- Destaque em 6 cores e 4 estilos: marca‑texto, sublinhado, ondulado e tachado
- Notas em qualquer trecho, marcadores de página (Ctrl+B)
- Painel com filtros por cor/nota/marcador e busca; exportação em **Markdown, HTML ou TXT**
- **Caderno de estudo** por livro (resumos, citações, tarefas), salvo automaticamente
- Tela “Anotações” reunindo os destaques de todos os livros

**Tradução e pesquisa** (precisam de internet)
- Tradução de palavra, trecho ou da página inteira para 20 idiomas, com áudio
- Dicionário (definições, exemplos, sinônimos, pronúncia) e resumo da Wikipédia
- **Vocabulário**: palavras traduzidas ficam salvas com o contexto; exporte em CSV (Excel/Anki) ou transforme em flashcards
- Busca no livro inteiro com opções de maiúsculas, palavra inteira e acentos

**Estudo — para dominar o livro**
- **Flashcards com repetição espaçada** (algoritmo SM‑2): a partir de destaques, de palavras ou criados à mão; gerador de lacunas (cloze)
- **Assistente de IA (Claude)** opcional: resumo do capítulo, ideias‑chave, mapa mental, quiz com gabarito, personagens/conceitos (sem spoilers), como aplicar, explicação simples (Feynman), explicação de trechos e **flashcards automáticos** — além de um chat sobre o livro
- **Estatísticas**: meta diária, sequência de dias lendo, gráfico dos últimos 30 dias, mapa de calor do ano, tempo por livro, meta anual de livros

**Foco e acessibilidade**
- Leitura em voz alta com as vozes do sistema, destacando o parágrafo e virando páginas sozinha
- Modo foco, tela cheia, **régua de leitura**, virada automática de páginas, **Pomodoro**
- Atalhos de teclado (pressione `?` para ver todos)

**Biblioteca**
- Estante com capas, “continue de onde parou”, status (lendo, quero ler, concluído…), favoritos, avaliação, **coleções**, busca e ordenação
- Arraste livros para a janela, importe uma pasta inteira ou abra arquivos com duplo clique (associação de arquivos)
- Backup e restauração de todas as anotações, cartões, vocabulário e estatísticas

## Como instalar (Windows)

1. Abra a aba **Actions** do repositório no GitHub → workflow **“Leitor Loredo — gerar instaladores”** → execução mais recente.
2. Baixe o artefato **leitor-loredo-windows-latest**.
3. Dentro do zip há dois arquivos:
   - `Leitor Loredo Setup x.y.z.exe` — instalador (cria atalho na área de trabalho);
   - `LeitorLoredo-Portatil-x.y.z.exe` — versão portátil, roda sem instalar.

> Como o app não tem assinatura digital paga, o Windows SmartScreen pode avisar na primeira execução: clique em **Mais informações → Executar assim mesmo**.

## Rodar a partir do código

Requer [Node.js](https://nodejs.org) 20 ou mais recente.

```bash
cd leitor-livros
npm install
npm start            # abre o aplicativo
npm run dist:win     # gera o instalador para Windows (em dist/)
npm run dist:linux   # AppImage para Linux
npm run dist:mac     # DMG para macOS (precisa rodar num Mac)
```

## Assistente de IA

Opcional. Em **Configurações → Assistente de IA**, cole uma chave da API da Anthropic (crie em <https://console.anthropic.com/settings/keys>). A chave fica salva apenas no seu computador e o uso é cobrado pela Anthropic. O assistente lê o capítulo em que você está para responder.

## Onde ficam os dados

Os livros importados são copiados para a pasta de dados do aplicativo (no Windows, `%APPDATA%\Leitor Loredo`), junto com anotações, cadernos, flashcards e estatísticas. Use **Configurações → Dados e backup** para fazer cópias de segurança.

## Créditos

Motor de renderização: [foliate-js](https://github.com/johnfactotum/foliate-js) (MIT) com pdf.js, zip.js e fflate. Conversão de DOCX: mammoth. Markdown: marked. RAR: node-unrar-js. Fontes: Fontsource (licenças OFL).
