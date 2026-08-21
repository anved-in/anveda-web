"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/Link";
import ProductBuy from "@/components/ProductBuy";
import Price from "@/components/Price";
import { imgSrc, inr, variantPrice, type Product, type Variant } from "@/lib/catalog";
import { asset, SITE } from "@/lib/site";

/**
 * Product page body. A client component because the main photograph has to
 * follow the colour the shopper picks in the buy box — that link is the whole
 * point of having colour variants on one page.
 *
 * `?c=<colour>` preselects a shade, which is how collection grids can still
 * list individual colourways while every one of them lands here.
 */
export default function ProductView({ p }: { p: Product }) {
  const q = useSearchParams();
  const wanted = q.get("c") ?? undefined;

  const initial =
    p.variants.find(
      (v) => v.colour.toLowerCase() === (wanted ?? "").toLowerCase(),
    ) ?? p.variants[0];

  const [variant, setVariant] = useState<Variant>(initial);

  return (
    <div className="flex flex-wrap gap-y-8">
      <div className="w-full md:w-[55%] md:pr-10 lg:w-[58%]">
        <div className="aspect-square overflow-hidden bg-cream-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={variant.image}
            src={asset(imgSrc(variant.image))}
            alt={`${p.name} — ${variant.colour}`}
            className="h-full w-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* Thumbnail strip: a second, larger way into the colourways for anyone
            who scans images rather than swatches. */}
        {p.variants.length > 1 && (
          <div className="no-bar mt-3 flex gap-2.5 overflow-x-auto pb-1">
            {p.variants.map((v) => (
              <button
                key={v.colour}
                type="button"
                onClick={() => setVariant(v)}
                aria-label={v.colour}
                aria-pressed={v.colour === variant.colour}
                className={[
                  "h-[74px] w-[74px] shrink-0 cursor-pointer overflow-hidden border-2 transition-colors",
                  v.colour === variant.colour
                    ? "border-ink"
                    : "border-transparent hover:border-line-strong",
                ].join(" ")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(imgSrc(v.image))}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full md:w-[45%] lg:w-[42%]">
        <Link
          href={`/collections/${p.collection}`}
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-maroon"
        >
          {p.collectionName}
        </Link>
        <h1 className="mt-2.5 font-display text-[clamp(28px,3.6vw,44px)]">
          {p.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Price price={variantPrice(p, variant)} size="lg" />
          <span className="badge-sale">20% off</span>
          {(variant.pieces ?? p.pieces) > 1 && (
            <span className="w-full text-[13.5px] text-ink-soft">
              for a {p.unit === "dozen" ? "dozen" : `set of ${variant.pieces ?? p.pieces}`}
            </span>
          )}
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{p.story}</p>

        <ProductBuy p={p} variant={variant} onVariant={setVariant} />

        <dl className="mt-9 border-t border-line">
          {[
            ["Colour", variant.colour],
            [
              "In the set",
              (variant.pieces ?? p.pieces) > 1
                ? `${variant.pieces ?? p.pieces} bangles`
                : "1 bangle",
            ],
            ["Sizes", (variant.sizes.length ? variant.sizes : p.sizes).join(" · ")],
            ["Delivery", `All India · free above ${inr(SITE.freeShippingAbove)}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-line py-3.5">
              <dt className="text-[12.5px] uppercase tracking-[0.12em] text-ink-soft">
                {k}
              </dt>
              <dd className="text-right text-[13.5px] font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 bg-cream-2 p-5">
          <p className="text-[13.5px] leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">
              Not sure about your size?
            </strong>{" "}
            Message us on WhatsApp and we will help you measure in under a minute.
          </p>
          <a
            href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
              `Hi ANVEDA! I need help with sizing for ${p.name} (${variant.colour}).`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block border border-ink px-6 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-cream"
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
