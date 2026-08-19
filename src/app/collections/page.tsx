import type { Metadata } from "next";
import Link from "@/components/Link";
import { collections, listingsIn, allListings } from "@/lib/catalog";
import ListingCard from "@/components/ListingCard";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse every ANVEDA bangle — glass, kundan, antique, jelly and acrylic, across eleven collections.",
};

export default function CollectionsPage() {
  return (
    <>
      <section className="border-b border-line px-5 pb-10 pt-12 sm:px-6 md:pb-14 md:pt-16">
        <div className="mx-auto max-w-[1320px]">
          <span className="eyebrow">The full range</span>
          <h1 className="mt-3 font-display text-[clamp(34px,5vw,62px)]">
            Collections
          </h1>
          <p className="mt-4 max-w-[56ch] text-[15px] text-ink-soft">
            {allListings().length} designs across {collections.length} collections —
            from everyday glass to the heavier pieces kept for the big days.
          </p>
        </div>
      </section>

      {/* Collection index: a quick jump list, because eleven collections is a
          lot to scroll past if you already know what you came for. */}
      <section className="border-b border-line px-5 py-5 sm:px-6">
        <div className="no-bar mx-auto flex max-w-[1320px] gap-2 overflow-x-auto">
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`#${c.slug}`}
              className="shrink-0 border border-line px-4 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-ink hover:bg-ink hover:text-cream"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {collections.map((c, ci) => {
        const items = listingsIn(c.slug);
        return (
          <section
            key={c.slug}
            id={c.slug}
            className={[
              "scroll-mt-24 px-5 py-14 sm:px-6 md:py-20",
              ci % 2 === 1 ? "bg-cream-2" : "",
            ].join(" ")}
          >
            <div className="mx-auto max-w-[1320px]">
              <div className="reveal mb-9 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-5">
                <div>
                  <span className="eyebrow">
                    {items.length} {items.length === 1 ? "design" : "designs"}
                  </span>
                  <h2 className="mt-2.5 font-display text-[clamp(26px,3.2vw,40px)]">
                    {c.name}
                  </h2>
                  <p className="mt-3 max-w-[58ch] text-[15px] text-ink-soft">
                    {c.blurb}
                  </p>
                </div>
                <Link
                  href={`/collections/${c.slug}`}
                  className="border-b border-current pb-1 text-[11.5px] font-bold uppercase tracking-[0.2em]"
                >
                  View collection
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6">
                {items.slice(0, 8).map((l, i) => (
                  <ListingCard key={l.variant.colour} l={l} delay={(i % 4) * 70} />
                ))}
              </div>

              {items.length > 8 && (
                <div className="mt-9 text-center">
                  <Link
                    href={`/collections/${c.slug}`}
                    className="inline-block border border-ink px-8 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-cream"
                  >
                    All {items.length} {c.name}
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
