// ANIMATIONS — scroll reveal, counters, auto-sliders, mouse effects.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;

  // ---------- Scroll progress + header ----------
  const bar = document.createElement("div"); bar.className = "scroll-bar"; document.body.appendChild(bar);
  const nav = document.querySelector(".nav");
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty("--p", max > 0 ? scrollY / max : 0);
    if (nav) nav.classList.toggle("scrolled", scrollY > 30);
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (reduce) return;
  root.classList.add("js-anim");

  // ---------- Scroll reveal ----------
  const groups = [
    [".title, .section-title, .pricing-sub, .plan-note, .pay, .table-wrap, .what-facts, .what-text p", ""],
    [".stat", "zoom", 0.1],
    [".plans .plan, .plans-3 .plan", "", 0.08],
    [".dev-toggle", "zoom"],
    [".cat-card", "zoom", 0.1],
    [".cards .box", "", 0.08],
    [".badge-dev", "zoom", 0.05],
    [".faq-item", "left", 0.05],
    [".review", "", 0.1],
    [".contact-box, .contact-card, .contact-form, .world, .poster-slider, .guide-nav, .guide details, .prose > *, .cta-band, .f-brand, .f-col, .footer-bottom", ""],
  ];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { const el = e.target; el.classList.add("in"); io.unobserve(el);
        const delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
        setTimeout(() => el.classList.remove("reveal", "in", "zoom", "left"), 900 + delay * 1000); if (e.target.matches(".stat")) countUp(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  groups.forEach(([sel, kind, step]) => {
    const seen = new Map();
    document.querySelectorAll(sel).forEach((el) => {
      if (el.closest(".hero") && !el.matches(".stat")) return;
      el.classList.add("reveal"); if (kind) el.classList.add(kind);
      if (step) { const p = el.parentElement; const i = seen.get(p) || 0; seen.set(p, i + 1); el.style.setProperty("--d", Math.min(i * step, 0.6) + "s"); }
      io.observe(el);
    });
  });

  // ---------- Count-up numbers ----------
  function countUp(stat) {
    const b = stat.querySelector("b"); if (!b || b.dataset.done) return;
    const m = b.textContent.match(/^(\D*)(\d+)(.*)$/); if (!m || /[–-]/.test(m[3])) return;
    b.dataset.done = 1;
    const [, pre, num, post] = m, target = +num, t0 = performance.now(), dur = 1200;
    (function tick(t) {
      const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      b.textContent = pre + Math.round(target * e) + post;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // ---------- Auto-scrolling sliders (pause on hover/touch) ----------
  document.querySelectorAll(".poster-track, .reviews-track").forEach((track, i) => {
    let paused = false;
    const pause = () => (paused = true), play = () => (paused = false);
    track.addEventListener("mouseenter", pause); track.addEventListener("mouseleave", play);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("touchend", () => setTimeout(play, 4000));
    setInterval(() => {
      if (paused || document.hidden || track.scrollWidth <= track.clientWidth + 4) return;
      const card = track.children[0]; if (!card) return;
      const stepPx = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + stepPx, behavior: "smooth" });
    }, 3200 + i * 400);
  });

  if (!fine) return;

  // ---------- Card spotlight follows the mouse ----------
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".box, .plan, .contact-card"); if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px");
    card.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });

  // ---------- Hero photo tilts toward the mouse ----------
  const img = document.querySelector(".hero-visual img"), hero = document.querySelector(".hero");
  if (img && hero) {
    hero.addEventListener("pointermove", (e) => {
      const r = img.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / innerWidth, y = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      img.style.setProperty("--ry", (x * 14).toFixed(2) + "deg");
      img.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
    });
    hero.addEventListener("pointerleave", () => { img.style.setProperty("--ry", "0deg"); img.style.setProperty("--rx", "0deg"); });
  }
})();
