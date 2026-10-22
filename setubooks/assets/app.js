/* =====================================================================
 *  CONFIG: edit these values only. Everything else just works.
 * ===================================================================== */

// Where the signup form is sent. The backend is detected from the URL:
//   Web3Forms (default, recommended):  "https://api.web3forms.com/submit"
//   Formspree:                         "https://formspree.io/f/YOUR_FORM_ID"
//   Google Sheets via Apps Script:     "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
//   Netlify Forms (only if hosted on Netlify): "/"
const FORM_ENDPOINT = "https://api.web3forms.com/submit";

// Only needed for Web3Forms. Get it free at https://web3forms.com (enter your email).
// The key is safe to publish: it only lets people send submissions to your inbox.
const WEB3FORMS_ACCESS_KEY = "795d07c0-4661-4501-86a0-bdbae5521fcc";

// Product name placeholder. Change it here (and in index.html <title>/meta for SEO).
const BRAND = "SetuBooks";

// Optional privacy-friendly analytics (no cookies). Pick one: "none" | "goatcounter" | "cloudflare"
// If you host on Cloudflare Pages you can instead switch on Web Analytics in the dashboard (no code).
const ANALYTICS = {
  provider: "none",
  goatcounterCode: "",   // e.g. "setubooks" for https://setubooks.goatcounter.com
  cloudflareToken: ""    // token from Cloudflare dashboard → Web Analytics → Add site
};

/* ===================================================================== */

(function () {
  "use strict";
  const CONTACT = "rasoolattar.tech@gmail.com";
  const params = new URLSearchParams(location.search);
  const DEMO = params.get("demo") === "1"; // ?demo=1 simulates a successful submit (for previews)

  // Brand placeholder
  document.querySelectorAll(".brand").forEach((el) => (el.textContent = BRAND));
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Analytics (opt-in by config)
  function loadScript(attrs) {
    const s = document.createElement("script");
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    document.head.appendChild(s);
  }
  const note = document.getElementById("analytics-note");
  if (ANALYTICS.provider === "goatcounter" && ANALYTICS.goatcounterCode) {
    loadScript({ "data-goatcounter": `https://${ANALYTICS.goatcounterCode}.goatcounter.com/count`, async: "", src: "https://gc.zgo.at/count.js" });
    if (note) note.textContent = "We use GoatCounter, a cookie-free, privacy-friendly counter, to count page visits. No personal data or cookies.";
  } else if (ANALYTICS.provider === "cloudflare" && ANALYTICS.cloudflareToken) {
    loadScript({ defer: "", src: "https://static.cloudflareinsights.com/beacon.min.js", "data-cf-beacon": JSON.stringify({ token: ANALYTICS.cloudflareToken }) });
    if (note) note.textContent = "We use Cloudflare Web Analytics, which is cookie-free, to count page visits. No advertising trackers.";
  }

  // Form
  const form = document.getElementById("waitlist-form");
  const statusEl = document.getElementById("form-status");
  const btn = document.getElementById("submit-btn");
  const thanks = document.getElementById("thanks");
  if (!form) return;

  function provider() {
    if (FORM_ENDPOINT.includes("web3forms.com")) return "web3forms";
    if (FORM_ENDPOINT.includes("formspree.io")) return "formspree";
    if (FORM_ENDPOINT.includes("script.google.com")) return "gas";
    if (FORM_ENDPOINT === "/" || FORM_ENDPOINT.startsWith("/")) return "netlify";
    return "generic";
  }

  function setStatus(msg, isErr) {
    statusEl.textContent = msg;
    statusEl.classList.toggle("err", !!isErr);
  }

  function validate() {
    let ok = true;
    form.querySelectorAll("[required]").forEach((el) => {
      const bad = el.type === "checkbox" ? !el.checked : !el.value.trim() || (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    return ok;
  }

  function collect() {
    const fd = new FormData(form);
    const data = {};
    fd.forEach((v, k) => { if (k !== "company_website") data[k] = typeof v === "string" ? v.trim() : v; });
    data.consent = form.consent.checked ? "yes" : "no";
    data.source = params.get("utm_source") || params.get("ref") || (document.referrer ? new URL(document.referrer).hostname : "direct");
    data.page = location.href.split("#")[0];
    data.submitted_at = new Date().toISOString();
    return data;
  }

  function showThanks(data) {
    form.hidden = true;
    thanks.hidden = false;
    const share = document.getElementById("share-wa");
    if (share) {
      const text = `Running ERPNext but your CA uses Tally? ${BRAND} is building a sync to stop double entry and GST mismatches. Early access: ${location.href.split("#")[0]}`;
      share.href = "https://wa.me/?text=" + encodeURIComponent(text);
    }
    thanks.focus();
    try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path: "signup-complete", event: true }); } catch (e) {}
  }

  async function send(data) {
    const p = provider();
    if (p === "web3forms") {
      if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.startsWith("YOUR_")) throw new Error("not-configured");
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New ${BRAND} waitlist signup: ${data.role || ""}`,
          from_name: `${BRAND} waitlist`,
          replyto: data.email,
          ...data
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || "send-failed");
      return;
    }
    if (p === "formspree") {
      if (FORM_ENDPOINT.includes("YOUR_")) throw new Error("not-configured");
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, _subject: `New ${BRAND} waitlist signup`, _replyto: data.email })
      });
      if (!res.ok) throw new Error("send-failed");
      return;
    }
    if (p === "gas") {
      if (FORM_ENDPOINT.includes("YOUR_")) throw new Error("not-configured");
      // Apps Script web apps don't send CORS headers; "no-cors" posts still arrive (response is opaque).
      await fetch(FORM_ENDPOINT, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
      return;
    }
    if (p === "netlify") {
      const body = new URLSearchParams({ "form-name": form.getAttribute("name") || "waitlist", ...data });
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error("send-failed");
      return;
    }
    const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error("send-failed");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");
    // Honeypot: bots fill hidden fields; silently pretend success.
    if (form.company_website && form.company_website.value) { showThanks({}); return; }
    if (!validate()) { setStatus("Please fill in the required fields (marked *).", true); return; }
    const data = collect();
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      if (DEMO) { await new Promise((r) => setTimeout(r, 400)); }
      else { await send(data); }
      showThanks(data);
    } catch (err) {
      const msg = err && err.message === "not-configured"
        ? `Signups aren't switched on yet. Please email ${CONTACT} and we'll add you.`
        : `Something went wrong. Please try again, or email ${CONTACT}.`;
      setStatus(msg, true);
    } finally {
      btn.disabled = false; btn.textContent = "Join the waitlist";
    }
  });

  form.addEventListener("input", (e) => { if (e.target.classList) e.target.classList.remove("invalid"); });
})();
