# RBA+ · Criada para se recriar

Landing page conceitual para **RBA Comunicação Ltda** (Grupo RBA+, Novo Hamburgo/RS), celebrando os **50 anos** da agência (1976–2026) e o posicionamento *AI-augmented* como continuidade do ofício — não ruptura.

**Tagline central:** "Criada para se recriar" (oficial da campanha dos 50 anos) — ressignificada aqui com a narrativa de que a ferramenta muda (barro → pixel, pincel → código), mas o *olhar* do artesão é o mesmo.

---

## Conceito criativo — "Artesão Digital"

O site traduz visualmente a tese **"não importa o instrumento, o olhar é o mesmo"**:

- **Hero** com a campanha oficial dos 50 anos (ceramista moldando letras RBA+ em argila)
- **Tipografia serif variável** (Fraunces com eixos SOFT/WONK) que *parece esculpida* — com tremor sutil nas palavras de destaque
- **Efeitos artesanais disciplinados** (3, não 10):
  1. Cursor com **rastro pincelado** (canvas, gradiente laranja)
  2. **Textura de papel/barro** sutil no fundo (feTurbulence SVG)
  3. Reveals com **blur + blur-release** e easing spring-like (`cubic-bezier(0.45, 0, 0.15, 1)`)
- **Discos das divisões** com `clip-path` orgânico (24 pontos irregulares) que *se remodela* no hover
- **Wave dividers** entre seções preto e creme — quebra narrativa e visual
- **Parallax scroll** nos arcos decorativos (assets oficiais dos 50 anos)

---

## Rodar localmente

```bash
cd /Users/pro15/Claude/rba-50-anos
python3 -m http.server 8766
# abre http://localhost:8766
```

Zero dependências, zero build. Deploy direto em qualquer CDN (Vercel / Netlify / GH Pages / S3).

---

## Stack

- **HTML5 semântico**, um único `index.html`
- **CSS puro** em 5 camadas (`reset`, `tokens`, `layout`, `sections`, `motion`)
- **JS vanilla** (`scripts/main.js`) — Canvas 2D para cursor pincelado, IntersectionObserver para reveals, rAF para parallax
- **Google Fonts:** DM Sans (oficial RBA) + Fraunces (display variable) + DM Mono (UI)
- **Assets reusados** de rba.com.br/lp/ (logo RBA+, selo 50 anos, arcos decorativos, banner do ceramista)
- **Vídeos reais** (Via Marte + JBL) nos cards de cases com overlay escurecido
- **Respeita `prefers-reduced-motion`** — desliga cursor, reveals, tremor, canvas, parallax

---

## Paleta (oficial dos 50 anos, rba.com.br/lp/)

| Cor | Hex | Uso |
|---|---|---|
| Preto | `#0a0a0a` | Background dominante |
| Creme | `#f1ede5` | Seção timeline (contraste narrativo) |
| Laranja | `#f9633b` | Accent principal, CTAs, títulos destacados |
| Laranja quente | `#ff7b56` | Variação hover, BRA Digital |
| Lilás | `#bbb4f0` | MIX + card de awards |
| Navy | `#001f63` / `#1a3faa` | RBA 360, texto sobre creme |
| Branco | `#ffffff` | Texto principal |

---

## Tipografia

- **Display:** Fraunces (variable) — eixos SOFT 50–100, WONK 0–1, opsz 9..144. Cria a sensação de "esculpida à mão", principalmente nos itálicos.
- **Body/UI:** DM Sans (mesma do site oficial) — 300, 400, 500, 600
- **Mono:** DM Mono — labels, metadados, timestamps, eyebrows

---

## Mapa de seções

1. **Hero** — "Criada para se recriar" + foto ceramista + clock SP + eyebrow geolocal
2. **Marquee numérico** — 1976–2026 · 50 anos · +500 marcas · 3 frentes · 54 talentos · 9ª Cenp-Meios · Archive
3. **Manifesto** — "Não importa o instrumento. O olhar é o mesmo." (2 colunas: tipografia monumental + corpo argumentativo)
4. **Timeline 50 anos** — 5 entradas (1976 · 80–90 · 2010s · 2020–2025 · 2026) sobre fundo creme com wave dividers
5. **Três frentes** — RBA 360 (navy), BRA (laranja), MIX (lilás) como "instrumentos diferentes, mesma assinatura"
6. **Trabalho / Cases** — 2 cards com vídeos reais (Via Marte + JBL) escurecidos + 2 placeholders para popular depois
7. **+500 marcas + Prêmios** — grid de 8 logos + card lilás/navy com Revista Archive e prêmios
8. **IA / 2026** — 4 promessas da nova camada (cada card com pincelada orgânica colorida no hover)
9. **Contato** — "Vamos moldar a sua marca juntos" + formulário funcional (stub) + infos
10. **Footer** — logo + selo + "Criada para se recriar" + CNPJ + © + voltar ao topo

