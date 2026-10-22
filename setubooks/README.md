# Waitlist landing page (Tally ⇄ ERPNext sync), placeholder brand "SetuBooks"

Static site with no build step: `index.html`, `assets/styles.css`, `assets/app.js`, `assets/favicon.svg`.
Open `index.html` in a browser to preview, or add `?demo=1` to the URL to simulate a successful signup.

## 1. Change the product name
- `assets/app.js` → `const BRAND = "SetuBooks";` updates every visible brand label.
- Also find/replace `SetuBooks` in `index.html` (`<title>`, meta tags) so search engines and link previews show it.

Name ideas (check trademarks and domain availability first): **SetuBooks** (setu = bridge), **BahiSync** (bahi-khata = ledger book), **LedgerSetu**.

## 2. Turn on the form (default: Web3Forms, free 250 submissions/month)
1. Go to https://web3forms.com, enter **rasoolattar.tech@gmail.com**, and get the Access Key by email.
2. Paste it into `assets/app.js` → `const WEB3FORMS_ACCESS_KEY = "...";`
3. Deploy, submit a test entry, and check your inbox (and spam folder the first time).
4. Optional: enable hCaptcha in the Web3Forms dashboard if spam appears. The honeypot is already built in.

The free plan emails every signup to you. Its dashboard history covers 30 days, so keep the emails (or label them in Gmail).

### Switch backends (change only `FORM_ENDPOINT` in `assets/app.js`)
| Backend | FORM_ENDPOINT | Free limit | Notes |
|---|---|---|---|
| Web3Forms (default) | `https://api.web3forms.com/submit` + `WEB3FORMS_ACCESS_KEY` | 250/month | Email delivery; CSV export |
| Google Sheet (Apps Script) | your `https://script.google.com/macros/s/.../exec` URL | No submission cap; Apps Script daily quotas apply | Data lands in your own Sheet. See `google-apps-script/Code.gs` |
| Formspree | `https://formspree.io/f/<id>` | 50/month | Free plan is "for testing and development" |
| Netlify Forms | `/` (only when hosted on Netlify) | Unlimited on credit-based plans | Form markup already has `data-netlify` attributes |

## 3. Optional analytics (cookie-free)
In `assets/app.js` set `ANALYTICS.provider` to `"goatcounter"` (with your code) or `"cloudflare"` (with your token).
On Cloudflare Pages you can instead switch on Web Analytics in the project settings, with no code needed.

## 4. Deploy (free)
**Recommended: Cloudflare Pages.** Push this folder to a GitHub repo → Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
Framework: None. Build command: (empty). Output directory: `/`. You get `<project>.pages.dev`.

**Alternative: GitHub Pages.** Push to a repo (e.g. `waitlist`) → Settings → Pages → Deploy from branch `main` / root.
URL: `https://rasoolattar17.github.io/waitlist/`, or put it in the existing `Rasoolattar17.github.io` repo under a folder.

## 5. Screenshots
`screenshot-desktop.png`, `screenshot-mobile.png`, and `screenshot-thanks-mobile.png` (taken with headless Chrome via Playwright).
