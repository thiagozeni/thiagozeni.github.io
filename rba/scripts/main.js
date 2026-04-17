/* RBA+ 50 anos — motion & interactions
   "Criada para se recriar": zero dependências, respeita prefers-reduced-motion.
*/

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isMobile = window.matchMedia("(max-width: 720px)").matches;

/* ============================================================
   1) Intro splash — loader C: strokes progressivos
   Só inicia as animações depois das fontes carregarem (evita desenhar
   o stroke numa fonte fallback e ter "pulo" quando Fraunces chegar).
============================================================ */
const intro = document.querySelector("[data-intro]");
if (intro) {
  const dismissIntro = () => intro.classList.add("is-gone");
  if (prefersReduced) {
    intro.classList.add("is-ready");
    setTimeout(dismissIntro, 400);
  } else {
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    // Timeout de segurança: se as fontes travarem, libera em 1.2s para não deixar o
    // usuário olhando preto indefinidamente.
    const safety = new Promise((r) => setTimeout(r, 1200));
    Promise.race([fontsReady, safety]).then(() => {
      intro.classList.add("is-ready");
      // 3000ms cobre a última animação (tagline inkFill termina em ~2.97s)
      setTimeout(dismissIntro, 3000);
    });
  }
}

/* ============================================================
   2) Brush cursor — canvas com rastro pincelado
   Só ativo em hover/fine pointer, respeita reduced motion
============================================================ */
const canvas = document.querySelector("[data-brush-canvas]");
const cursorDot = document.querySelector("[data-cursor]");