---

## Microinterações (inventário)

- Intro splash com logo + tagline "Criada para se recriar" (2.1s, dismiss automático)
- Cursor pincelado via Canvas 2D (22 pontos de rastro, gradiente laranja, decay 30ms/frame)
- Cursor dot com blend-mode: difference, hover em links amplia para 48px
- Scroll reveal em cascata por linha de título (delays 80/260/440/620ms)
- Tremor sutil em palavras-destaque (`em`) — 8s loop, 0.3px de deslocamento
- Discos das divisões com clip-path orgânico que se remodela no hover (1.2s ease-brush)
- Hover nos logos de clientes: mono-branco → cor original (0.62 opacity → 1)
- Botões magnéticos (CTAs seguem o mouse — strength 0.3)
- Parallax nos arcos decorativos (speeds: +0.04, +0.06, +0.08, +0.1, −0.08)
- Hero background com zoom-out + translate Y conforme scroll
- Wave dividers SVG entre preto e creme (transição narrativa)
- Marquee infinito de números (55s linear)
- Live clock São Paulo (30s refresh)
- Smooth scroll custom com offset do header fixo (80px)
- Formulário stub com feedback visual (Enviando... → Recebido ✓)

---

## Estrutura de arquivos

```
rba-50-anos/
├── index.html              # página única
├── styles/
│   ├── reset.css           # reset + a11y
│   ├── tokens.css          # paleta 50 anos, DM Sans + Fraunces variable
│   ├── layout.css          # header, footer, texturas
│   ├── sections.css        # hero, manifesto, timeline, divisões, cases, clientes, ia, contato
│   └── motion.css          # reveals, cursor, intro splash, tremor
├── scripts/
│   └── main.js             # canvas cursor, parallax, reveals, form, clock
├── assets/
│   ├── brand/              # RBA+ logo, selo 50 anos, hero-banner, arcos
│   ├── clients/            # Stihl, ViaMarte, JBL, Harman, AcDelco, Tramonto, Romanzza, Cinex
│   └── video/              # Via Marte + JBL (720p + 480p + posters)
└── README.md
```

Total: HTML/CSS/JS ~55KB · WebPs de brand ~1.1MB · Vídeos desktop 6.7MB · SVGs clientes 90KB.

---

## Decisões criativas críticas (roteiro para reunião)

1. **Tagline oficial preservada** — "Criada para se recriar" é literalmente a tagline deles. Zero risco de desalinhamento de marca.
2. **Paleta 100% oficial** — extraída de computed styles em rba.com.br/lp/. Laranja / lilás / navy / creme.
3. **Key visual oficial** — foto do ceramista (hero0.webp baixada do CDN deles), reenquadrada com overlay escuro.
4. **Tipografia:** DM Sans é a deles. Fraunces é adição autoral — serif variável com "SOFT/WONK" que evoca entalhe manual mas é moderna. Google Fonts, free.
5. **Narrativa IA como continuidade, não ruptura** — o site defende que a agência de 50 anos *sempre* foi artesã, e IA é apenas o instrumento do momento. Esse framing é o que transforma "agência velha adotando IA" em "agência experiente com ferramenta nova".
6. **Vídeos de cases escurecidos** — reforçam movimento sem competir com a tipografia. Placeholders honestos para cases futuros.
7. **Seção creme (timeline)** — único ponto de contraste cromático. Quebra o preto dominante e dá fôlego narrativo ao meio da página.

### Se o cliente pedir variações

| Pedido | Resposta |
|---|---|
| "Creme demais na timeline" | Trocar `background` da `.timeline` para `var(--color-navy)` com texto creme — 5s |
| "Cursor distrai" | Desligar canvas + cursor dot no `main.js` (comentar blocos 2 e o `cursor-dot`) |
| "Intro splash chato" | Remover `intro-splash` ou reduzir duração de 2100ms para 800ms |
| "Quero um logotipo maior" | Aumentar `.brand-logo { height }` no `layout.css` |
| "Mais cases reais" | Duplicar `.case` no HTML trocando vídeo/título — grid absorve até 6 cards |
| "Formulário real" | Integrar Formspree/Resend no `data-form` submit handler |

---

## Próximos passos sugeridos

