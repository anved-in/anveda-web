import Link from "@/components/Link";
import { collections, products, imgSrc } from "@/lib/catalog";
import { asset, SITE } from "@/lib/site";
import ProductCard from "@/components/ProductCard";

// One photo per collection makes a varied, non-repeating lookbook rail.
const lookbook = collections.map((c) => {
  const p = products.find((x) => x.collection === c.slug && x.image !== c.cover);
  return p ?? products.find((x) => x.collection === c.slug)!;
});

// Bestsellers: one from each of the first eight collections, so the grid reads
// as a range rather than eight variations of the same bangle.
const featured = collections.slice(0, 8).map(
  (c) => products.find((p) => p.collection === c.slug)!,
);

const hero = products.find((p) => p.collection === "kashmiri-bangles") ?? products[0];

export default function Home() {
  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="on-dark relative -mt-[72px] flex min-h-[88svh] items-end overflow-hidden bg-espresso pt-[72px] md:-mt-[76px] md:pt-[76px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(imgSrc(hero.image))}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-50"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(24,21,19,.74) 0%, rgba(24,21,19,.3) 34%, rgba(24,21,19,.88) 100%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-14 sm:px-6 md:pb-24">
          <span className="eyebrow">Est. Karnataka · India</span>
          <h1 className="mt-4 max-w-[15ch] font-display text-[clamp(44px,8.2vw,104px)] text-[#f7f2ec]">
            Bangles that carry{" "}
            <span className="block text-gold">a little tradition.</span>
          </h1>
          <p className="mt-5 max-w-[46ch] text-[clamp(15px,1.35vw,18px)] leading-relaxed text-[#d8d1c8]">
            Glass, kundan and antique bangles — chosen one batch at a time, for
            the weddings, the festivals and the ordinary Tuesdays that deserve
            them too.
          </p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <Link
              href="/collections"
              className="bg-cream px-8 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-white"
            >
              Shop the collection
            </Link>
            <Link
              href="/about"
              className="border border-cream/50 px-8 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-cream transition-colors hover:border-cream hover:bg-cream hover:text-espresso"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- values */}
      <div className="flex flex-wrap border-b border-line">
        {[
          ["Handpicked", "Every batch chosen by hand"],
          [`${products.length} Designs`, `Across ${collections.length} collections`],
          ["All India Delivery", "Carefully padded, safely packed"],
          ["Secure Payments", "UPI, cards and netbanking"],
        ].map(([t, d], i) => (
          <div
            key={t}
            className={[
              "flex-1 basis-1/2 border-line px-4 py-6 text-center md:basis-0 md:px-6 md:py-8",
              i < 3 ? "md:border-r" : "",
              i % 2 === 0 ? "border-r" : "",
              i < 2 ? "border-b md:border-b-0" : "",
            ].join(" ")}
          >
            <div className="text-[12px] font-bold uppercase tracking-[0.16em]">{t}</div>
            <div className="mt-1.5 text-[13px] text-ink-soft">{d}</div>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------- collections */}
      <section className="px-5 py-16 sm:px-6 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-5">
            <div>
              <span className="eyebrow">Browse</span>
              <h2 className="mt-3 font-display text-[clamp(28px,3.6vw,46px)]">
                Collections
              </h2>
              <p className="mt-3 max-w-[52ch] text-[15px] text-ink-soft">
                From everyday glass to the heavier antique and kundan pieces kept
                for the big days.
              </p>
            </div>
            <Link
              href="/collections"
              className="border-b border-current pb-1 text-[11.5px] font-bold uppercase tracking-[0.2em]"
            >
              View all
            </Link>
          </div>

          <div className="flex flex-wrap -m-2">
            {collections.slice(0, 5).map((c, i) => (
              <div
                key={c.slug}
                // 5 tiles must tile a rectangle: a half-width lead beside two
                // quarters, then two halves. The previous 1/2 + 4x(1/4) left a
                // half-row of dead space on the second line.
                className={[
                  "reveal p-2",
                  i === 0
                    ? "w-full md:w-1/2"
                    : i <= 2
                      ? "w-1/2 md:w-1/4"
                      : "w-1/2 md:w-1/2",
                ].join(" ")}
                data-d={i * 80}
              >
                <Link
                  href={`/collections/${c.slug}`}
                  className="group relative block overflow-hidden bg-espresso-2"
                >
                  <div className={i === 0 ? "aspect-[3/2]" : i <= 2 ? "aspect-[3/4]" : "aspect-[3/2]"}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset(imgSrc(c.cover))}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(24,21,19,0) 38%, rgba(24,21,19,.84) 100%)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-cream md:p-6">
                    <h3 className="font-display text-[clamp(19px,2vw,27px)]">{c.name}</h3>
                    <div className="mt-1 text-[11.5px] uppercase tracking-[0.18em] text-gold">
                      {products.filter((p) => p.collection === c.slug).length} designs
                    </div>
                    <span className="mt-3 inline-block border-b border-gold pb-0.5 text-[11.5px] font-bold uppercase tracking-[0.18em] transition-colors group-hover:text-gold">
                      Explore
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ bestsellers */}
      <section className="bg-cream-2 px-5 py-16 sm:px-6 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-5">
            <div>
              <span className="eyebrow">Most loved</span>
              <h2 className="mt-3 font-display text-[clamp(28px,3.6vw,46px)]">
                Signature designs
              </h2>
              <p className="mt-3 max-w-[52ch] text-[15px] text-ink-soft">
                The ones that leave us fastest — and come back by request.
              </p>
            </div>
            <Link
              href="/collections"
              className="border-b border-current pb-1 text-[11.5px] font-bold uppercase tracking-[0.2em]"
            >
              Shop all designs
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6">
            {featured.map((p, i) => (
              <ProductCard key={p.id} p={p} delay={(i % 4) * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- story */}
      <section className="px-5 py-16 sm:px-6 md:py-28">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-y-8">
          <div className="reveal relative w-full md:w-1/2 md:pr-10">
            <div className="relative">
              <span
                className="absolute -left-3 -top-3 bottom-8 right-8 border border-gold"
                aria-hidden="true"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(imgSrc(products[0].image))}
                alt="ANVEDA bangles"
                className="relative aspect-[4/5] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="reveal w-full md:w-1/2" data-d={120}>
            <span className="eyebrow">Our story</span>
            <h2 className="mt-4 font-display text-[clamp(30px,3.8vw,50px)]">
              Small batches,
              <br />
              chosen by hand.
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-soft">
              <p>
                ANVEDA began the way most good things do at home — with a tray of
                bangles on a dining table and far too many opinions about which
                green was the right green.
              </p>
              <p>
                We still work that way. Nothing is mass-ordered from a catalogue
                photo. Each batch is picked in person, checked piece by piece, and
                packed with enough padding to survive Indian post.
              </p>
            </div>
            <Link
              href="/about"
              className="mt-7 inline-block border border-ink px-7 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-cream"
            >
              Read our story
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- lookbook */}
      <section className="on-dark bg-espresso py-16 md:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6">
          <div className="reveal mb-9 flex flex-wrap items-end justify-between gap-5 border-b border-gold/25 pb-5">
            <div>
              <span className="eyebrow">Lookbook</span>
              <h2 className="mt-3 font-display text-[clamp(28px,3.6vw,46px)] text-[#f7f2ec]">
                In colour
              </h2>
              <p className="mt-3 max-w-[52ch] text-[15px] text-[#b3aca4]">
                Swipe through the shades currently on our shelf.
              </p>
            </div>
            <Link
              href="/collections"
              className="border-b border-current pb-1 text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#b3aca4]"
            >
              See the full range
            </Link>
          </div>
        </div>
        {/* Full-bleed rail so it reads as scrollable past the screen edge. */}
        <div className="no-bar flex snap-x snap-mandatory overflow-x-auto px-5 sm:px-6">
          <div className="mx-auto flex max-w-[1320px] gap-3.5">
            {lookbook.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group w-[230px] shrink-0 snap-start sm:w-[280px]"
              >
                <div className="aspect-[4/5] overflow-hidden bg-espresso-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(imgSrc(p.image))}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="mt-3 text-[12.5px] text-[#b3aca4]">{p.collectionName}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- CTA */}
      <section className="on-dark border-t border-gold/20 bg-espresso px-5 py-16 text-center sm:px-6 md:py-24">
        <div className="reveal mx-auto max-w-[1320px]">
          <span className="eyebrow">Ready when you are</span>
          <h2 className="mt-4 font-display text-[clamp(30px,4.4vw,58px)] text-[#f7f2ec]">
            Pick your colours.
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-[15px] text-[#b3aca4]">
            Browse the full range, choose your shades and sizes, and check out
            securely with UPI, card or netbanking.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/collections"
              className="bg-cream px-8 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-white"
            >
              Shop all designs
            </Link>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-cream/50 px-8 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-cream transition-colors hover:border-cream hover:bg-cream hover:text-espresso"
            >
              Message us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
