// 1-YEAR OFFER POPUP — shows once, after 12 s or half-page scroll; hidden for 3 days after closing.
(function () {
  const OFFER = { months: 12, price: 62, monthly: 15, img: "img/hero-tv.webp", delayMs: 12000, snoozeDays: 3 };
  const skip = ["refund", "terms", "privacy", "404"];
  if (skip.includes(document.body.dataset.page)) return;
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
                  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const until = +store.get("offerSnooze") || 0;
  if (Date.now() < until) return;

  const lang = (store.get("lang") || document.documentElement.lang || "el").startsWith("en") ? "en" : "el";
  const full = OFFER.monthly * OFFER.months, save = full - OFFER.price, pct = Math.round(save / full * 100);
  const perMonth = (OFFER.price / OFFER.months).toFixed(2).replace(".", lang === "el" ? "," : ".");
  const T = {
    el: { badge: "Προσφορά 1 έτους", title: "Greek IPTV για 12 μήνες", per: `μόνο ${perMonth}€ τον μήνα`,
          save: `Εξοικονομείτε ${save}€ (-${pct}%) σε σχέση με τη μηνιαία συνδρομή`,
          list: ["Όλα τα κανάλια, ταινίες & σειρές", "Ποιότητα έως 4K", "Υποστήριξη 24/7 μέσω WhatsApp", "Εγγύηση επιστροφής 7 ημερών"],
          cta: "Παραγγελία μέσω WhatsApp", more: "Δείτε όλα τα πακέτα", close: "Κλείσιμο" },
    en: { badge: "1-year offer", title: "Greek IPTV for 12 months", per: `only €${perMonth} per month`,
          save: `Save €${save} (-${pct}%) compared with paying monthly`,
          list: ["All channels, movies & series", "Up to 4K quality", "24/7 WhatsApp support", "7-day money-back guarantee"],
          cta: "Order on WhatsApp", more: "See all plans", close: "Close" },
  }[lang];
  const phone = (window.SITE && SITE.whatsapp) || "212707711512";
  const waMsg = `greeksiptv.gr - 1 Year / 1 Device - ${OFFER.price}€`;
  const plansHref = document.body.dataset.page === "home" ? "#pricing" : "index.html#pricing";
  let shown = false, lastFocus = null;

  function show() {
    if (shown || document.getElementById("cookieBar")) { if (!shown) setTimeout(show, 4000); return; }
    shown = true; lastFocus = document.activeElement;
    const wrap = document.createElement("div");
    wrap.className = "offer-overlay"; wrap.id = "offerPopup";
    wrap.innerHTML = `
      <div class="offer-box" role="dialog" aria-modal="true" aria-labelledby="offerTitle">
        <button type="button" class="offer-close" aria-label="${T.close}"><i class="fa-solid fa-xmark"></i></button>
        <div class="offer-media"><img src="${OFFER.img}" alt="" width="1400" height="764"><span class="offer-badge">${T.badge}</span>
          <span class="offer-pct">-${pct}%</span></div>
        <div class="offer-body">
          <h2 id="offerTitle">${T.title}</h2>
          <div class="offer-price"><s>€${full}</s> <b>€${OFFER.price}</b></div>
          <p class="offer-per">${T.per}</p>
          <p class="offer-save"><i class="fa-solid fa-piggy-bank"></i> ${T.save}</p>
          <ul>${T.list.map(x => `<li><i class="fa-solid fa-check"></i>${x}</li>`).join("")}</ul>
          <a class="btn btn-round offer-cta" data-plan="offer-1y-1" target="_blank" rel="noopener"
             href="https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(waMsg)}"><i class="fa-brands fa-whatsapp"></i>${T.cta}</a>
          <a class="offer-more" href="${plansHref}">${T.more}</a>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("open"));
    const close = () => {
      store.set("offerSnooze", Date.now() + OFFER.snoozeDays * 864e5);
      wrap.classList.remove("open"); wrap.classList.add("closing");
      setTimeout(() => wrap.remove(), 350);
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {                      // keep focus inside the popup
        const f = wrap.querySelectorAll("a,button"); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
    wrap.querySelector(".offer-close").addEventListener("click", close);
    wrap.querySelector(".offer-more").addEventListener("click", close);
    wrap.querySelector(".offer-cta").addEventListener("click", () => store.set("offerSnooze", Date.now() + 30 * 864e5));
    document.addEventListener("keydown", onKey);
    wrap.querySelector(".offer-close").focus({ preventScroll: true });
    if (window.gtag) gtag("event", "offer_popup_view", { offer: "1-year" });
  }

  const timer = setTimeout(show, OFFER.delayMs);
  addEventListener("scroll", function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max > 0 && scrollY / max > 0.5) { removeEventListener("scroll", onScroll); clearTimeout(timer); show(); }
  }, { passive: true });
  window.showOffer = show; // for testing: showOffer()
})();