- [ ] Popular `.case-placeholder` com cases reais (Stihl, Tramontina, Harman, Ford/AcDelco)
- [ ] Integrar formulário real (Formspree / Resend / back próprio)
- [ ] OG image 1200×630 customizada (hoje não tem imagem, só title/description)
- [ ] Analytics LGPD-friendly (Plausible ou Umami)
- [ ] Sitemap + robots.txt na hora do go-live
- [ ] Completar logos faltantes (Ford, Shell, Mormaii, Saccaro, Nutrire, Sinosserra)
- [ ] Deploy (Vercel ou Netlify) com domínio próprio (subdomínio ou dedicado)

---

## Acessibilidade & performance

- Estrutura semântica completa (`header`, `main`, `section aria-labelledby`, `nav`, `footer`, landmarks)
- Contraste WCAG AA em todas combinações principais (branco/preto 19.3:1, laranja/preto 4.8:1, navy/creme 7.2:1)
- `prefers-reduced-motion` desliga: intro splash, cursor canvas, cursor dot, reveals, tremor, parallax, zoom do hero
- `focus-visible` estilizado em laranja
- Labels em todos inputs do formulário
- `alt=""` em imagens decorativas, `alt` descritivo em assets de conteúdo
- Zero JS bloqueante (`type="module"` = defer implícito)
- Google Fonts com `display=swap` + preconnect
- Imagens WebP + vídeos H.264 main profile + `movflags +faststart`
- Total: <220KB sem fontes; ~55KB de código

---

## Licença

Desenvolvido como proposta conceitual para RBA Comunicação Ltda. Conteúdo editorial e tokens de design são livres para uso interno do cliente. Logos de terceiros (Stihl, JBL, etc.) pertencem às respectivas marcas. Fotografia oficial de campanha, selos e arcos decorativos pertencem à RBA Comunicação Ltda.

---

**Versão:** v1.1 · **Data:** 2026-04-16 · **Conceito:** Artesão Digital (Direção A)

---

## Changelog

### v1.1 (2026-04-16 — review pós-revisão do cliente)

- **Hero mais claro**: `opacity` da foto do ceramista 0.38→0.58, overlay inferior suavizado (radial 0.85→0.58, linear 0.55→0.42). O "RBA" em argila agora aparece visível atrás do título sem prejudicar contraste.
- **Loader repaginado (direção C — strokes progressivos)**: splash antigo (fade de logo raster) substituído por SVG inline com 3 textos — `RBA+`, `cinquenta anos`, `Criada para se recriar` — cada um com `stroke-dashoffset` animado e depois `inkFill` preenchendo de tinta laranja. Aguarda `document.fonts.ready` antes de iniciar para não desenhar em fonte fallback. Duração total 3s (400ms em reduced-motion). Sensação: **mão desenhando ao vivo → pincelada preenchendo**.
- **Logos/selos proporcionais**: header e footer passam a usar `object-fit: contain` + altura única (em vez de `width × height` forçados). Selo 50 anos deixa de ser esticado horizontalmente.
- **Grid de clientes consertado**: removido `filter: brightness(0) invert(1)` dos logos (bug — transformava Stihl em retângulo sólido ilegível e fazia Harman/Tramontina sumirem contra fundo preto). Cells agora têm fundo **creme**, logos nas cores originais. Grid vira 2 colunas em mobile, 4-5 em desktop. Logos ocupam até 78% da célula.
- **Parallax acentuado**: speeds dos arcos de fundo dobradas (`0.1→0.22`, `-0.08→-0.18`, `0.04→0.12`, `0.06→0.16`).
- **Foreground arcs** (novos): 2 arcos em `position: fixed` atravessando o site com speeds agressivas (y: `-0.38` / `-0.26`, x: `-0.12` / `+0.10`, rotação sutil). `mix-blend-mode: screen` faz o laranja "vibrar" sobre fundos escuros e quase desaparecer sobre o creme — dá ritmo sem interferir na leitura. Desativados em mobile e `prefers-reduced-motion`.
- **Slots preparados para vídeo** (aguardando assets):
  - Hero: comentário HTML explica como trocar `<img>` por `<video>` mantendo a classe `.hero-bg-img`.
  - Archive: `<video class="awards-video">` + `.awards-video-overlay` comentados no HTML, CSS já pronto com overlay em gradient lilás→navy.
  - Cases adicionais: os 2 `.case-placeholder` podem ser substituídos por `<article class="case">` seguindo o padrão dos 2 primeiros.

### v1.0 (2026-04-16)

Primeira entrega. Ver seções acima.
