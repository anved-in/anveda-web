import Link from "@/components/Link";
import { imgSrc, inr, type Listing } from "@/lib/catalog";
import { asset } from "@/lib/site";

/**
 * Grid tile for one colourway. Browsing still happens colour-by-colour — that
 * is what a shopper scans for — but every tile links to the single product page
 * with `?c=<colour>`, where the shade can be changed without going back.
 */
export default function ListingCard({
  l,
  delay = 0,
  priority = false,
}: {
  l: Listing;
  delay?: number;
  priority?: boolean;
}) {
  const { product: p, variant: v, href } = l;
  const showColour = p.variants.length > 1;

  return (
    <article className="reveal group" data-d={delay}>
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-cream-2">
          {/* Plain <img>: the site builds to a static export, where the Next
              image optimizer is unavailable. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(imgSrc(v.image))}
            alt={`${p.name}${showColour ? ` — ${v.colour}` : ""}`}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
        <div className="pt-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            {p.collectionName}
          </div>
          <h3 className="mt-1 font-sans text-[14.5px] font-semibold leading-snug">
            {showColour ? v.colour : p.name}
          </h3>
          <div className="mt-1.5 text-[14px]">
            <span className="font-semibold">{inr(p.price)}</span>
            {p.pieces > 1 && (
              <span className="ml-1.5 text-[12px] text-ink-soft">
                set of {p.pieces}
              </span>
            )}
          </div>
          {showColour && (
            <div className="mt-1 text-[12px] text-ink-soft">
              {p.variants.length} colours
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
