/* ─────────────────────────────────────────────────────────────
   thiagozeni.com · v3 "O fio"
   Sem build: GSAP + ScrollTrigger + SplitText + Lenis (vendor/).
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var root = document.documentElement;
  var CALM = root.classList.contains('calm');
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var hasGsap = typeof window.gsap !== 'undefined';

  if (!hasGsap) { root.classList.add('calm'); CALM = true; }
  if (hasGsap) gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ───────── Scroll suave ───────── */
  var lenis = null;
  if (!CALM && typeof window.Lenis !== 'undefined') {
    try {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } catch (e) { lenis = null; }
  }
  function scrollToTarget(target) {
    var y = 0;
    if (target && target !== '#top') {
      var el = typeof target === 'string' ? $(target) : target;
      if (!el) return;
      y = el.getBoundingClientRect().top + window.scrollY;
    }
    if (lenis) lenis.scrollTo(y, { duration: 1.5, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else window.scrollTo({ top: y, behavior: CALM ? 'auto' : 'smooth' });
  }

  /* ───────── Retrato em partículas (WebGL) ───────── */
  var portrait = (function () {
    var canvas = $('#gl');
    if (CALM || !canvas) return null;
    var gl = null;
    try { gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' }); } catch (e) { }
    if (!gl) { root.classList.add('no-gl'); return null; }

    var VS = [
      'attribute vec2 aPos; attribute vec4 aData;',
      'uniform vec2 uRes, uCenter, uMouse, uTilt;',
      'uniform float uScale, uTime, uIntro, uLine, uStep, uDpr, uLineY, uRadius;',
      'varying float vA; varying float vLime;',
      'void main(){',
      '  float lum = aData.x, dep = aData.y, r1 = aData.z, r2 = aData.w;',
      '  vec3 p = vec3(aPos.x, -aPos.y, 0.) * uScale;',
      '  p.z = (dep - .5) * uScale * .24;',
      '  float cy = cos(uTilt.x), sy = sin(uTilt.x);',
      '  p.xz = vec2(p.x * cy + p.z * sy, -p.x * sy + p.z * cy);',
      '  float cx = cos(uTilt.y), sx = sin(uTilt.y);',
      '  p.yz = vec2(p.y * cx - p.z * sx, p.y * sx + p.z * cx);',
      '  p.xy += vec2(sin(uTime * .9 + r1 * 50.), cos(uTime * .7 + r2 * 50.)) * uStep * .16;',
      '  float persp = 1. + p.z / (uScale * 2.2);',
      '  vec2 scr = uCenter + p.xy * persp;',
      '  float ti = clamp(uIntro * 1.7 - r2 * .7, 0., 1.); ti = 1. - pow(1. - ti, 3.);',
      '  vec2 sc = uCenter + vec2(r1 - .5, fract(r1 * 17.31 + r2 * 3.7) - .5) * uRes * vec2(1.9, 1.7);',
      '  scr = mix(sc, scr, ti);',
      '  vec2 d = scr - uMouse; float dist = length(d);',
      '  float f = smoothstep(uRadius, 0., dist);',
      '  scr += (d / (dist + .001)) * f * f * uRadius * .5 * (.35 + r1);',
      '  float tl = clamp(uLine * 1.6 - r1 * .6, 0., 1.); tl = tl * tl * (3. - 2. * tl);',
      '  float g = (r2 + fract(r2 * 7.13) + fract(r1 * 3.77) - 1.5) / 1.5;',
      '  vec2 ln = vec2(fract(r1 * 5.3 + r2 * 9.1) * uRes.x * 1.1 - uRes.x * .05, uLineY + g * g * g * 16.);',
      '  vec2 mid = mix(scr, ln, tl);',
      '  float arc = sin(tl * 3.14159);',
      '  mid.y += arc * (r2 - .5) * uRes.y * .42;',
      '  mid.x += arc * (r1 - .5) * uRes.x * .14;',
      '  scr = mid;',
      '  gl_Position = vec4(scr.x / uRes.x * 2. - 1., 1. - scr.y / uRes.y * 2., 0., 1.);',
      '  float size = uStep * 1.12 * pow(lum, .95) * persp;',
      '  size = mix(size, 1.5 + r2 * 1.4, tl);',
      '  gl_PointSize = max(size * mix(.35, 1., ti), .0) * uDpr;',
      '  float spark = step(.972, fract(r1 * 91.7 + r2 * 13.3));',
      '  vLime = max(tl, spark);',
      '  vA = mix(.25 + .75 * ti, .5, spark * (1. - tl)) * mix(.82, .2 + .5 * (1. - abs(g)), tl);',
      '}'
    ].join('\n');
    var FS = [
      'precision mediump float; varying float vA; varying float vLime;',
      'void main(){',
      '  float d = length(gl_PointCoord - .5);',
      '  float a = smoothstep(.5, .3, d) * vA;',
      '  vec3 c = mix(vec3(.93, .95, .9), vec3(.776, 1., 0.), vLime);',
      '  gl_FragColor = vec4(c * a, a);',
      '}'
    ].join('\n');

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) { root.classList.add('no-gl'); return null; }
    gl.useProgram(prog);
    var U = {};
    ['uRes', 'uCenter', 'uMouse', 'uTilt', 'uScale', 'uTime', 'uIntro', 'uLine', 'uStep', 'uDpr', 'uLineY', 'uRadius'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    var state = { intro: 0, line: 0, mx: -9999, my: -9999, tx: 0, ty: 0, ttx: 0, tty: 0, active: true, ready: false };
    var count = 0, rows = 0, W = 0, H = 0, dpr = 1, scale = 1, cxp = 0, cyp = 0, t0 = performance.now();
    var small = function () { return window.innerWidth <= 700; };

    function build(img) {
      var aspect = img.naturalWidth / img.naturalHeight;
      rows = small() ? 170 : (window.innerWidth > 1700 ? 300 : 260);
      var cols = Math.round(rows * aspect);
      var c = document.createElement('canvas'); c.width = cols; c.height = rows;
      var x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0, cols, rows);
      var px = x.getImageData(0, 0, cols, rows).data;
      // profundidade aproximada: luminância borrada
      var bw = Math.max(8, Math.round(cols / 10)), bh = Math.max(8, Math.round(rows / 10));
      var b = document.createElement('canvas'); b.width = bw; b.height = bh;
      var bx = b.getContext('2d'); bx.drawImage(img, 0, 0, bw, bh);
      var c2 = document.createElement('canvas'); c2.width = cols; c2.height = rows;
      var x2 = c2.getContext('2d', { willReadFrequently: true });
      x2.imageSmoothingEnabled = true; x2.imageSmoothingQuality = 'high';
      x2.drawImage(b, 0, 0, cols, rows);
      var bp = x2.getImageData(0, 0, cols, rows).data;

      var pos = [], data = [];
      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          var k = (j * cols + i) * 4;
          if (px[k + 3] < 110) continue;
          var lum = (0.299 * px[k] + 0.587 * px[k + 1] + 0.114 * px[k + 2]) / 255;
          lum = Math.min(1, Math.pow(lum, 0.9) * 1.25);
          if (lum < 0.035) lum = 0.035 + Math.random() * 0.03;
          lum *= Math.min(1, Math.max(0, (rows - j) / (rows * 0.1)));
          var off = (j % 2) * 0.5;
          var u = (i + off) / cols - 0.5, v = 0.5 - j / rows;
          var blur = (0.299 * bp[k] + 0.587 * bp[k + 1] + 0.114 * bp[k + 2]) / 255;
          var rad = 1 - Math.min(1, Math.hypot(u * aspect, v - 0.06) / 0.62);
          var dep = Math.min(1, blur * 0.55 + rad * 0.6);
          pos.push(u * aspect, v);
          data.push(lum, dep, Math.random(), Math.random());
        }
      }
      count = pos.length / 2;
      var pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
      var la = gl.getAttribLocation(prog, 'aPos'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
      var db = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, db); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      var ld = gl.getAttribLocation(prog, 'aData'); gl.enableVertexAttribArray(ld); gl.vertexAttribPointer(ld, 4, gl.FLOAT, false, 0, 0);
      state.aspect = aspect;
      state.ready = true;
      resize();
    }

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 2 : 1.75);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      var a = state.aspect || 1.22;
      if (small()) { scale = (W * 1.24) / a; cxp = W * 0.5; cyp = H * 0.075 + scale * 0.5; }
      else { scale = Math.min(H * 1.04, (W * 0.72) / a); cxp = W * 0.715; cyp = H - scale * 0.5; }
    }

    function frame() {
      if (!state.ready || !state.active) return;
      var t = (performance.now() - t0) / 1000;
      state.tx += (state.ttx - state.tx) * 0.06; state.ty += (state.tty - state.ty) * 0.06;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.uniform2f(U.uRes, W, H);
      gl.uniform2f(U.uCenter, cxp, cyp);
      gl.uniform2f(U.uMouse, state.mx, state.my);
      gl.uniform2f(U.uTilt, state.tx + Math.sin(t * 0.45) * 0.05, state.ty + Math.cos(t * 0.38) * 0.025);
      gl.uniform1f(U.uScale, scale);
      gl.uniform1f(U.uTime, t);
      gl.uniform1f(U.uIntro, state.intro);
      gl.uniform1f(U.uLine, state.line);
      gl.uniform1f(U.uStep, scale / rows);
      gl.uniform1f(U.uDpr, dpr);
      gl.uniform1f(U.uLineY, H * (small() ? 0.74 : 0.76));
      gl.uniform1f(U.uRadius, small() ? 0 : 150);
      gl.drawArrays(gl.POINTS, 0, count);
    }

    var img = new Image();
    img.onload = function () { try { build(img); } catch (e) { root.classList.add('no-gl'); } if (api.onready) api.onready(); };
    img.onerror = function () { root.classList.add('no-gl'); if (api.onready) api.onready(); };
    img.src = '/img/v3/retrato.webp';

    if (FINE) {
      window.addEventListener('mousemove', function (e) {
        var r = canvas.getBoundingClientRect();
        state.mx = e.clientX - r.left; state.my = e.clientY - r.top;
        state.ttx = (e.clientX / window.innerWidth - 0.5) * 0.5;
        state.tty = (e.clientY / window.innerHeight - 0.5) * -0.3;
      }, { passive: true });
    }
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (state.ready) resize(); }, 120); });
    gsap.ticker.add(frame);

    var api = { state: state, onready: null };
    return api;
  })();

  /* ───────── Abertura ───────── */
  var heroUI = $('#hero-ui');
  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  function heroIntro() {
    if (CALM) return;
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-word', { yPercent: 112, duration: 1.5, stagger: 0.12 }, 0.1)
      .from('.hero-kicker span', { opacity: 0, y: 14, duration: 1, stagger: 0.07 }, 0.5)
      .from('.hero-foot', { opacity: 0, y: 20, duration: 1.2 }, 0.75)
      .add(function () { $$('.hero-line').forEach(function (l) { l.classList.add('is-done'); }); }, 1.9)
      .fromTo('.nav', { opacity: 0 }, { opacity: 1, duration: 1.2, clearProps: 'opacity' }, 0.6);
    if (portrait) tl.to(portrait.state, { intro: 1, duration: 3, ease: 'power2.out' }, 0);
  }

  /* Chegada com âncora (ex.: voltando de um case): vai direto à seção depois que os pins foram medidos */
  function goHash() {
    var t = null;
    try { t = location.hash.length > 1 && document.querySelector(location.hash); } catch (e) { }
    if (!t || t.id === 'hero') return;
    if (lenis) lenis.scrollTo(t, { immediate: true, force: true });
    else t.scrollIntoView();
  }

  (function loader() {
    var el = $('#loader');
    if (CALM || !el) { if (el) el.remove(); window.addEventListener('load', function () { setTimeout(goHash, 60); }); return; }
    var yearEl = $('#loader-year'), bar = $('#loader-bar');
    var seen = false; try { seen = sessionStorage.getItem('zn-seen') === '1'; sessionStorage.setItem('zn-seen', '1'); } catch (e) { }
    if (lenis) lenis.stop();
    window.scrollTo(0, 0);
    var o = { y: 1998 }, done = false, ready = false, counted = false;
    function finish() {
      if (done || !ready || !counted) return; done = true;
      gsap.timeline()
        .to(el, { yPercent: -100, duration: 1, ease: 'power4.inOut' })
        .add(heroIntro, 0.25)
        .add(function () { el.remove(); if (lenis) lenis.start(); ScrollTrigger.refresh(); goHash(); }, 1.05);
    }
    var t1 = gsap.to(o, { y: 2026, duration: seen ? 0.7 : 1.7, ease: 'power2.inOut', onUpdate: function () { yearEl.textContent = Math.round(o.y); }, onComplete: function () { counted = true; finish(); } });
    var t2 = gsap.to(bar, { scaleX: 1, duration: seen ? 0.7 : 1.7, ease: 'power2.inOut' });
    el.addEventListener('pointerdown', function () { t1.timeScale(8); t2.timeScale(8); }, { once: true });
    var imgReady = new Promise(function (res) { if (!portrait || portrait.state.ready) return res(); portrait.onready = res; });
    Promise.all([fontsReady, imgReady]).then(function () { ready = true; finish(); });
    setTimeout(function () { ready = true; finish(); }, 3500);
  })();

  /* ───────── Hero pinado: retrato vira fio, fio vira manifesto ───────── */
  function motion() {
  if (!CALM) {
    var mText = $('#manifesto-text');
    var mSplit = SplitText.create(mText, { type: 'words', wordsClass: 'm-word' });
    gsap.set(mSplit.words, { opacity: 0.1 });
    var htl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero', start: 'top top', end: '+=205%', pin: true, scrub: 0.9, anticipatePin: 1,
        onToggle: function (self) { if (portrait) portrait.state.active = self.isActive || self.progress < 1; }
      }
    });
    htl.to('#hw1', { xPercent: -18, ease: 'power1.in', duration: 0.3 }, 0)
      .to('#hw2', { xPercent: 14, ease: 'power1.in', duration: 0.3 }, 0)
      .to(heroUI, { opacity: 0, ease: 'power1.in', duration: 0.24 }, 0.04);
    if (portrait) htl.to(portrait.state, { line: 1, ease: 'none', duration: 0.52 }, 0.02);
    htl.set('#manifesto', { visibility: 'visible' }, 0.3)
      .from('.manifesto-kicker', { opacity: 0, y: 16, duration: 0.08 }, 0.32)
      .to(mSplit.words, { opacity: 1, stagger: 0.035, duration: 0.06, ease: 'none' }, 0.36)
      .to({}, { duration: 0.12 });
  }

  /* ───────── Revelações ───────── */
  $$('#layers li').forEach(function (li) { li.setAttribute('data-reveal', 'row'); });
  var revealEls = $$('[data-reveal]');
  if (CALM || !('IntersectionObserver' in window)) revealEls.forEach(function (e) { e.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealEls.forEach(function (e) { io.observe(e); });
  }

  if (!CALM) {
    $$('[data-split]').forEach(function (el) {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'split-l', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 112, duration: 1.25, ease: 'power4.out', stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true }
          });
        }
      });
    });

    // ondas: acendem em sequência conforme a leitura
    var waves = $$('#waves li');
    ScrollTrigger.create({
      trigger: '#waves', start: 'top 86%', end: 'bottom 48%', scrub: true,
      onUpdate: function (self) {
        var n = Math.round(self.progress * waves.length);
        waves.forEach(function (w, i) { w.classList.toggle('is-on', i < n); });
      }
    });

    // números
    $$('#figures b[data-count]').forEach(function (b) {
      var end = +b.getAttribute('data-count'), suf = b.getAttribute('data-suffix') || '', o = { v: 0 };
      ScrollTrigger.create({
        trigger: b, start: 'top 92%', once: true,
        onEnter: function () { gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: function () { b.textContent = Math.round(o.v) + suf; } }); }
      });
    });

    gsap.from('.contact-title > span', { xPercent: function (i) { return i ? 14 : -10; }, opacity: 0, duration: 1.4, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: '.contact-title', start: 'top 88%', once: true } });

    // foto do Sobre: leve paralaxe interna
    gsap.to('.about-photo img', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.about-grid', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ───────── Linha da inovação: trilha horizontal ───────── */
  if (!CALM) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1001px)', function () {
      var track = $('#linha-track'), thread = $('#linha-thread');
      var dist = function () { return track.scrollWidth - window.innerWidth; };
      var setThread = gsap.quickSetter(thread, 'scaleX');
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: '#linha', start: 'top top', end: function () { return '+=' + dist(); },
          pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { setThread((self.progress * dist() + window.innerWidth * 0.62) / track.scrollWidth); }
        }
      });
      setThread(window.innerWidth * 0.2 / track.scrollWidth);
      $$('.stop').forEach(function (stop) {
        var st = { trigger: stop, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true };
        gsap.fromTo($('.stop-year', stop), { xPercent: 22 }, { xPercent: -22, ease: 'none', scrollTrigger: st });
        gsap.fromTo($('.stop-img img', stop), { xPercent: -7, scale: 1.14 }, { xPercent: 7, scale: 1.14, ease: 'none', scrollTrigger: st });
        gsap.from($$('.stop-bottom > *', stop), { opacity: 0, y: 26, duration: 0.9, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: stop, containerAnimation: tween, start: 'left 72%', toggleActions: 'play none none reverse' } });
      });
    });
    mm.add('(max-width: 1000px)', function () {
      $$('.stop').forEach(function (stop) {
        gsap.fromTo($('.stop-img img', stop), { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: stop, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from($$('.stop-copy > * > *', stop), { opacity: 0, y: 22, duration: 0.9, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: $('.stop-copy', stop), start: 'top 86%', once: true } });
      });
    });
  }

  if (hasGsap) ScrollTrigger.refresh();
  }
  var started = false;
  function startMotion() { if (started) return; started = true; motion(); }
  fontsReady.then(startMotion); setTimeout(startMotion, 2500);

  /* ───────── Cases: acordeão ───────── */
  (function cases() {
    var items = $$('.case');
    if (!items.length) return;
    var rt;
    function toggle(item, open) {
      item.classList.toggle('is-open', open);
      $('.case-head', item).setAttribute('aria-expanded', open ? 'true' : 'false');
      var h = $('.case-head', item); if (h.hasAttribute('data-cursor')) h.setAttribute('data-cursor', open ? 'fechar' : 'abrir');
    }
    items.forEach(function (item) {
      var head = $('.case-head', item);
      head.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        items.forEach(function (o) { if (o !== item) toggle(o, false); });
        toggle(item, willOpen);
        clearTimeout(rt); rt = setTimeout(function () { if (hasGsap) ScrollTrigger.refresh(); }, 950);
      });
    });
    toggle(items[0], true);

    /* Prévia que acompanha o cursor nos cases fechados */
    if (hasGsap && !CALM && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var peek = document.createElement('div'), pimg = document.createElement('img');
      peek.className = 'case-peek'; peek.setAttribute('aria-hidden', 'true'); pimg.alt = ''; peek.appendChild(pimg);
      document.body.appendChild(peek);
      var px = gsap.quickTo(peek, 'x', { duration: 0.55, ease: 'power3.out' }), py = gsap.quickTo(peek, 'y', { duration: 0.55, ease: 'power3.out' });
      var pr = gsap.quickTo(peek, 'rotation', { duration: 0.7, ease: 'power3.out' }), lastX = 0;
      var hide = function () { peek.classList.remove('is-on'); };
      items.forEach(function (item) {
        var head = $('.case-head', item), src = $('.case-media img', item);
        if (!src) return;
        head.addEventListener('mouseenter', function (e) {
          if (item.classList.contains('is-open')) return;
          pimg.src = src.getAttribute('src'); lastX = e.clientX;
          gsap.set(peek, { x: e.clientX + 28, y: e.clientY - peek.offsetHeight * 0.5 });
          peek.classList.add('is-on');
        });
        head.addEventListener('mousemove', function (e) {
          var w = peek.offsetWidth, x = e.clientX + 28;
          if (x + w > window.innerWidth - 24) x = e.clientX - w - 28;
          px(x); py(Math.max(16, Math.min(window.innerHeight - peek.offsetHeight - 16, e.clientY - peek.offsetHeight * 0.5)));
          pr(Math.max(-7, Math.min(7, (e.clientX - lastX) * 0.5))); lastX = e.clientX;
        });
        head.addEventListener('mouseleave', function () { hide(); pr(0); });
        head.addEventListener('click', hide);
      });
      window.addEventListener('scroll', hide, { passive: true });
    }

    /* A cena do case viaja da home para a página do case (View Transitions) */
    $$('a[href^="cases/"]').forEach(function (a) {
      a.addEventListener('click', function () {
        var box = a.closest('.stop, .case'), fig = box && $('.stop-img, .case-media', box);
        if (fig && fig.hasAttribute('data-video')) fig.style.viewTransitionName = 'case-fig';
      });
    });
    window.addEventListener('pageshow', function () { $$('.stop-img, .case-media').forEach(function (f) { f.style.viewTransitionName = ''; }); });

    var hash = location.hash && $(location.hash);
    if (hash && hash.classList.contains('case')) { toggle(items[0], false); toggle(hash, true); }
  })();

  /* ───────── Marcas: letreiro que responde ao scroll ───────── */
  (function brands() {
    if (CALM) return;
    var rows = $$('.brands-row').map(function (row) {
      var set = $('.brands-set', row);
      var w = set.getBoundingClientRect().width || 1;
      var n = Math.ceil((window.innerWidth * 2) / w) + 1;
      for (var i = 0; i < n; i++) { var c = set.cloneNode(true); c.setAttribute('aria-hidden', 'true'); row.appendChild(c); }
      return { row: row, set: set, w: w, x: 0, dir: +row.getAttribute('data-dir') || -1 };
    });
    var visible = false, vel = 0;
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: '20% 0px' }).observe($('#brands'));
    function remeasure() { rows.forEach(function (r) { r.w = r.set.getBoundingClientRect().width || r.w; }); }
    window.addEventListener('resize', remeasure); fontsReady.then(remeasure); window.addEventListener('load', remeasure);
    gsap.ticker.add(function (t, dt) {
      if (!visible) return;
      var v = lenis ? lenis.velocity : 0;
      vel += (v - vel) * 0.1;
      rows.forEach(function (r, i) {
        r.x += r.dir * (0.045 * dt * (1 + i * 0.25)) + r.dir * vel * 0.55;
        if (r.x <= -r.w) r.x += r.w; if (r.x > 0) r.x -= r.w;
        r.row.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0) skewX(' + Math.max(-9, Math.min(9, vel * -0.22)).toFixed(2) + 'deg)';
      });
    });
  })();

  /* ───────── Laboratório: anel 3D ───────── */
  (function lab() {
    var stage = $('#ring-stage'), ring = $('#ring'), items = $$('#lab-items .lab-item');
    if (!stage || !items.length) return;
    var N = items.length, STEP = 360 / N, angle = 0, active = -1, cards = [];
    items.forEach(function (it, i) {
      var card = document.createElement('div');
      card.className = 'ring-card'; card.style.setProperty('--k', i);
      var im = $('img', it).cloneNode(true); im.removeAttribute('loading'); im.setAttribute('draggable', 'false'); im.alt = '';
      card.appendChild(im); ring.appendChild(card); cards.push(card);
      card.addEventListener('click', function () { if (!moved) go(i); });
    });
    var count = $('#lab-count');
    function mod(a, n) { return ((a % n) + n) % n; }
    function render() {
      ring.style.transform = 'translateZ(calc(var(--ring-r) * -1)) rotateX(-7deg) rotateY(' + angle.toFixed(3) + 'deg)';
      var idx = mod(Math.round(-angle / STEP), N);
      if (idx !== active) {
        active = idx;
        cards.forEach(function (c, i) {
          var dd = Math.min(mod(i - idx, N), mod(idx - i, N));
          c.classList.toggle('is-active', dd === 0); c.classList.toggle('is-near', dd === 1);
        });
        items.forEach(function (it, i) { it.classList.toggle('is-active', i === idx); });
        count.textContent = ('0' + (idx + 1)).slice(-2) + ' / ' + ('0' + N).slice(-2);
      }
    }
    var tw;
    function to(a, dur) {
      if (!hasGsap || CALM) { angle = a; render(); return; }
      if (tw) tw.kill();
      var o = { a: angle };
      tw = gsap.to(o, { a: a, duration: dur || 1.1, ease: 'power3.out', onUpdate: function () { angle = o.a; render(); } });
    }
    function go(i) {
      var cur = -angle / STEP, base = Math.round(cur), diff = mod(i - mod(base, N), N);
      if (diff > N / 2) diff -= N;
      to(-(base + diff) * STEP);
    }
    $('#lab-prev').addEventListener('click', function () { to(-(Math.round(-angle / STEP) - 1) * STEP); });
    $('#lab-next').addEventListener('click', function () { to(-(Math.round(-angle / STEP) + 1) * STEP); });

    var down = false, moved = false, sx = 0, sy = 0, sa = 0, lastX = 0, lastT = 0, v = 0, locked = null;
    stage.addEventListener('pointerdown', function (e) {
      down = true; moved = false; locked = null; sx = lastX = e.clientX; sy = e.clientY; sa = angle; lastT = performance.now(); v = 0;
      if (tw) tw.kill();
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (locked === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (locked !== 'x') return;
      moved = true;
      var k = 62 / Math.max(260, stage.clientWidth * 0.36);
      angle = sa + dx * k * 0.62; render();
      var now = performance.now(); v = (e.clientX - lastX) / Math.max(1, now - lastT) * k * 0.62; lastX = e.clientX; lastT = now;
    }, { passive: true });
    function up() {
      if (!down) return; down = false;
      if (!moved) return;
      var proj = angle + v * 260;
      to(Math.round(proj / STEP) * STEP, 1.3);
      setTimeout(function () { moved = false; }, 50);
    }
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    stage.setAttribute('data-cursor', 'arraste');
    render();

    if (hasGsap && !CALM) {
      angle = 110; render();
      ScrollTrigger.create({ trigger: stage, start: 'top 82%', once: true, onEnter: function () { to(0, 2.4); } });
    }
  })();

  /* ───────── Still-lifes vivos: vídeo em loop sobre a imagem, só perto da tela ───────── */
  (function liveStills() {
    var figs = $$('[data-video]');
    if (!figs.length || CALM || !('IntersectionObserver' in window)) return;
    var conn = navigator.connection; if (conn && conn.saveData) return;
    var vo = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        var fig = en.target, v = fig._v;
        if (en.isIntersecting) {
          if (!v) {
            v = document.createElement('video');
            v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
            v.setAttribute('aria-hidden', 'true'); v.preload = 'auto'; v.className = 'live';
            v.addEventListener('playing', function () { v.classList.add('is-on'); }, { once: true });
            v.src = fig.getAttribute('data-video');
            fig.appendChild(v); fig._v = v;
          }
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () { });
        } else if (v) v.pause();
      });
    }, { rootMargin: '0px 60% 0px 60%', threshold: 0.01 });
    figs.forEach(function (f) { vo.observe(f); });
  })();

  /* ───────── Prêmios: vídeo só quando visível ───────── */
  (function awards() {
    var v = $('#awards-video'); if (!v || CALM || !('IntersectionObserver' in window)) return;
    var conn = navigator.connection; if (conn && conn.saveData) return;
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () { }); } else v.pause();
    }, { threshold: 0.05 }).observe(v);
  })();

  /* ───────── Navegação ───────── */
  (function nav() {
    var nav = $('#nav'), burger = $('#burger'), menu = $('#menu'), bar = $('#progress-bar'), thumb = $('#thumb-cta');
    var lastY = 0, prevY = 0, thumbUp = false, contactTop = Infinity;
    function measure() { var c = $('#contact'); if (c) contactTop = c.getBoundingClientRect().top + window.scrollY; }
    measure(); window.addEventListener('resize', measure); setInterval(measure, 2000);

    function onScroll() {
      var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
      nav.classList.toggle('is-solid', y > 30);
      var pastHero = y > window.innerHeight * 3;
      if (!menu.classList.contains('is-open')) nav.classList.toggle('is-hidden', pastHero && y > lastY + 2);
      if (y < lastY - 2) nav.classList.remove('is-hidden');
      lastY = y;
      if (bar) bar.style.transform = 'scaleY(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
      if (thumb) {
        if (y < prevY - 4) thumbUp = true; else if (y > prevY + 4) thumbUp = false;
        prevY = y;
        thumb.classList.toggle('show', thumbUp && y > window.innerHeight * 1.2 && y < contactTop - window.innerHeight * 0.55 && !menu.classList.contains('is-open'));
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    function setMenu(open) {
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      if (lenis) { if (open) lenis.stop(); else lenis.start(); }
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) nav.classList.remove('is-hidden');
      onScroll();
    }
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute('href'); if (id.length < 2) return;
      if (id !== '#top' && !$(id)) return;
      e.preventDefault();
      if (menu.classList.contains('is-open')) setMenu(false);
      scrollToTarget(id);
      try { history.replaceState(null, '', id === '#top' ? location.pathname : id); } catch (err) { }
    });

    if ('IntersectionObserver' in window) {
      var links = $$('.nav-links a'), map = {};
      links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });
      var so = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove('is-active'); });
          var l = map[en.target.id]; if (l) l.classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['hero', 'about', 'linha', 'oferta', 'cases', 'brands', 'lab', 'awards', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
    }
  })();

  /* ───────── Cursor e ímãs ───────── */
  (function cursor() {
    if (CALM || !FINE || !hasGsap) return;
    var c = $('#cursor'), dot = $('.cursor-dot', c), ring = $('.cursor-ring', c), label = $('#cursor-label');
    var dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
    var rx = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });
    gsap.set([dot, ring], { x: -100, y: -100 });
    window.addEventListener('mousemove', function (e) { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cursor], a, button') : null;
      var lab = t && t.getAttribute('data-cursor');
      c.classList.toggle('is-label', !!lab);
      c.classList.toggle('is-link', !!t && !lab);
      if (lab) label.textContent = lab;
    });
    document.addEventListener('mouseleave', function () { gsap.set([dot, ring], { x: -100, y: -100 }); });

    $$('[data-magnet]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }), qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.32); qy((e.clientY - (r.top + r.height / 2)) * 0.42);
      });
      el.addEventListener('mouseleave', function () { qx(0); qy(0); });
    });
  })();

  /* ───────── Formulário (Web3Forms) ─────────
     A access key vem de /config.js (window.WEB3FORMS_KEY). Edite lá, não aqui. */
  (function form() {
    var f = $('#contact-form'); if (!f) return;
    var KEY = window.WEB3FORMS_KEY || 'COLE_SUA_ACCESS_KEY_AQUI';
    var status = $('#form-status'), btn = $('button[type="submit"]', f), btnText = $('span', btn), original = btnText.textContent;
    function set(msg, kind) { status.textContent = msg; status.className = 'form-status mono' + (kind ? ' ' + kind : ''); }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = f.elements.name.value.trim(), email = f.elements.email.value.trim(), message = f.elements.message.value.trim();
      if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { set('Preencha nome, um e-mail válido e a mensagem.', 'err'); return; }
      if (f.elements.botcheck.checked) return;
      btn.disabled = true; btnText.textContent = 'Enviando…'; set('');
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ access_key: KEY, subject: 'Contato via site · ' + name, from_name: name, email: email, message: message })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (!d.success) throw new Error(d.message || 'Falha no envio');
        set('Mensagem enviada. Obrigado! Retorno em breve.', 'ok'); f.reset();
      }).catch(function () {
        set('Não consegui enviar agora. Tente de novo ou escreva direto para thiagoazeni@gmail.com.', 'err');
      }).then(function () { btn.disabled = false; btnText.textContent = original; });
    });
  })();

  if (hasGsap) window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
