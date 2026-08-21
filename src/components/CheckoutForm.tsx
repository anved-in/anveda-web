"use client";

import Link from "@/components/Link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, lineProduct } from "@/lib/cart";
import { imgSrc, inr, unitPrice } from "@/lib/catalog";
import { asset, SITE, waLink } from "@/lib/site";
import {
  type Customer,
  makeRef,
  orderText,
  payWithRazorpay,
  paymentsEnabled,
  shippingFor,
} from "@/lib/payment";

const EMPTY: Customer = {
  name: "", email: "", phone: "", address: "",
  city: "", state: "", pin: "", notes: "",
};

// Field-level validation. Kept explicit rather than pulling in a schema library
// for eight fields — the rules are the business rules, in one readable place.
const validate = (c: Customer): Partial<Record<keyof Customer, string>> => {
  const e: Partial<Record<keyof Customer, string>> = {};
  if (c.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!/^[6-9]\d{9}$/.test(c.phone.replace(/\D/g, "").slice(-10)))
    e.phone = "Enter a valid 10-digit Indian mobile number.";
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email))
    e.email = "That email does not look right.";
  if (c.address.trim().length < 8) e.address = "Please enter your full address.";
  if (c.city.trim().length < 2) e.city = "Required.";
  if (c.state.trim().length < 2) e.state = "Required.";
  if (!/^\d{6}$/.test(c.pin.trim())) e.pin = "PIN must be 6 digits.";
  return e;
};

