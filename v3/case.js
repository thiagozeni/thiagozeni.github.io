/* thiagozeni.com · v3 "O fio" · páginas de case */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var CALM = root.classList.contains('calm');
  var hasGsap = !!window.gsap;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* ───────── Scroll suave ───────── */
  var lenis = null;
  if (!CALM && window.Lenis && hasGsap) {
    try {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
      window.__lenis = lenis;
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } catch (e) { lenis = null; }
  }

  /* ───────── Entrada do hero ───────── */
  var hero = $('.case-hero');
  function showHero() {
    if (!hero || hero.classList.contains('is-ready')) return;
    hero.classList.add('is-ready');
    var title = $('.h-title', hero);
    if (CALM || !hasGsap || !window.SplitText || !title) return;
    try {
      var split = new SplitText(title, { type: 'lines', linesClass: 'line' });
      split.lines.forEach(function (l) {
        var inner = d.createElement('span');
        inner.style.display = 'block';
        while (l.firstChild) inner.appendChild(l.firstChild);
        l.appendChild(inner);
      });
      gsap.from(split.lines.map(function (l) { return l.firstChild; }), { yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: 0.09, delay: 0.1 });
    } catch (e) { }
  }
  var fontsReady = (d.fonts && d.fonts.ready) ? d.fonts.ready : Promise.resolve();
  fontsReady.then(function () { requestAnimationFrame(showHero); });
  setTimeout(showHero, 2200);

  /* ───────── Still-life do hero em loop ───────── */
  (function () {
    var fig = $('.hero-fig[data-video]');
    if (!fig || CALM) return;
    var conn = navigator.connection;
    if (conn && conn.saveData) return;
    var v = d.createElement('video');
    v.className = 'live'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.src = fig.getAttribute('data-video');
    v.addEventListener('playing', function () { v.classList.add('is-on'); }, { once: true });
    fig.appendChild(v);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () { }); } else v.pause(); });
      }, { threshold: 0.05 }).observe(fig);
    } else { var p = v.play(); if (p && p.catch) p.catch(function () { }); }
  })();

  /* ───────── Revelação no scroll ───────── */
  var CARDS = '.stat-item, .frente-card, .module-card, .pillar-card, .persona-card, .feature-card, .role-card, .timeline-card, .channel-card, .platform-item, .deliverable-item, .award-item, .media-row, .shot';
  var items = $$('.reveal');
  $$(CARDS).forEach(function (el) {
    var sibs = Array.prototype.slice.call(el.parentNode.children);
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(sibs.indexOf(el), 8) * 0.07 + 's';
    items.push(el);
  });
  function settle(el) { el.addEventListener('transitionend', function () { el.style.transitionDelay = ''; }, { once: true }); }
  if (CALM || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible'); settle(e.target); io.unobserve(e.target);
        if (e.target.classList.contains('stat-item')) count($('.stat-value', e.target));
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ───────── Números que contam ───────── */
  function count(el) {
    if (!el || CALM || !hasGsap) return;
    var m = /^([^\d]*)(\d+)([^\d.,]*)$/.exec(el.textContent.trim());
    if (!m) return;
    var end = parseInt(m[2], 10);
    if (end < 2 || (end > 1900 && end < 2100 && !m[1] && !m[3])) return;
    var o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.5, ease: 'power3.out', onUpdate: function () { el.textContent = m[1] + Math.round(o.v) + m[3]; } });
  }

  /* ───────── Nav e fio de progresso ───────── */
  var nav = $('.nav'), bar = $('.progress i'), lastY = 0, ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0, max = d.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleY(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (nav) {
      nav.classList.toggle('is-solid', y > 40);
      if (y > lastY + 6 && y > 300) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 300) nav.classList.remove('is-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ───────── Parallax leve nas imagens ───────── */
  if (!CALM && hasGsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);
    var fig = $('.hero-fig');
    if (fig && window.matchMedia('(min-width: 1001px)').matches) {
      gsap.to(fig, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
