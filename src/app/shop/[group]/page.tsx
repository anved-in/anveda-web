import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/Link";
import ListingCard from "@/components/ListingCard";
import {
  groups,
  groupBySlug,
  collectionsInGroup,
  listingsInGroup,
  imgSrc,
} from "@/lib/catalog";
import { asset } from "@/lib/site";

/**
 * A top-level group — Glass, Ornate or Layering — with the families inside it.
 *
 * This is the level the catalogue itself groups by, so the shop now matches:
 * the header lists the three groups, each opens here, and each family below
 * still has its own page.
 */

export function generateStaticParams() {
  return groups.map((g) => ({ group: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group } = await params;
  const g = groupBySlug(group);
  if (!g) return {};
  return { title: g.name, description: g.blurb };
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const g = groupBySlug(group);
  if (!g) notFound();

  const families = collectionsInGroup(g.slug);
  const items = listingsInGroup(g.slug);

  return (
    <>
      <section className="border-b border-line px-4 pb-8 pt-9 sm:px-6 md:pb-10 md:pt-12">
        <div className="mx-auto max-w-[1320px]">
          <nav className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            <Link href="/collections" className="hover:text-maroon">
              Shop
            </Link>
            <span className="px-2">/</span>
            <span className="text-maroon">{g.name}</span>
          </nav>
          <h1 className="mt-3 font-display text-[clamp(30px,4.4vw,54px)]">
            {g.name}
          </h1>
          <p className="mt-3 max-w-[56ch] text-[15px] text-ink-soft">{g.blurb}</p>
          <p className="mt-2 text-[12.5px] text-ink-faint">
            {families.length} ranges · {items.length} designs
          </p>
        </div>
      </section>

      {/* The families in this group, as a row of covers. */}
      <section className="px-4 py-9 sm:px-6">
        <div className="mx-auto max-w-[1320px]">
          <div className="no-bar flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-6 md:gap-5 md:overflow-visible">
            {families.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="group w-[42%] shrink-0 snap-start md:w-auto"
              >
                <div className="aspect-square overflow-hidden bg-cream-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(imgSrc(c.cover))}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="pt-2.5 text-center text-[12.5px] transition-colors group-hover:text-maroon">
                  {c.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Everything in the group, so it can be browsed without drilling in. */}
      <section className="px-4 pb-14 sm:px-6">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {items.map((l, i) => (
              <ListingCard
                key={`${l.product.id}-${l.variant.colour}`}
                l={l}
                delay={(i % 4) * 70}
                priority={i < 4}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
