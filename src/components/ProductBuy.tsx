"use client";

import { useState } from "react";
import Link from "@/components/Link";
import { useCart } from "@/lib/cart";
import { imgSrc, inr, SIZE_GUIDE, type Product, type Variant } from "@/lib/catalog";
import { asset } from "@/lib/site";

/**
 * The buy box: colour, size, quantity, add to bag.
 *
 * Colour lives here rather than as separate product pages, which is how the
 * reference brands do it and how people actually shop: pick the design, then
 * the shade. The selected variant also drives the main photo, lifted into the
 * parent via `onVariant`.
 */
export default function ProductBuy({
  p,
  variant,
  onVariant,
}: {
  p: Product;
  /** Controlled by ProductView so the photo, the thumbnails and the line that
      reaches the cart can never disagree about which shade is selected. */
  variant: Variant;
  onVariant: (v: Variant) => void;
}) {
  // No size preselected on purpose: a defaulted size is the commonest cause of
  // a wrong-size delivery. The customer must choose deliberately.
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
    add(p.id, size, qty, variant.colour);
    setAdded(true);
    setOpen(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div>
      {/* ------------------------------------------------------------ colour */}
      {p.variants.length > 1 && (
        <div className="mt-7">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-bold uppercase tracking-[0.18em]">
              Colour
            </span>
            <span className="text-[12.5px] text-ink-soft">{variant.colour}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2.5">
            {p.variants.map((v) => {
              const on = v.colour === variant.colour;
              return (
                <button
                  key={v.colour}
                  type="button"
                  onClick={() => onVariant(v)}
                  aria-pressed={on}
                  aria-label={v.colour}
                  title={v.colour}
                  className={[
                    "h-[52px] w-[52px] cursor-pointer overflow-hidden border-2 transition-colors",
                    on ? "border-ink" : "border-transparent hover:border-line-strong",
                  ].join(" ")}
                >
                  {/* The photo is the truest swatch — a flat hex can never
                      represent a multi-tone or "assorted" set. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(imgSrc(v.image))}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- size */}
      <div className="mt-7">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-bold uppercase tracking-[0.18em]">
            Size {size && <span className="text-ink-soft">· {size}</span>}
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
                  "min-w-[76px] cursor-pointer border px-4 py-3 text-center transition-colors",
                  on
                    ? "border-ink bg-ink text-cream"
                    : "border-line-strong bg-white hover:border-ink",
                ].join(" ")}
              >
                <span className="block text-[15px] font-semibold">{s}</span>
                {g && (
                  <span
                    className={[
                      "mt-0.5 block text-[10.5px] uppercase tracking-[0.1em]",
                      on ? "text-cream/70" : "text-ink-soft",
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
          <p role="alert" className="mt-2.5 text-[13px] text-[#a33a2f]">
            Please choose a size first.
          </p>
        )}
      </div>

      {/* ---------------------------------------------------------- quantity */}
      <div className="mt-7">
        <span className="text-[12px] font-bold uppercase tracking-[0.18em]">
          Quantity
        </span>
        <div className="mt-3 inline-flex items-center border border-line-strong bg-white">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="cursor-pointer px-4 py-3 text-[17px] leading-none"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[42px] text-center text-[15px]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="cursor-pointer px-4 py-3 text-[17px] leading-none"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-8 w-full cursor-pointer bg-ink py-[18px] text-[12px] font-bold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-espresso-2"
      >
        {added ? "Added to bag ✓" : `Add to bag — ${inr(p.price * qty)}`}
      </button>

      <p className="mt-3.5 text-center text-[12.5px] text-ink-soft">
        Secure checkout with UPI, card or netbanking.
      </p>
    </div>
  );
}
