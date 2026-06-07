# Notas da v2.0 — revisão da manhã

**O que é:** uma cópia isolada do site (`/v2`, com `noindex` + bloqueio no robots) reposicionada sobre o **fio da inovação**, com as duas camadas que combinamos (oferta + laboratório). **O `index.html` real não foi tocado.**

**Como revisar:** abra `https://thiagozeni.com/v2` (funciona no celular). Tudo que é suposição minha está marcado no código com `<!-- [REVISAR v2] -->` e listado abaixo. Me diga o que mantém, corta ou corrige — eu aplico e aí migramos para o site real.

---

## Decisões que você já aprovou
- **Eixo narrativo:** o fio da inovação (marketing é o palco; inovação é o papel; IA é o ápice).
- **Prova de IA:** duas camadas — Oferta ("Como trabalho") + Laboratório (projetos autorais com IA).
- **Mantidos intactos por sua decisão:** o hero com fator wow (pin 300vh) e o cursor custom.

## Nova ordem das seções
`Sobre → A Linha da Inovação → Competências → Como trabalho (NOVA) → Marcas → Cases → Laboratório (NOVA) → Reconhecimento → Contato`

---

## O que mudou, seção por seção

### Hero
- Tagline trocada para inovação-first: *"Há 28 anos faço marcas inovarem. A IA é só o capítulo mais recente."*
- Stats: `Anos inovando · Marcas atendidas · Prêmios & distinções`.
- **[CONFIRMAR números]** Troquei "10 vezes premiado" (que subvendia) por **20** prêmios & distinções, e mantive **40** marcas. Os dois precisam do seu número real — hoje são defensáveis, mas chutados.

### Manifesto
- Reescrito inteiro: *"O marketing foi o meu palco; a inovação, sempre, o meu papel..."* (some o "três décadas de marketing digital"). Atualizei também o texto animado palavra-a-palavra no JS.

### Sobre
- Reescrito com sua história real: **webmaster aos 13**, evolução por especialização, gestor-estrategista, formação em **Administração**.
- **Corrigido o erro factual:** saiu "sócio de agência há mais de 20 anos"; a sociedade agora aparece como o **degrau final** da evolução, não um período de 20 anos.
- **[CONFIRMAR]** idade de início (pus 13), a sequência exata dos degraus, e se "Diretor de Grupo de Comunicação" deve voltar em algum lugar (removi por não bater com a timeline).

### A Linha da Inovação (era "Trajetória")
- **A maior mudança.** Deixou de ser lista de cargos e virou uma sequência de **marcos de inovação**: IA hoje → 4por4 (2021–24) → VR STIHL (2020) → Pró-Jardim/EAD (2020–21) → Mormaii/omnichannel (2017) → Flash/motion (anos 2000).
- A trajetória de cargos foi **condensada numa linha** ao final (preserva credibilidade executiva: BRA, Brasil Media House CMO/CTO, ABRADi VP, Investidor).
- **[CONFIRMAR]** o período do marco "Flash/anos 2000" e se quer datas mais precisas em cada marco.

### Competências (era "Habilidades")
- Reenquadrada de *"Funções que já desempenhei"* (lista de cargos → lia como dispersão) para *"Camadas que se acumulam"*, com um texto que vende o **T-shaped**: amplitude que fundamenta profundidade em IA. Os 10 cards continuam.

### Como trabalho — SEÇÃO NOVA (oferta)
- **[RASCUNHO — sua palavra final]** Propus 4 modos em tom sóbrio, sem CTA marketeiro: Diagnóstico de maturidade · Roadmap de inovação · Implementação assistida · Advisory de board.
- Revise nomes, textos e se são esses mesmos os 4 modos. É um ponto de partida.

### Cases
- Numeração e enquadramento ajustados: título virou *"Inovações que viraram resultado"*. **Não reordenei os 7 cards** (Florense/IA já abre). Sugestão para depois: subir VR e Mormaii para reforçar o eixo inovação.

### Laboratório — SEÇÃO NOVA (prova de builder)
- **[CURADORIA CONSERVADORA — confirme]** Só projetos autorais e públicos, zero cliente. Coloquei 3 cards: **Werdum Fight** (jogo, app stores, link real), **Radar de IA** (ferramenta própria), **Ferramental de IA** (infra própria).
- **Candidatos que NÃO usei** (decida se entram): tennis-anywhere (PWA pessoal), os sites feitos com IA (magma, cachorradas), o claude-hub. **Deixei de fora tudo que é de cliente** (eat-kitchen, vídeos RBA/Via Marte/STIHL) por confidencialidade.
- **[CONFIRMAR]** como descrever o uso de IA no Werdum Fight sem exagerar, e quais projetos entram de fato.

### Marcas / Reconhecimento
- Apenas renumeradas (05 e 08). Conteúdo intacto.

### Metadados (head)
- Título da aba, descrições sociais e JSON-LD reposicionados para inovação-first (eram "Marketing Digital & Liderança Executiva").

---

## Pendências que dependem só de você
1. **Números do hero** (marcas, prêmios) — me passa os reais.
2. **A oferta** — validar/reescrever os 4 modos.
3. **Curadoria do Laboratório** — confirmar os 3 + dizer o que falta.
4. **Fatos do Sobre/Linha** — idade de início, datas, títulos.

## Pontos do meu diagnóstico que NÃO mexi (aguardam sua decisão)
- **Form de contato `mailto`** (perde lead se o visitante não tem cliente de e-mail) — trocar por envio real é um passo técnico simples quando você quiser.
- **E-mail @gmail** vs @thiagozeni.com — detalhe de percepção premium.
- **Canonical** no site real aponta para `github.io` (no v2 é irrelevante por ser noindex, mas corrigir no real).

## Sugestões para uma v2.1 (não feitas agora)
- Reordenar os cases para puxar inovação/IA à frente.
- A "Linha da Inovação" poderia virar uma timeline visual dedicada (com datas que você confirmar).
- Testar a posição da Oferta (antes vs depois dos cases).
