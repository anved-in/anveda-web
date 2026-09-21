import type { Line } from "./cart";
import { productById } from "./catalog";
import type { Customer } from "./payment";

/**
 * Hands the finished cart to the ANVEDA CRM, which creates a real ORD-xxx
 * order and returns its reference.
 *
 * This runs BEFORE Razorpay opens, so the order exists (payment_status
 * 'pending') by the time money moves; Razorpay's webhook then flips it to
 * paid. That ordering matters — a payment that arrives for an order the CRM
 * has never heard of can only be reconciled by hand, which is the exact
 * problem this replaces.
 */

/**
 * Where the CRM Worker lives. Overridable for local Worker testing.
 *
 * `||` not `??` on purpose: an unset GitHub Actions variable is injected as an
 * EMPTY STRING, not undefined, and `??` would keep it — making every request
 * relative to the Pages origin, where there is no API, with no visible error
 * until a customer's checkout fails.
 */
const CRM =
  process.env.NEXT_PUBLIC_CRM_ORIGIN || "https://anveda.anveda-in.workers.dev";

export interface OnlineOrderResult {
  ref: string;
}

/**
 * Resolve a cart line to the CRM's `products.id`.
 *
 * The CRM keeps one product row per colour+size; the storefront catalog
 * collapses sizes into a list and carries the mapping in `variant.pids`
 * (written by scripts/gen-catalog.py). A null here means the catalog mirror
 * is stale relative to the CRM — the caller must refuse the order rather than
 * guess, because the wrong id would bill and ship the wrong bangle.
 */
export const crmProductId = (l: Line): number | null => {
  const p = productById(l.id);
  const v = p?.variants.find((x) => x.colour === l.colour);
  return v?.pids?.[l.size] ?? null;
};

export class OrderIntakeError extends Error {}

export async function createCrmOrder(args: {
  ref: string;
  customer: Customer;
  lines: Line[];
  shipping: number;
  turnstileToken: string;
}): Promise<OnlineOrderResult> {
  const lines = args.lines.map((l) => {
    const productId = crmProductId(l);
    if (productId === null) {
      throw new OrderIntakeError(
        "One of these designs is out of sync with our stock list. Please message us on WhatsApp and we will take the order directly.",
      );
    }
    return { productId, qty: l.qty };
  });

  const res = await fetch(`${CRM}/api/online-order`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ref: args.ref,
      name: args.customer.name,
      phone: args.customer.phone,
      email: args.customer.email,
      address: args.customer.address,
      city: args.customer.city,
      state: args.customer.state,
      pin: args.customer.pin,
      notes: args.customer.notes,
      shipping: args.shipping,
      lines,
      turnstileToken: args.turnstileToken,
    }),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    const msg = (detail as { error?: string } | null)?.error;
    throw new OrderIntakeError(
      msg === "some items are no longer available"
        ? "Something in your bag just sold out. Please refresh and try again."
        : "We could not start your order. Please try again, or message us on WhatsApp.",
    );
  }

  return res.json() as Promise<OnlineOrderResult>;
}
