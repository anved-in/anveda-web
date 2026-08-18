import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import {
  products,
  productById,
  related,
  imgSrc,
  inr,
  collectionBySlug,
} from "@/lib/catalog";
import { asset, SITE } from "@/lib/site";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = productById(id);
  if (!p) return { title: "Not found" };
  return {
    title: `${p.name} — ${p.collectionName}`,
    description: `${p.name} from the ANVEDA ${p.collectionName} collection. ${p.blurb}`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = productById(id);
  if (!p) notFound();

  const col = collectionBySlug(p.collection);
  const more = related(p, 4);

  return (
    <>
      <section className="px-5 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-[1320px]">
          <nav className="mb-6 text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
            <Link href="/collections" className="hover:text-ink">
              Collections
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/collections/${p.collection}`} className="hover:text-ink">
              {p.collectionName}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{p.name}</span>
          </nav>

          <div className="flex flex-wrap gap-y-8">
            <div className="w-full md:w-[55%] md:pr-10 lg:w-[58%]">
              <div className="aspect-square overflow-hidden bg-cream-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(imgSrc(p.image))}
                  alt={`${p.name} — ${p.collectionName}`}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>

            <div className="w-full md:w-[45%] lg:w-[42%]">
              <Link
                href={`/collections/${p.collection}`}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-deep"
              >
                {p.collectionName}
              </Link>
              <h1 className="mt-2.5 font-display text-[clamp(28px,3.6vw,44px)]">
                {p.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-[22px] font-semibold">{inr(p.price)}</span>
                {p.pieces > 1 && (
                  <span className="text-[13.5px] text-ink-soft">
                    for a set of {p.pieces}
                  </span>
                )}
              </div>

              <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
                {col?.story ?? p.blurb}
              </p>

              <ProductBuy p={p} />

              <dl className="mt-9 border-t border-line">
                {[
                  ["Material", p.collectionName.replace(" Bangles", "")],
                  ["In the set", p.pieces > 1 ? `${p.pieces} bangles` : "1 bangle"],
                  ["Sizes", p.sizes.join(" · ")],
                  [
                    "Delivery",
                    `All India · free above ${inr(SITE.freeShippingAbove)}`,
                  ],
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
                  Message us on WhatsApp and we will help you measure in under a
                  minute.
                </p>
                <a
                  href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
                    `Hi ANVEDA! I need help with sizing for "${p.name}" (${p.collectionName}).`,
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
        </div>
      </section>

      <section className="border-t border-line bg-cream-2 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="reveal mb-9 border-b border-line pb-5 font-display text-[clamp(24px,3vw,36px)]">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6">
            {more.map((r, i) => (
              <ProductCard key={r.id} p={r} delay={(i % 4) * 70} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