export default function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, clear, ready } = useCart();
  const [c, setC] = useState<Customer>(EMPTY);
  const [errs, setErrs] = useState<Partial<Record<keyof Customer, string>>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const live = paymentsEnabled();

  const set = (k: keyof Customer) => (v: string) => {
    setC((cur) => ({ ...cur, [k]: v }));
    if (errs[k]) setErrs((cur) => ({ ...cur, [k]: undefined }));
  };

  // Hand the finished order to the owner on WhatsApp, then clear the bag and
  // show the confirmation. Used by both the paid and the enquiry paths.
  const finish = (ref: string, paymentId?: string) => {
    const text = orderText(
      ref,
      { lines, subtotal, shipping, total },
      c,
      paymentId,
    );
    clear();
    // Open WhatsApp in a new tab so the confirmation page still loads here.
    window.open(waLink(text), "_blank", "noopener");
    const q = new URLSearchParams({ ref, ...(paymentId ? { p: paymentId } : {}) });
    router.push(`/order-confirmed/?${q.toString()}`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFailure(null);
    const v = validate(c);
    setErrs(v);
    if (Object.keys(v).length > 0) {
      document.querySelector<HTMLElement>("[data-err='1']")?.focus();
      return;
    }
    if (lines.length === 0) return;

    const ref = makeRef();

    if (!live) {
      // No payment key configured — send the order as an enquiry rather than
      // pretending to charge. Honest degradation beats a fake success screen.
      finish(ref);
      return;
    }

    setBusy(true);
    try {
      const paymentId = await payWithRazorpay(
        ref,
        { lines, subtotal, shipping, total },
        c,
      );
      // null = the customer closed the widget. Not an error; just stop.
      if (paymentId) finish(ref, paymentId);
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Payment could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return <p className="mt-10 text-ink-soft">Loading your bag…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="mt-10 border border-line p-10 text-center">
        <p className="text-ink-soft">Your bag is empty.</p>
        <Link
          href="/collections"
          className="mt-6 inline-block border border-ink px-7 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-cream"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  const field = (
    k: keyof Customer,
    label: string,
    extra: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label className="block">
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </span>
      <input
        {...extra}
        value={c[k] ?? ""}
        onChange={(e) => set(k)(e.target.value)}
        data-err={errs[k] ? "1" : undefined}
        aria-invalid={!!errs[k]}
        className={[
          "mt-1.5 w-full border bg-white px-3.5 py-3 text-[15px] outline-none transition-colors",
          errs[k] ? "border-[#a33a2f]" : "border-line focus:border-ink",
        ].join(" ")}
      />
      {errs[k] && <span className="mt-1 block text-[12.5px] text-[#a33a2f]">{errs[k]}</span>}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-wrap gap-y-10">
      {/* ------------------------------------------------------- details */}
      <div className="w-full md:w-[58%] md:pr-12">
        <h2 className="font-display text-[22px]">Shipping details</h2>

        <div className="mt-5 space-y-4">
          {field("name", "Full name *", { autoComplete: "name" })}
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[200px] flex-1">
              {field("phone", "Mobile number *", {
                inputMode: "numeric", autoComplete: "tel", maxLength: 12,
              })}
            </div>
            <div className="min-w-[200px] flex-1">
              {field("email", "Email", { type: "email", autoComplete: "email" })}
            </div>
          </div>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Address *
            </span>
            <textarea
              rows={3}
              value={c.address}
              onChange={(e) => set("address")(e.target.value)}
              autoComplete="street-address"
              aria-invalid={!!errs.address}
              className={[
                "mt-1.5 w-full border bg-white px-3.5 py-3 text-[15px] outline-none transition-colors",
                errs.address ? "border-[#a33a2f]" : "border-line focus:border-ink",
              ].join(" ")}
            />
            {errs.address && (
              <span className="mt-1 block text-[12.5px] text-[#a33a2f]">{errs.address}</span>
            )}
          </label>

          <div className="flex flex-wrap gap-4">
            <div className="min-w-[150px] flex-1">
              {field("city", "City *", { autoComplete: "address-level2" })}
            </div>
            <div className="min-w-[150px] flex-1">
              {field("state", "State *", { autoComplete: "address-level1" })}
            </div>
            <div className="min-w-[120px] flex-1">
              {field("pin", "PIN code *", {
                inputMode: "numeric", autoComplete: "postal-code", maxLength: 6,
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Order notes
            </span>
            <textarea
              rows={2}
              value={c.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Anything we should know — gift wrap, delivery timing…"
              className="mt-1.5 w-full border border-line bg-white px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-ink"
            />
          </label>
        </div>
      </div>

      {/* ------------------------------------------------------ summary */}
      <div className="w-full md:w-[42%]">
        <div className="bg-cream-2 p-6">
          <h2 className="font-display text-[22px]">Order summary</h2>

          <div className="mt-5">
            {lines.map((l) => {
              const p = lineProduct(l);
              if (!p) return null;
              return (
                <div key={`${l.id}__${l.size}__${l.colour}`} className="flex gap-3.5 border-b border-line py-4">
                  <div className="h-[64px] w-[52px] shrink-0 overflow-hidden bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset(imgSrc(
                        p.variants.find((v) => v.colour === l.colour)?.image ?? p.image,
                      ))}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold">{p.name}</div>
                    <div className="text-[12px] text-ink-soft">
                      {l.colour && `${l.colour} · `}Size {l.size} · Qty {l.qty}
                    </div>
                  </div>
                  <div className="text-[13.5px] font-semibold">{inr(unitPrice(l.id, l.colour) * l.qty)}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-1.5 text-[14px]">
            <div className="flex justify-between">
              <span className="text-ink-soft">Subtotal</span>
              <span className="font-semibold">{inr(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Shipping</span>
              <span className="font-semibold">{shipping === 0 ? "Free" : inr(shipping)}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-[17px]">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{inr(total)}</span>
          </div>

          {failure && (
            <p role="alert" className="mt-4 border border-[#a33a2f] bg-[#a33a2f]/5 p-3 text-[13px] text-[#a33a2f]">
              {failure}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full bg-espresso py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-espresso-2 disabled:opacity-60"
          >
            {busy ? "Opening payment…" : live ? `Pay ${inr(total)}` : `Place order — ${inr(total)}`}
          </button>

          {live ? (
            <p className="mt-3 text-center text-[12px] text-ink-soft">
              Secure payment by Razorpay — UPI, card, netbanking or wallet.
            </p>
          ) : (
            // Being explicit beats a checkout that silently does nothing.
            <p className="mt-3 text-center text-[12px] text-ink-soft">
              Online payment is not switched on yet. Your order will be sent to
              us on WhatsApp and we will share payment details there.
            </p>
          )}

          <p className="mt-3 text-center text-[12px] text-ink-soft">
            Questions?{" "}
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Message us
            </a>
          </p>
        </div>
      </div>
    </form>
  );
}
