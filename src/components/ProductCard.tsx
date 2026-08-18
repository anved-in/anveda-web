import Link from "@/components/Link";
import { imgSrc, inr, type Product } from "@/lib/catalog";
import { asset } from "@/lib/site";

/**
 * Product tile used on collection pages and in related rows.
 * Deliberately quiet: photo, name, price. The colour and size decision belongs
 * on the product page, not on a grid tile.
 */
export default function ProductCard({
  p,
  delay = 0,
  priority = false,
}: {
  p: Product;
  delay?: number;
  priority?: boolean;
}) {
  return (
    <article className="reveal group" data-d={delay}>
      <Link href={`/product/${p.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-cream-2">
          {/* Plain <img>: the site builds to a static export, where the Next
              image optimizer is unavailable. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(imgSrc(p.image))}
            alt={`${p.name} — ${p.collectionName}`}
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
            {p.name}
          </h3>
          <div className="mt-1.5 text-[14px]">
            <span className="font-semibold">{inr(p.price)}</span>
            {p.pieces > 1 && (
              <span className="ml-1.5 text-[12px] text-ink-soft">
                set of {p.pieces}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
