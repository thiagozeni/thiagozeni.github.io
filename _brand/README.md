# ZN. — Logo Explorations & Brand Manual

Pasta com a exploração completa de identidade da marca **ZN.** (Thiago Zeni), entregue em 3 etapas:

## 📐 1. Exploração inicial — 6 alternativas

→ `logo-alternativas.html`

Grid lado-a-lado com as 6 direções iniciais (Brutalist Core, Stencil Block, Outline Ghost, Geometric Monogram, Editorial Serif, Split Glitch). Usado pra alinhar direção antes do manual.

## 📖 2. Manual de Marca v1.0

→ `manual-de-marca.html`

Especificação completa em 9 seções:
- 01 Identidade · 02 Sistema de variantes · 03 Construção · 04 Clear space + tamanho mínimo
- 05 Paleta · 06 Tipografia · 07 Superfícies · 08 Proibições · 09 Aplicações

**Sistema final = 6 variantes:** ZN. Solid (master), Block, Ghost, Split, Mono White, Mono Black.

## 🎯 3. Assets prontos pra produção

### `svg/` — 6 variantes em SVG vetor
- `zn-solid.svg` — master (uso primário)
- `zn-block.svg` — selo lime (OG, badge, watermark)
- `zn-ghost.svg` — outline com glow (hero, vinheta)
- `zn-split.svg` — glitch editorial (campanha)
- `zn-mono-white.svg` — 1 cor branco (fundos escuros sem lime)
- `zn-mono-black.svg` — 1 cor preto (impressão, gravação, fax)

> ⚠️ SVGs usam fonte Unbounded com fallback Arial Black. Pra portabilidade total
> (Adobe, embed em PDF), converter texto pra outline em Figma/Illustrator.

### `favicon/` — set completo de favicons
- `favicon.svg` — master vetor (escala perfeito)
- `favicon-16.png` · `favicon-32.png` · `favicon-48.png` — sizes browser
- `favicon-192.png` · `favicon-512.png` — Android Chrome / PWA
- `apple-touch-icon.png` — 180×180 iOS

**HTML pra colar no `<head>`:**
```html
<link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/img/favicon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/img/favicon-512.png">
```

> Pra substituir o atual em produção: copiar tudo de `favicon/` pra `/img/`
> e atualizar o `<head>` do `index.html`.

### `email/` — assinatura HTML
- `assinatura-email.html` — preview + código + 3 variantes (master, minimal, dark)

Table layout, inline styles only, Arial Black como fallback (Unbounded não carrega em email). Compatível com Gmail, Apple Mail, Outlook, Spark, Superhuman.

## Próximos passos sugeridos

- [ ] Aprovar deploy do favicon set substituindo `/img/favicon.svg` atual
- [ ] Atualizar `<head>` do `index.html` com as 6 referências de favicon
- [ ] Gerar OG image 1200×630 com variante Solid + tagline
- [ ] Aplicar avatar (variante Block circular) nas redes (LinkedIn, X, GitHub)
- [ ] Atualizar `brand-guide-thiago-zeni` skill com referência a este manual
- [ ] Considerar converter SVGs pra outline (Figma) pra distribuição externa

---

_Gerado em 2026-04-27 · Manual versão 1.0_
