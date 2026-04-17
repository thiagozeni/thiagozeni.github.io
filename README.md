# Thiago Zeni — Site Pessoal

Portfólio pessoal de **Thiago Zeni** — consultor de IA e growth.

🔗 **URL em produção:** https://thiagozeni.com.br
🔗 **Canonical (GitHub Pages):** https://thiagozeni.github.io

## Stack

- HTML + CSS puro (página única `index.html`)
- Sem framework — site estático
- GA4 para analytics
- GitHub Pages + CNAME custom

## Estrutura

```
thiago-zeni/
├── index.html        ← página principal (inline CSS + JS)
├── cases/            ← páginas individuais de cases de sucesso
├── img/              ← fotos e imagens
├── videos/           ← vídeos (hero loop + cases)
├── _cases/           ← rascunhos de cases
├── _old/             ← versões antigas
└── _info/            ← documentação interna
```

## Cases publicados (7)

- **Florense** (2024–2025) — Consultoria independente
- **Programa 4 por 4** (2021–2024) — Brasil Media House
- **JBL Wind** (2021) — via BRA Digital
- **Pró-Jardim STIHL** (2020–2021) — via BRA Digital
- **STIHL Cafezais 360° VR** (2020) — via BRA Digital
- **STIHL 50 Dias de Verde** (2018) — via BRA Digital
- **Mormaii Omnichannel** (2017) — via BRA Digital

## SEO

Implementação completa: meta description, Open Graph, Twitter Card, JSON-LD (Schema.org Person), `robots.txt` e `sitemap.xml`.

> ⚠️ **Sempre rode `/seo-audit` antes de alterações estruturais.** Em março/2026 o site foi entregue sem SEO inicialmente — não repetir.

## Convenções internas

### Home — seção `cgc-awards`

Todo card de case na home exige 3 highlights prefixados com `◈`. Não esquecer ao adicionar case novo.

### Páginas de case

Template fixo (fonts, CSS vars, nav, hero, stats-bar, case-section, case-cta, footer). Usar `cases/stihl-projardim.html` como base.

### Domínios

- `thiagozeni.github.io` → Open Graph
- `thiagozeni.com.br` → canonical + JSON-LD

Manter consistência entre os dois.

### Sitemap

Atualizar `sitemap.xml` ao adicionar case novo. Última modificação: 2026-03-18 (antes do STIHL Cafezais 360°).

## Deploy

GitHub Pages com deploy automático ao push em `main`. CNAME aponta para `thiagozeni.com.br`.

```bash
git push origin main   # publicado em ~1min
```

## Dev local

Qualquer servidor HTTP:

```bash
python3 -m http.server 8000
# http://localhost:8000
```
