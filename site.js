// ================= SITE-WIDE SETTINGS =================
const SITE = {
  whatsapp: "212707711512",
  email: "greeksiptv@gmail.com",
  // Google Analytics 4 measurement ID, e.g. "G-ABC123XYZ".
  // Leave empty to disable analytics (then no cookie banner is needed or shown).
  gaId: "",
};

(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const lang = () => (store.get("lang") || document.documentElement.lang || "el").startsWith("en") ? "en" : "el";
  const TXT = {
    el: { msg: "Χρησιμοποιούμε cookies ανάλυσης (Google Analytics) μόνο με τη συγκατάθεσή σας, για να βελτιώνουμε τον ιστότοπο.", more: "Πολιτική απορρήτου", ok: "Αποδοχή", no: "Απόρριψη" },
    en: { msg: "We use analytics cookies (Google Analytics) only with your consent, to improve the website.", more: "Privacy policy", ok: "Accept", no: "Decline" },
  };

  // ---------- Analytics (loads only after consent) ----------
  function loadGA() {
    if (!SITE.gaId || window.gtag) return;
    const s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + SITE.gaId;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", SITE.gaId, { anonymize_ip: true });
  }
  function track(name, params) { if (window.gtag) window.gtag("event", name, params || {}); }

  // ---------- Cookie banner ----------
  function showBanner() {
    if (!SITE.gaId || document.getElementById("cookieBar")) return;
    const t = TXT[lang()];
    const bar = document.createElement("div");
    bar.id = "cookieBar"; bar.className = "cookie-bar"; bar.setAttribute("role", "dialog");
    bar.innerHTML = `<p>${t.msg} <a href="privacy.html#cookies">${t.more}</a></p>
      <div><button type="button" class="btn-no">${t.no}</button><button type="button" class="btn btn-cut btn-ok">${t.ok}</button></div>`;
    document.body.appendChild(bar);
    bar.querySelector(".btn-ok").onclick = () => { store.set("consent", "yes"); bar.remove(); loadGA(); };
    bar.querySelector(".btn-no").onclick = () => { store.set("consent", "no"); bar.remove(); };
  }
  const consent = store.get("consent");
  if (consent === "yes") loadGA(); else if (!consent) document.addEventListener("DOMContentLoaded", showBanner);
  window.openCookieSettings = () => { store.set("consent", ""); showBanner(); };

  // ---------- Click tracking ----------
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a"); if (!a) return;
    if (a.dataset.plan) track("select_plan", { plan: a.dataset.plan });
    else if (a.classList.contains("js-trial")) track("trial_click", { method: "whatsapp" });
    else if (a.href.includes("whatsapp.com")) track("contact_whatsapp");
    else if (a.href.startsWith("mailto:")) track("contact_email", { trial: a.classList.contains("js-trial-mail") });
  });

  // ---------- Shared page behaviour (sub-pages) ----------
  document.addEventListener("DOMContentLoaded", () => {
    const wa = (m) => `https://api.whatsapp.com/send/?phone=${SITE.whatsapp}&text=${encodeURIComponent(m)}`;
    document.querySelectorAll("[data-wa]").forEach(a => { a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; });
    document.querySelectorAll(".js-cookie-settings").forEach(a => a.addEventListener("click", (e) => { e.preventDefault(); window.openCookieSettings(); }));
    const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
    if (document.body.dataset.page === "home") return;          // home page menu is handled by script.js
    const menu = document.getElementById("menuBtn"), links = document.getElementById("navLinks");
    if (menu && links) menu.addEventListener("click", () => links.classList.toggle("open"));
  });
})();
