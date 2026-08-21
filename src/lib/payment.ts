import type { Line } from "./cart";
import { productById, inr, unitPrice } from "./catalog";
import { SITE } from "./site";

/**
 * -------------------------------------------------------------------------
 * PAYMENTS — how this works, and what its limits are.
 * -------------------------------------------------------------------------
 * The site is a STATIC export (GitHub Pages), so there is no server of ours in
 * the payment path. That rules out the standard Razorpay Orders flow, which
 * needs a secret key to create an order and to verify the signature afterwards.
 * A secret key shipped to the browser is a compromised key, so we do not.
 *
 * What we do instead, and why it is still real:
 *   - Razorpay Checkout is opened in the browser with the PUBLIC key only
 *     (key_id is designed to be public). The customer pays by UPI, card or
 *     netbanking on Razorpay's own widget. Money genuinely moves.
 *   - Razorpay itself emails the merchant and the customer on success, and the
 *     payment appears in the Razorpay dashboard. That dashboard — not this
 *     site — is the source of truth for what was paid.
 *   - We additionally hand the order details to the owner over WhatsApp, so a
 *     payment is always tied to an itemised order with a shipping address.
 *
 * What this CANNOT do without a server, stated plainly:
 *   - It cannot cryptographically verify the payment signature. A determined
 *     user could fake a "success" screen on this site. They cannot fake money
 *     arriving in the Razorpay account, which is what the owner ships against.
 *   - Therefore: ALWAYS confirm the payment in the Razorpay dashboard before
 *     dispatching. The success page says this to the customer too.
 *
 * Upgrading later is a contained change: deploy to a host with server routes
 * (Vercel/Cloudflare), add /api/order + /api/verify, and switch
 * `createOrder()` below to call it. Nothing else in the app changes.
 */

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  notes?: string;
}

export interface OrderSummary {
  lines: Line[];
  subtotal: number;
  shipping: number;
  total: number;
}

/** Razorpay's public key. Safe to ship; it identifies the account, not authorises it. */
export const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

/** Payments are only live once a real key is configured. */
export const paymentsEnabled = (): boolean =>
  RAZORPAY_KEY.startsWith("rzp_");

export const shippingFor = (subtotal: number): number =>
  subtotal === 0 || subtotal >= SITE.freeShippingAbove ? 0 : SITE.shippingFlat;

/** A short human-readable reference the customer and owner can both quote. */
export const makeRef = (): string =>
  "AV" +
  Date.now().toString(36).toUpperCase().slice(-6) +
  Math.random().toString(36).toUpperCase().slice(2, 5);

/** Itemised order text, used for the WhatsApp handoff and the receipt. */
export const orderText = (
  ref: string,
  o: OrderSummary,
  c: Customer,
  paymentId?: string,
): string => {
  const items = o.lines
    .map((l) => {
      const p = productById(l.id);
      if (!p) return null;
      const shade = l.colour ? ` — ${l.colour}` : "";
      return `• ${p.name}${shade} — size ${l.size} × ${l.qty} = ${inr(
        unitPrice(l.id, l.colour) * l.qty,
      )}`;
    })
    .filter(Boolean)
    .join("\n");

  return [
    `*ANVEDA order ${ref}*`,
    "",
    items,
    "",
    `Subtotal: ${inr(o.subtotal)}`,
    `Shipping: ${o.shipping === 0 ? "Free" : inr(o.shipping)}`,
    `*Total: ${inr(o.total)}*`,
    "",
    paymentId ? `Payment ID: ${paymentId}` : "Payment: pending",
    "",
    "*Ship to*",
    c.name,
    c.address,
    `${c.city}, ${c.state} — ${c.pin}`,
    `Phone: ${c.phone}`,
    c.email ? `Email: ${c.email}` : "",
    c.notes ? `Notes: ${c.notes}` : "",
  ]
    .filter((s) => s !== "")
    .join("\n");
};

/** Minimal shape of the Razorpay checkout global we actually use. */
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}
interface RazorpayInstance {
  open: () => void;
  on: (ev: string, cb: (e: unknown) => void) => void;
}
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => RazorpayInstance;
  }
}

/** Load Razorpay's script once, on demand. */
export const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

/**
 * Open Razorpay checkout. Resolves with the payment id on success, or null if
 * the customer dismissed the widget.
 */
export const payWithRazorpay = (
  ref: string,
  o: OrderSummary,
  c: Customer,
): Promise<string | null> =>
  new Promise(async (resolve, reject) => {
    const ok = await loadRazorpay();
    if (!ok || !window.Razorpay) {
      reject(new Error("Could not reach Razorpay. Check your connection."));
      return;
    }

    let settled = false;
    const rz = new window.Razorpay({
      key: RAZORPAY_KEY,
      // Razorpay works in paise.
      amount: Math.round(o.total * 100),
      currency: "INR",
      name: SITE.name,
      description: `Order ${ref}`,
      prefill: { name: c.name, email: c.email, contact: c.phone },
      notes: { ref, address: `${c.address}, ${c.city}, ${c.state} ${c.pin}` },
      theme: { color: "#2b2724" },
      handler: (res: RazorpayResponse) => {
        settled = true;
        resolve(res.razorpay_payment_id);
      },
      modal: {
        ondismiss: () => {
          if (!settled) resolve(null);
        },
      },
    });

    rz.on("payment.failed", (e: unknown) => {
      settled = true;
      const msg =
        (e as { error?: { description?: string } })?.error?.description ??
        "Payment failed. No money was taken.";
      reject(new Error(msg));
    });

    rz.open();
  });
