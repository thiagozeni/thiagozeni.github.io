# Apresentação · Mapeamento do app The Coffee · Deck #3

Deck HTML interno para apresentar o benchmark funcional do app The Coffee e sua tradução para o app da EAT Kitchen — com foco em mesa via QR, retirada e delivery próprio sobre a mesma espinha.

## Arquivos

| Caminho | Conteúdo |
|---|---|
| `index.html` | deck navegável em tela cheia (17 slides) |
| `index.codex-original.html.bak` | versão original gerada pelo codex (backup) |
| `assets/screens/` | 60 prints recortados do app The Coffee |
| `assets/boards/` | pranchas compostas para slides de síntese |

## Estrutura dos slides

| # | Slide | Função |
|---:|---|---|
| 01 | Capa | hero com atlas como background |
| 02 | Escopo & método | 60 telas · 9 áreas · 4 pilares · 3 fluxos EAT · disclaimer de não-cópia |
| 03 | Calibração | EAT ≠ The Coffee — café x restaurante saudável full-service |
| 04 | Atlas | inventário visual das 60 telas |
| 05 | 4 pilares observados | pedido por canal · cardápio modular · checkout · relacionamento |
| 06 | Tese | manifesto "canal antes de tudo" |
| 07 | Arquitetura | espinha canal → unidade → cardápio → … → CRM, com 3 canais EAT |
| 08 | Onboarding & home | telas + leitura para EAT |
| 09 | Cardápio modular | telas + camadas (produto EAT, regra de canal) |
| 10 | Carrinho & checkout | fila visual, cupom, CPF, Pix |
| 11 | Delivery & endereço | board + regras (raio, taxa, prazo, unidade responsável) |
| 12 | Fidelidade | comparação direta The Coffee vs EAT MVP |
| 13 | Modelo de dados | 6 entidades coloridas |
| 14 | Lacunas | o que os prints NÃO mostram (mesa, status, avaliação, cancelamento, suporte, backoffice) |
| 15 | Recomendações | MVP P0 · Fase 2 P1 |
| 16 | Cuidado de produto | princípio de mínima fricção (login leve, campos no momento certo) |
| 17 | Encerramento | próximos passos + assinatura ZN |

## Identidade visual

Mesma do deck #1 (`apresentacao/`), deck #2 (`apresentacao-voz-cliente/`) e deck #4 (`apresentacao-expansao/`):

- preto puro `#000` · acentos `--zn-lime #C6FF00` · semânticos `--rust`, `--warn`, `--good`
- tipografia Sora (display) + Manrope (body) + Unbounded (logo ZN.) + JetBrains Mono
- header fixo com logo ZN. (dot lime pulsante)
- progress rail vertical · scroll-snap fullscreen
- footer ZN signature no slide final

## Fontes da pesquisa

- `pesquisa/07-benchmark-app-the-coffee.md` — análise do menu online público
- `pesquisa/08-mapeamento-telas-app-the-coffee.md` — mapeamento das 60 telas (2 rodadas)
- `_source/prints-the-coffee-app/` — capturas originais

## Uso

Abrir `index.html` no navegador. Funciona offline (fontes via CDN do Google).

Atalhos:

- ↓ / Page Down / Espaço · próximo slide
- ↑ / Page Up · slide anterior
- Home / End · primeiro / último
- Click nos pips à direita · navegação direta
