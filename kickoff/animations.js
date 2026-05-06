/**
 * animations.js — Motion design RBA+ com Web Animations API.
 *
 * Por que WAAPI em vez de CSS keyframes:
 *  - Controle preciso de delay/duração/easing por elemento.
 *  - Sem race-condition com troca de atributo [data-deck-active].
 *  - Saídas reais (exit) e re-entradas sem "flash" do conteúdo.
 *
 * Fluxo:
 *  (1) Na inicialização, TODO slide passa por prepareSlide() — que
 *      corta títulos em palavras (para reveal em cascata), marca
 *      elementos animáveis com classe .rba-anim (opacity:0 via CSS)
 *      e aplica um baseline transform inline. Isso acontece antes do
 *      deck-stage pintar a cena, então não há flash.
 *  (2) Em cada 'slidechange', saída do antigo + entrada do novo via
 *      WAAPI; easing, stagger e variação por tipo de elemento.
 *  (3) Parallax de mouse, progress bar, dot rail e count-up de números.
 */

(() => {
  const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
  const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.44, 1)';
  const EASE_SOFT = 'cubic-bezier(0.16, 1, 0.3, 1)';

  // Seletores de elementos animáveis, em ordem de prioridade visual.
  const TARGETS = [
    { sel: '.sec-label',             kind: 'label' },
    { sel: '.cover-eyebrow',         kind: 'label' },
    { sel: '.cover-top',             kind: 'label' },
    { sel: '.cover-title',           kind: 'title' },
    { sel: '.cover-meta',            kind: 'fade-up' },
    { sel: '.slide-title',           kind: 'title' },
    { sel: '.col-heading',           kind: 'title' },
    { sel: '.divider-num',           kind: 'big-num' },
    { sel: '.divider-title',         kind: 'title' },
    { sel: '.big-num',               kind: 'big-num' },
    { sel: '.body-text p',           kind: 'fade-up' },
    { sel: '.two-col > *',           kind: 'fade-up' },
    { sel: '.agenda-list li',        kind: 'agenda-row' },
    { sel: '.three-up > *',          kind: 'card' },
    { sel: '.axis-card',             kind: 'card' },
    { sel: '.card',                  kind: 'card' },
    { sel: '.people-grid .person',   kind: 'person' },
    { sel: '.dx-table thead',        kind: 'label' },
    { sel: '.dx-table tbody tr',     kind: 'row' },
    { sel: '.matrix thead',          kind: 'label' },
    { sel: '.matrix tbody tr',       kind: 'row' },
    { sel: '.bullet',                kind: 'fade-right' },
    { sel: '.chip',                  kind: 'chip' },
  ];

  // --------------------------------------------------------------
  //  Prep: split de títulos em palavras, mark de elementos
  // --------------------------------------------------------------
  function splitTitleWords(el) {
    if (el.__rbaSplit) return;
    el.__rbaSplit = true;

    // Preserva <em> / <br/> enquanto quebra o resto em palavras
    const walk = (node, output) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent;
          const parts = text.split(/(\s+)/);
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              const sp = document.createElement('span');
              sp.className = 'rba-split-word rba-split-word--space';
              output.appendChild(sp);
            } else {
              const w = document.createElement('span');
              w.className = 'rba-split-word';
              w.textContent = part;
              output.appendChild(w);
            }
          });
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = child.tagName;
          if (tag === 'BR') {
            output.appendChild(child.cloneNode());
          } else if (tag === 'EM') {
            // envolve o <em> como container e quebra o texto interno
            const em = child.cloneNode(false);
            em.classList.add('rba-split-em');
            walk(child, em);
            output.appendChild(em);
          } else {
            const clone = child.cloneNode(false);
            walk(child, clone);
            output.appendChild(clone);
          }
        }
      });
    };

    const frag = document.createElement('span');
    frag.style.display = 'inline';
    walk(el, frag);
    el.innerHTML = '';
    while (frag.firstChild) el.appendChild(frag.firstChild);
  }

  function prepareSlide(slide) {
    if (slide.__rbaPrepared) return;
    slide.__rbaPrepared = true;

    const collected = [];
    const seen = new Set();
    TARGETS.forEach(({ sel, kind }) => {
      slide.querySelectorAll(sel).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        collected.push({ el, kind });
      });
    });

    // Dedup: se um container tem descendentes já na lista, pula o container.
    const set = new Set(collected.map((c) => c.el));
    const filtered = collected.filter(({ el }) => {
      for (const other of set) {
        if (other !== el && el.contains(other)) return false;
      }
      return true;
    });

    // Ordena top-down para cascata natural
    filtered.sort((a, b) => {
      const ra = a.el.getBoundingClientRect();
      const rb = b.el.getBoundingClientRect();
      if (Math.abs(ra.top - rb.top) < 4) return ra.left - rb.left;
      return ra.top - rb.top;
    });

    filtered.forEach(({ el, kind }, i) => {
      el.classList.add('rba-anim');
      el.dataset.animKind = kind;
      el.dataset.animOrder = i;

      if (kind === 'title') {
        splitTitleWords(el);
      }
    });

    slide.__rbaTargets = filtered;
  }

  // --------------------------------------------------------------
  //  Animações por tipo — retornam Animation(s)
  // --------------------------------------------------------------
  function animateLabel(el, delay, reverse = false) {
    return el.animate(
      reverse
        ? [{ opacity: 1, transform: 'none', letterSpacing: '0.12em' },
           { opacity: 0, transform: 'translate3d(0, -8px, 0)', letterSpacing: '0.2em' }]
        : [{ opacity: 0, transform: 'translate3d(0, -8px, 0)', letterSpacing: '0.2em' },
           { opacity: 1, transform: 'none', letterSpacing: '0.12em' }],
      { duration: 620, delay, easing: EASE_OUT, fill: 'both' }
    );
  }

  function animateTitle(el, delay, reverse = false) {
    // o elemento em si não anima — apenas revela. Cada .rba-split-word anima.
    el.style.opacity = '1';
    const words = el.querySelectorAll('.rba-split-word');
    const ems = el.querySelectorAll('.rba-split-em');
    const anims = [];
    words.forEach((w, i) => {
      if (w.classList.contains('rba-split-word--space')) return;
      const d = delay + i * 42;
      const a = w.animate(
        reverse
          ? [
              { opacity: 1, transform: 'none', filter: 'blur(0)' },
              { opacity: 0, transform: 'translate3d(0, -0.4em, 0) rotate(-2deg)', filter: 'blur(4px)' },
            ]
          : [
              { opacity: 0, transform: 'translate3d(0, 0.55em, 0) rotate(3deg)', filter: 'blur(6px)' },
              { opacity: 1, transform: 'none', filter: 'blur(0)' },
            ],
        { duration: 820, delay: d, easing: EASE_SOFT, fill: 'both' }
      );
      anims.push(a);
    });
    // Underline wipe nos <em>
    if (!reverse) {
      const total = words.length * 42;
      ems.forEach((em, i) => {
        setTimeout(() => em.classList.add('is-underlined'), delay + total + 120 + i * 90);
      });
    } else {
      ems.forEach((em) => em.classList.remove('is-underlined'));
    }
    return anims;
  }

  function animateFadeUp(el, delay, reverse = false) {
    return el.animate(
      reverse
        ? [{ opacity: 1, transform: 'none', filter: 'blur(0)' },
           { opacity: 0, transform: 'translate3d(0, -24px, 0)', filter: 'blur(4px)' }]
        : [{ opacity: 0, transform: 'translate3d(0, 36px, 0)', filter: 'blur(6px)' },
           { opacity: 1, transform: 'none', filter: 'blur(0)' }],
      { duration: 760, delay, easing: EASE_SOFT, fill: 'both' }
    );
  }

  function animateFadeRight(el, delay, reverse = false) {
    return el.animate(
      reverse
        ? [{ opacity: 1, transform: 'none' },
           { opacity: 0, transform: 'translate3d(-24px, 0, 0)' }]
        : [{ opacity: 0, transform: 'translate3d(-36px, 0, 0)' },
           { opacity: 1, transform: 'none' }],
      { duration: 620, delay, easing: EASE_OUT, fill: 'both' }
    );
  }

  function animateCard(el, delay, reverse = false) {
    return el.animate(
      reverse
        ? [
            { opacity: 1, transform: 'none' },
            { opacity: 0, transform: 'translate3d(0, -30px, 0) scale(0.95) rotate(-1deg)' },
          ]
        : [
            { opacity: 0, transform: 'translate3d(0, 60px, 0) scale(0.9) rotate(1.5deg)' },
            { opacity: 1, transform: 'translate3d(0, -8px, 0) scale(1.02) rotate(0deg)', offset: 0.7 },
            { opacity: 1, transform: 'none' },
          ],
      { duration: 900, delay, easing: EASE_SPRING, fill: 'both' }
    );
  }

  function animatePerson(el, delay, reverse = false) {
    const kf = reverse
      ? [{ opacity: 1, transform: 'none' },
         { opacity: 0, transform: 'translate3d(0, -10px, 0)' }]
      : [{ opacity: 0, transform: 'translate3d(0, 24px, 0)', filter: 'blur(4px)' },
         { opacity: 1, transform: 'none', filter: 'blur(0)' }];
    return el.animate(kf, { duration: 620, delay, easing: EASE_OUT, fill: 'both' });
  }

  function animateAgendaRow(el, delay, reverse = false) {
    const kf = reverse
      ? [{ opacity: 1, transform: 'none' },
         { opacity: 0, transform: 'translate3d(-40px, 0, 0)' }]
      : [{ opacity: 0, transform: 'translate3d(-80px, 0, 0)', filter: 'blur(3px)' },
         { opacity: 1, transform: 'none', filter: 'blur(0)' }];
    return el.animate(kf, { duration: 780, delay, easing: EASE_SOFT, fill: 'both' });
  }

  function animateRow(el, delay, reverse = false) {
    const kf = reverse
      ? [{ opacity: 1, transform: 'none' },
         { opacity: 0, transform: 'translate3d(-12px, 0, 0)' }]
      : [{ opacity: 0, transform: 'translate3d(-20px, 0, 0)' },
         { opacity: 1, transform: 'none' }];
    return el.animate(kf, { duration: 440, delay, easing: EASE_OUT, fill: 'both' });
  }

  function animateChip(el, delay, reverse = false) {
    const kf = reverse
      ? [{ opacity: 1, transform: 'none' },
         { opacity: 0, transform: 'scale(0.6) rotate(-8deg)' }]
      : [{ opacity: 0, transform: 'scale(0.6) rotate(8deg)' },
         { opacity: 1, transform: 'scale(1.08) rotate(0deg)', offset: 0.7 },
         { opacity: 1, transform: 'scale(1)' }];
    return el.animate(kf, { duration: 680, delay, easing: EASE_SPRING, fill: 'both' });
  }

  function animateBigNum(el, delay, reverse = false) {
    // Contador opcional: se o texto é só dígitos/percentuais, conta
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)([^\d]*)$/);
    const numeric = match && !reverse;
    if (numeric) el.textContent = '0' + (match[2] || '');

    const anim = el.animate(
      reverse
        ? [
            { opacity: 1, transform: 'none', filter: 'blur(0)', letterSpacing: '-0.04em' },
            { opacity: 0, transform: 'scale(1.3)', filter: 'blur(12px)', letterSpacing: '0.2em' },
          ]
        : [
            { opacity: 0, transform: 'scale(0.5)', filter: 'blur(20px)', letterSpacing: '0.25em' },
            { opacity: 1, transform: 'scale(1.05)', filter: 'blur(0)', letterSpacing: '-0.02em', offset: 0.7 },
            { opacity: 1, transform: 'scale(1)', filter: 'blur(0)', letterSpacing: '-0.04em' },
          ],
      { duration: 1300, delay, easing: EASE_SPRING, fill: 'both' }
    );
    if (numeric) {
      const target = parseInt(match[1], 10);
      const suffix = match[2] || '';
      const start = performance.now() + delay;
      const dur = 1200;
      const tick = (t) => {
        const elapsed = t - start;
        if (elapsed < 0) { requestAnimationFrame(tick); return; }
        const p = Math.min(1, elapsed / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    return anim;
  }

  const DISPATCH = {
    'label': animateLabel,
    'title': animateTitle,
    'fade-up': animateFadeUp,
    'fade-right': animateFadeRight,
    'card': animateCard,
    'person': animatePerson,
    'agenda-row': animateAgendaRow,
    'row': animateRow,
    'chip': animateChip,
    'big-num': animateBigNum,
  };

  // --------------------------------------------------------------
  //  Orquestração
  // --------------------------------------------------------------
  const STAGGER_BY_KIND = {
    'label': 0,
    'title': 40,
    'fade-up': 110,
    'fade-right': 80,
    'card': 140,
    'person': 55,
    'agenda-row': 95,
    'row': 35,
    'chip': 65,
    'big-num': 0,
  };
  const BASE_DELAY = 120;

  function enterSlide(slide) {
    prepareSlide(slide);
    // Cancela qualquer animação em curso neste slide
    cancelActive(slide);

    const targets = slide.__rbaTargets || [];
    let cursor = BASE_DELAY;
    const kindIndex = {};

    targets.forEach(({ el, kind }) => {
      const fn = DISPATCH[kind] || animateFadeUp;
      // Stagger: a cada item do mesmo tipo, incrementa um pouco;
      // e reserva uma base crescente conforme progride no slide.
      kindIndex[kind] = (kindIndex[kind] || 0) + 1;
      const step = STAGGER_BY_KIND[kind] ?? 90;
      const delay = cursor;
      cursor += step;

      const res = fn(el, delay, false);
      el.__rbaAnim = res;
    });

    slide.__rbaEntered = true;
  }

  function exitSlide(slide) {
    if (!slide || !slide.__rbaEntered) return;
    const targets = slide.__rbaTargets || [];

    // Saída curta: todos caem juntos com pequeno stagger inverso
    const total = targets.length;
    targets.forEach(({ el, kind }, i) => {
      const fn = DISPATCH[kind] || animateFadeUp;
      const delay = (total - i) * 10;
      try { fn(el, delay, true); } catch (e) { /* noop */ }
    });
  }

  function cancelActive(slide) {
    const targets = slide.__rbaTargets || [];
    targets.forEach(({ el }) => {
      const a = el.__rbaAnim;
      if (a) {
        if (Array.isArray(a)) a.forEach((x) => { try { x.cancel(); } catch (e) {} });
        else { try { a.cancel(); } catch (e) {} }
      }
      el.querySelectorAll('.rba-split-em').forEach((em) => em.classList.remove('is-underlined'));
    });
  }

  // --------------------------------------------------------------
  //  Chrome (progress bar + dot rail)
  // --------------------------------------------------------------
  let progressBar = null;
  let dots = [];

  function buildChrome(total) {
    const wrap = document.createElement('div');
    wrap.className = 'deck-progress';
    const bar = document.createElement('div');
    bar.className = 'deck-progress__bar';
    wrap.appendChild(bar);
    document.body.appendChild(wrap);
    progressBar = bar;

    const rail = document.createElement('div');
    rail.className = 'deck-slide-dot-rail';
    rail.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'deck-slide-dot';
      rail.appendChild(d);
    }
    document.body.appendChild(rail);
    dots = Array.from(rail.children);
  }

  function updateChrome(index, total) {
    if (!progressBar) buildChrome(total);
    progressBar.style.width = ((index + 1) / total) * 100 + '%';
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  }

  // --------------------------------------------------------------
  //  Parallax de mouse sobre arcos decorativos
  // --------------------------------------------------------------
  function setupParallax() {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 28;
      ty = (e.clientY / window.innerHeight - 0.5) * 18;
    }, { passive: true });

    const deck = document.querySelector('deck-stage');
    (function tick() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      if (deck) {
        const active = deck.querySelector('.slide[data-deck-active]');
        if (active) {
          active.querySelectorAll('.arc-right, .arc-left, .cover-arcs').forEach((arc) => {
            arc.style.translate = cx.toFixed(2) + 'px ' + cy.toFixed(2) + 'px';
          });
        }
      }
      requestAnimationFrame(tick);
    })();
  }

  // --------------------------------------------------------------
  //  Prepara TODOS os slides antes do deck-stage montá-los, para
  //  garantir que os elementos animáveis já estão com opacity:0
  //  via .rba-anim quando o slide ativar pela primeira vez.
  // --------------------------------------------------------------
  function preprocessAllSlides() {
    const deck = document.querySelector('deck-stage');
    if (!deck) return;
    deck.querySelectorAll(':scope > section').forEach((s) => prepareSlide(s));
  }

  // --------------------------------------------------------------
  //  Init
  // --------------------------------------------------------------
  function init() {
    const deck = document.querySelector('deck-stage');
    if (!deck) return;

    preprocessAllSlides();

    deck.addEventListener('slidechange', (e) => {
      const { index, total, slide, previousSlide } = e.detail;
      if (previousSlide && previousSlide !== slide) exitSlide(previousSlide);
      if (slide) enterSlide(slide);
      updateChrome(index, total);
    });

    // Safeguard: se o primeiro slidechange já disparou antes do
    // listener ser registrado, dispara manualmente no slide ativo.
    const activeNow = deck.querySelector(':scope > section[data-deck-active]');
    if (activeNow) {
      const total = deck.querySelectorAll(':scope > section').length;
      const index = parseInt(activeNow.getAttribute('data-deck-slide') || '0', 10);
      enterSlide(activeNow);
      updateChrome(index, total);
    }

    setupParallax();
  }

  // Rodar o mais cedo possível — antes do DOMContentLoaded se o
  // script estiver antes do </body>, ou ao evento se não for.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