if (canvas && canHover && !prefersReduced) {
  const ctx = canvas.getContext("2d", { alpha: true });
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(DPR, DPR);
  };
  resize();
  window.addEventListener("resize", resize);

  // Armazena pontos do rastro do pincel
  const trail = [];
  const MAX_TRAIL = 22;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let cx = mx, cy = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  document.body.classList.add("cursor-ready");

  const render = () => {
    // Easing suave do dot
    cx += (mx - cx) * 0.22;
    cy += (my - cy) * 0.22;

    if (cursorDot) {
      cursorDot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }

    // Adiciona ponto ao rastro se mexeu o suficiente
    const last = trail[trail.length - 1];
    if (!last || Math.hypot(last.x - cx, last.y - cy) > 2) {
      trail.push({ x: cx, y: cy, life: 1 });
      if (trail.length > MAX_TRAIL) trail.shift();
    }

    // Limpa com fade — dá o efeito de tinta desbotando
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha rastro como pincelada — círculos sobrepostos com opacidade decrescente
    for (let i = 0; i < trail.length - 1; i++) {
      const p = trail[i];
      const p2 = trail[i + 1];
      const lifeRatio = i / trail.length;
      const size = 3 + lifeRatio * 14;
      const alpha = lifeRatio * 0.55;

      // Pincelada: linha com gradiente
      const gradient = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
      gradient.addColorStop(0, `rgba(249, 99, 59, ${alpha * 0.8})`);
      gradient.addColorStop(1, `rgba(249, 99, 59, ${alpha})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      // Curva suave (quadrática) entre pontos — pincel tem inércia
      ctx.quadraticCurveTo(p.x, p.y, (p.x + p2.x) / 2, (p.y + p2.y) / 2);
      ctx.stroke();
    }

    // Decai vida dos pontos
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].life -= 0.03;
      if (trail[i].life <= 0) trail.splice(i, 1);
    }

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);

  // Hover em elementos interativos
  document.querySelectorAll("a, button, [data-magnetic], .case, .division, .now-card, .client").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorDot?.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursorDot?.classList.remove("is-hover"));
  });
}

/* ============================================================
   3) Hero title — letter split para animação char-by-char
============================================================ */
document.querySelectorAll(".hero-title em, .manifesto-stack em, .divisions-title em, .now-title em, .contact-title em, .timeline-title em, .hero-title strong, .timeline-head em").forEach((el) => {
  // skip if already split
  if (el.querySelector(".char")) return;
  const text = el.textContent;
  el.textContent = "";
  for (const ch of text) {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch === " " ? "\u00A0" : ch;
    span.style.display = "inline-block";
    el.appendChild(span);
  }
});

/* ============================================================
   4) Scroll reveal + title lines cascade
============================================================ */
const revealTargets = document.querySelectorAll("[data-reveal], .hero-title .line, .manifesto-stack .line, .contact-title .line");

if ("IntersectionObserver" in window && !prefersReduced) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

/* ============================================================
   5) Parallax scroll — arcos de fundo + hero zoom + arcos foreground
============================================================ */
if (!prefersReduced) {
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  const heroImg = document.querySelector("[data-parallax-zoom]");
  let ticking = false;

  const onScroll = () => {
    const scrollY = window.scrollY;

    // Arcos decorativos de fundo (dentro das seções)
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0;
      el.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });

    // Hero: zoom out leve + translate conforme desce.
    if (heroImg) {
      const ratio = Math.min(1, scrollY / window.innerHeight);
      const scale = 1.12 - ratio * 0.04;
      const translateY = 24 + scrollY * 0.18;
      heroImg.style.transform = `scale(${scale}) translate3d(0, ${translateY}px, 0)`;
    }
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();
}

/* ============================================================
   6) Magnetic buttons — CTAs que "chamam" o cursor
============================================================ */
if (!prefersReduced && canHover) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = 0.3;
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
}

/* ============================================================
   7) Case videos — source selection por viewport
============================================================ */
document.querySelectorAll(".case-video").forEach((v) => {
  const src = isMobile ? v.dataset.srcMobile : v.dataset.srcDesktop;
  if (src && !v.src) {
    v.src = src;
    v.load();
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }
});

/* ============================================================
   8) Live clock São Paulo
============================================================ */
const clockTime = document.querySelector("[data-clock-time]");
if (clockTime) {
  const tick = () => {
    const fmt = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    clockTime.textContent = fmt.format(new Date());
  };
  tick();
  setInterval(tick, 30_000);
}

/* ============================================================
   9) Current year
============================================================ */
const yearEl = document.querySelector("[data-year]");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   10) Header scrolled state
============================================================ */
const header = document.querySelector(".site-header");
if (header) {
  const onScrollHeader = () => {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });
}

/* ============================================================
   11) Form handling — stub (sem backend ainda)
============================================================ */
const form = document.querySelector("[data-form]");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector(".contact-submit span");
    const originalText = btn.textContent;
    btn.textContent = "Enviando...";
    // Simula envio (integrar Formspree/Resend quando for ao ar)
    setTimeout(() => {
      btn.textContent = "Recebido ✓";
      form.querySelector(".contact-submit").style.background = "var(--color-lilac)";
      form.querySelector(".contact-submit").style.color = "var(--color-navy)";
      setTimeout(() => {
        btn.textContent = originalText;
        form.querySelector(".contact-submit").style.background = "";
        form.querySelector(".contact-submit").style.color = "";
        form.reset();
      }, 2500);
    }, 900);
  });
}

/* ============================================================
   12b) Hero video — autoplay loop
============================================================ */
const heroVideo = document.querySelector("[data-hero-video]");
if (heroVideo) {
  if (isMobile) {
    heroVideo.src = "assets/video/hero-50anos-mobile.mp4";
  }
  const p = heroVideo.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
}

/* ============================================================
   12b) Awards video — autoplay loop (capa Archive)
============================================================ */
const awardsVideo = document.querySelector("[data-awards-video]");
if (awardsVideo) {
  if (isMobile) awardsVideo.src = "assets/video/archive-close-mobile.mp4";
  const ap = awardsVideo.play();
  if (ap && typeof ap.catch === "function") ap.catch(() => {});
}

/* ============================================================
   12) Smooth anchor scroll (com offset do header fixo)
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (href === "#" || href === "#top") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
    }
  });
});
