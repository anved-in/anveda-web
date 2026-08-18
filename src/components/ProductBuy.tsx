"use client";

import Link from "@/components/Link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { inr, SIZE_GUIDE, type Product } from "@/lib/catalog";

/**
 * The buy box: size, quantity, add to bag. Split out as a client component so
 * the rest of the product page stays server-rendered and static-exportable.
 */
export default function ProductBuy({ p }: { p: Product }) {
  // No size preselected on purpose. A defaulted size is the single most common
  // cause of a wrong-size delivery — the customer must choose deliberately.
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState(false);
  const [added, setAdded] = useState(false);
  const { add, setOpen } = useCart();

  const onAdd = () => {
    if (!size) {
      setErr(true);
      return;
    }
    add(p.id, size, qty);
    setAdded(true);
    setOpen(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div>
      <div className="mt-7">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-bold uppercase tracking-[0.18em]">
            Size
          </span>
          <Link
            href="/sizing"
            className="text-[12px] text-gold-deep underline underline-offset-2"
          >
            Size guide
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-2.5">
          {p.sizes.map((s) => {
            const g = SIZE_GUIDE.find((x) => x.size === s);
            const on = size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setErr(false);
                }}
                aria-pressed={on}
                className={[
                  "min-w-[74px] border px-4 py-3 text-center transition-colors",
                  on
                    ? "border-ink bg-ink text-ivory"
                    : "border-line hover:border-ink",
                ].join(" ")}
              >
                <span className="block text-[15px] font-semibold">{s}</span>
                {g && (
                  <span
                    className={[
                      "mt-0.5 block text-[10.5px] uppercase tracking-[0.1em]",
                      on ? "text-ivory/70" : "text-ink-soft",
                    ].join(" ")}
                  >
                    {g.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {err && (
          <p role="alert" className="mt-2.5 text-[13px] text-[#a3242f]">
            Please choose a size first.
          </p>
        )}
      </div>

      <div className="mt-7">
        <span className="text-[12px] font-bold uppercase tracking-[0.18em]">
          Quantity
        </span>
        <div className="mt-3 inline-flex items-center border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-3 text-[17px] leading-none"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[42px] text-center text-[15px]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="px-4 py-3 text-[17px] leading-none"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-8 w-full bg-maroon py-4.5 text-[12px] font-bold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-maroon-2"
        style={{ paddingTop: "18px", paddingBottom: "18px" }}
      >
        {added ? "Added to bag ✓" : `Add to bag — ${inr(p.price * qty)}`}
      </button>

      <p className="mt-3.5 text-center text-[12.5px] text-ink-soft">
        Secure checkout with UPI, card or netbanking.
      </p>
    </div>
  );
}
