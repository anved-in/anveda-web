# ANVEDA — storefront

A Next.js storefront for ANVEDA: handpicked glass, antique and kundan bangles.
Static-exported, deployed to GitHub Pages, with real Razorpay payments.

Built from the visual language of Missoma, Astrid & Miyu, Swarovski and Cartier,
on ANVEDA's own brand assets (logo, Luxenta + Salena typefaces, maroon/gold
palette) and its real product photography.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export -> ./out
```

---

## What is in here

| Route | What it is |
|---|---|
| `/` | Home — hero, collections, signature designs, story, lookbook |
| `/collections` | All 11 collections, each with its designs |
| `/collections/[slug]` | One collection, its full range |
| `/product/[id]` | Product detail — size, quantity, add to bag |
| `/checkout` | Shipping details + payment |
| `/order-confirmed` | Confirmation with order reference |
| `/about` `/sizing` `/shipping` `/contact` | Content pages |

79 products across 11 collections, all statically generated (101 pages).

Product data lives in [`src/data/catalog.json`](src/data/catalog.json), generated
from ANVEDA's real inventory and product photographs. Prices (₹350 / ₹499), sizes
(2.2–2.8) and set counts come from the live ANVEDA database.

### To change products

Edit `src/data/catalog.json` and rebuild. Each product needs an `image` that
exists in `public/img/products/`.

---

## Payments — read this before going live

Razorpay Checkout is wired up and takes **real money** (UPI, cards, netbanking,
wallets). It is off until you set a key.

### Turning it on

1. Create a Razorpay account at <https://dashboard.razorpay.com>, complete KYC.
2. Copy your **Key ID** (`rzp_live_…` or `rzp_test_…` for testing).
3. Add it as a **repository variable** (Settings → Secrets and variables →
   Actions → *Variables*), named `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
4. Redeploy.

Locally, put it in `.env.local`:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
NEXT_PUBLIC_WHATSAPP=918217544994
```

The Key ID is *designed to be public* — it identifies the account, it does not
authorise charges. It is a variable, not a secret, on purpose.

### The important limitation

This site is a **static export**: there is no server of ours in the payment path.
That means the payment signature **cannot be cryptographically verified**, because
verification needs the Razorpay *secret* key, and a secret shipped to a browser is
a leaked secret.

In practice:

- Money genuinely moves. The payment appears in your Razorpay dashboard, and
  Razorpay emails both you and the customer.
- Every order is also sent to you on WhatsApp, itemised, with the shipping address
  and the payment ID.
- **Always confirm the payment in the Razorpay dashboard before you ship.** A
  determined person could fake the success *screen* on this site; they cannot fake
  money arriving in your account. The dashboard is the source of truth.

If payments are not configured, checkout degrades honestly: it says so, and sends
the order as a WhatsApp enquiry instead of pretending to charge.

### Upgrading to full verification

Deploy to a host that runs Next properly (Vercel or Cloudflare Workers — both have
free tiers), then:

1. Remove `output: "export"` from `next.config.ts`.
2. Add `/api/order` (creates a Razorpay order with the secret key) and
   `/api/verify` (checks the HMAC signature).
3. Point `createOrder()` in [`src/lib/payment.ts`](src/lib/payment.ts) at them.

Nothing else changes — the cart, checkout and UI are already separated from the
payment mechanism.

---

## Deploying to GitHub Pages

Already configured in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Push this repo to GitHub.
2. Settings → Pages → **Source: GitHub Actions**.
3. Push to `main`. The workflow builds and deploys.

The site will be at `https://<user>.github.io/<repo>/`.

The workflow sets `NEXT_PUBLIC_BASE_PATH` to `/<repo>` automatically, which is
what makes assets resolve under that subpath.

### Optional repository variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Turns on live payments |
| `NEXT_PUBLIC_WHATSAPP` | Order/enquiry number, digits with country code |
| `NEXT_PUBLIC_BASE_PATH` | Override the path prefix (set empty for a custom domain) |

### Moving to a custom domain

1. Settings → Pages → Custom domain → enter your domain.
2. Add a repository variable `NEXT_PUBLIC_BASE_PATH` set to an **empty string**
   (the site then builds for the root instead of `/<repo>`).
3. Add a `public/CNAME` file containing your domain.
4. Point your DNS at GitHub Pages.

---

## Notes for whoever works on this next

A few things here look unusual and are deliberate:

- **`overflow-x: clip`, not `hidden`** on `html/body` (`globals.css`). `hidden`
  turns them into a scroll container, which silently kills the sticky header.
- **Fonts are declared in `BrandFonts.tsx`, not in CSS.** A `url()` in a
  stylesheet ignores `basePath`, so on a project site every face 404s and the
  brand quietly renders in Georgia. See the comment in that file.
- **`components/Link.tsx` wraps `next/link` with `prefetch={false}`.** A static
  export cannot serve RSC prefetch payloads, so prefetching produces dozens of
  404s per page. Delete the default if this ever moves to a real Next host.
- **The reveal observer uses `threshold: 0`** and has a bottom safety net.
  A fractional threshold can never be satisfied by an element taller than the
  viewport, which strands content invisible forever.
- **No size is preselected** on the product page. A defaulted size is the most
  common cause of a wrong-size delivery.
