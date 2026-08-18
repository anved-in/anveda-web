import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import {
  collections,
  collectionBySlug,
  productsIn,
  imgSrc,
} from "@/lib/catalog";
import { asset } from "@/lib/site";
import ProductCard from "@/components/ProductCard";

// Static export needs the full list of pages up front.
export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) return { title: "Not found" };
  return { title: c.name, description: c.blurb };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) notFound();

  const items = productsIn(slug);
  const idx = collections.findIndex((x) => x.slug === slug);
  const next = collections[(idx + 1) % collections.length];

  return (
    <>
      {/* Collection hero: the cover photo carries the mood, the story explains
          why this collection exists at all. */}
      <section className="on-dark relative flex min-h-[46svh] items-end overflow-hidden bg-espresso md:min-h-[56svh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(imgSrc(c.cover))}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(24,21,19,.55) 0%, rgba(24,21,19,.35) 40%, rgba(24,21,19,.9) 100%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-10 pt-16 sm:px-6 md:pb-14">
          <nav className="mb-4 text-[11.5px] uppercase tracking-[0.16em] text-[#b3aca4]">
            <Link href="/collections" className="hover:text-gold">
              Collections
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gold">{c.name}</span>
          </nav>
          <h1 className="max-w-[16ch] font-display text-[clamp(32px,5.4vw,64px)] text-[#f7f2ec]">
            {c.name}
          </h1>
          <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-[#d8d1c8]">
            {c.story}
          </p>
          <div className="mt-5 text-[11.5px] uppercase tracking-[0.18em] text-gold">
            {items.length} {items.length === 1 ? "design" : "designs"}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {items.map((p, i) => (
              <ProductCard
                key={p.id}
                p={p}
                delay={(i % 4) * 70}
                priority={i < 4}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Next collection: keeps browsing going instead of dead-ending. */}
      <section className="border-t border-line bg-cream-2 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-6">
          <div>
            <span className="eyebrow">Next collection</span>
            <h2 className="mt-2.5 font-display text-[clamp(24px,3vw,38px)]">
              {next.name}
            </h2>
            <p className="mt-2 max-w-[52ch] text-[14.5px] text-ink-soft">
              {next.blurb}
            </p>
          </div>
          <Link
            href={`/collections/${next.slug}`}
            className="border border-ink px-8 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-cream"
          >
            Explore
          </Link>
        </div>
      </section>
    </>
  );
}
