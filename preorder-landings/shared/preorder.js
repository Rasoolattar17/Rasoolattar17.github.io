const FORM_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = '795d07c0-4661-4501-86a0-bdbae5521fcc';
const CONTACT = 'rasoolattar.tech@gmail.com';

(function () {
  'use strict';
  const cfg = window.PREORDER_CONFIG || {};
  const BRAND = cfg.brand || 'Product';
  const PRODUCT = cfg.product || 'unknown';
  const SUBJECT = cfg.subject || `Pre-order: ${BRAND}`;
  const submitDefault = cfg.submitLabel || 'Submit pre-order';

  const params = new URLSearchParams(location.search);
  const DEMO = params.get('demo') === '1';
  const utm = params.get('utm_source') || '';

  document.querySelectorAll('.brand').forEach((el) => (el.textContent = BRAND));
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  const utmInput = document.getElementById('utm_source');
  if (utmInput) utmInput.value = utm;

  const form = document.getElementById('preorder-form');
  const statusEl = document.getElementById('form-status');
  const btn = document.getElementById('submit-btn');
  const thanks = document.getElementById('thanks');
  if (!form) return;

  function setStatus(msg, isErr) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.toggle('err', !!isErr);
  }

  function validate() {
    let ok = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const bad =
        el.type === 'checkbox'
          ? !el.checked
          : !String(el.value).trim() ||
            (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    return ok;
  }

  function collect() {
    const fd = new FormData(form);
    const data = {};
    fd.forEach((v, k) => {
      if (k !== 'company_website') data[k] = typeof v === 'string' ? v.trim() : v;
    });
    data.founding_price = form.founding_price && form.founding_price.checked ? 'yes' : 'no';
    data.product = PRODUCT;
    data.utm_source = utm || params.get('ref') || '';
    data.source = data.utm_source || (document.referrer ? new URL(document.referrer).hostname : 'direct');
    data.page = location.href.split('#')[0];
    data.submitted_at = new Date().toISOString();
    return data;
  }

  function showThanks() {
    form.hidden = true;
    if (thanks) {
      thanks.hidden = false;
      thanks.focus();
    }
  }

  async function send(data) {
    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.startsWith('YOUR_')) {
      throw new Error('not-configured');
    }
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: SUBJECT,
        from_name: `${BRAND} pre-order`,
        replyto: data.email,
        ...data,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) throw new Error(json.message || 'send-failed');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('');
    if (form.company_website && form.company_website.value) {
      showThanks();
      return;
    }
    if (!validate()) {
      setStatus('Please fill in the required fields (marked *).', true);
      return;
    }
    const data = collect();
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      if (DEMO) await new Promise((r) => setTimeout(r, 400));
      else await send(data);
      showThanks();
    } catch (err) {
      const msg =
        err && err.message === 'not-configured'
          ? `Pre-orders are not wired up yet. Email ${CONTACT} and we will add you.`
          : `Something went wrong. Try again or email ${CONTACT}.`;
      setStatus(msg, true);
    } finally {
      btn.disabled = false;
      btn.textContent = submitDefault;
    }
  });

  form.addEventListener('input', (e) => {
    if (e.target.classList) e.target.classList.remove('invalid');
  });

  document.querySelectorAll('a[href="#preorder"]').forEach((link) => {
    link.addEventListener('click', (ev) => {
      const target = document.getElementById('preorder');
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const first = form.querySelector('input:not([type=hidden])');
        if (first) setTimeout(() => first.focus(), 400);
      }
    });
  });
})();