"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/Link";
import { asset } from "@/lib/site";
import { imgSrc, listingTitle, variantPrice } from "@/lib/catalog";
import Price from "@/components/Price";
import type { ResolvedReel } from "@/lib/reels";

/**
 * Vertical reel feed, built to feel like Instagram Reels / YouTube Shorts.
 *
 * The mechanics that make it feel right, rather than like a list of videos:
 *  - CSS scroll-snap on a full-height container, so one reel always fills the
 *    screen and a flick lands cleanly on the next.
 *  - An IntersectionObserver plays whichever reel is mostly on screen and
 *    pauses every other one. Several playing at once is the biggest giveaway
 *    that a feed is homemade.
 *  - Muted autoplay, because every browser blocks autoplay with sound. Tapping
 *    unmutes, which is the same bargain Instagram makes.
 *  - loop, playsInline and preload="metadata": inline stops iOS opening its
 *    own fullscreen player, and metadata keeps a long feed light.
 */
export default function ReelFeed({ items }: { items: ResolvedReel[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const [muted, setMuted] = useState(true);
  const [active, setActive] = useState(0);

  // Play the reel in view; pause every other one.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const i = Number((en.target as HTMLElement).dataset.i);
          const v = vids.current[i];
          if (en.isIntersecting && en.intersectionRatio > 0.6) {
            setActive(i);
            // play() rejects when the browser blocks it; swallow rather than
            // throw an unhandled rejection.
            if (v) void v.play().catch(() => {});
          } else if (v) {
            v.pause();
          }
        });
      },
      { threshold: [0, 0.6, 1] },
    );

    const slides = wrap.current?.querySelectorAll("[data-i]") ?? [];
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items.length]);

  const go = useCallback(
    (d: number) => {
      const next = Math.min(items.length - 1, Math.max(0, active + d));
      wrap.current
        ?.querySelector(`[data-i="${next}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [active, items.length],
  );

  // Keyboard paging, so the feed works without a touchscreen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-[28px]">Reels are coming</h1>
        <p className="mt-3 max-w-[42ch] text-[14px] text-ink-soft">
          We are filming the new batches now. In the meantime, everything we
          carry is in the shop.
        </p>
        <Link
          href="/collections"
          className="mt-6 border border-ink px-8 py-3.5 text-[11.5px] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-white"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={wrap}
      className="no-bar h-[calc(100dvh-56px-58px)] snap-y snap-mandatory overflow-y-auto overscroll-contain bg-black md:h-[calc(100dvh-64px)]"
      aria-label="Reels"
    >
      {items.map((r, i) => {
        const v =
          r.product?.variants.find((x) => x.colour === r.colour) ??
          r.product?.variants[0];

        return (
          <section
            key={r.id}
            data-i={i}
            className="relative flex h-full w-full snap-start snap-always items-center justify-center overflow-hidden"
          >
            {/* Blurred fill behind the 9:16 frame, so a portrait video never
                sits on bare black on a wide screen — the Shorts treatment. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(r.cover)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
            />

            <div className="relative flex h-full w-full max-w-[min(100%,calc((100dvh-114px)*9/16))] items-center justify-center">
              {r.playable ? (
                <video
                  ref={(el) => {
                    vids.current[i] = el;
                  }}
                  src={asset(r.video as string)}
                  poster={asset(r.cover)}
                  className="h-full w-full object-cover"
                  muted={muted}
                  loop
                  playsInline
                  preload={i < 2 ? "auto" : "metadata"}
                  onClick={() => setMuted((m) => !m)}
                />
              ) : (
                // Not uploaded yet: show the cover, link out to the real reel.
                <a
                  href={r.instagram ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(r.cover)}
                    alt={r.title}
                    className="h-full w-full object-cover"
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/25 transition-colors group-hover:bg-black/35">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                      </svg>
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      Watch on Instagram
                    </span>
                  </span>
                </a>
              )}

              {/* ------------------------------------------ overlay: caption */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3.5 pb-4">
                <h2 className="font-display text-[19px] text-white">{r.title}</h2>
                {r.caption && (
                  <p className="mt-1 max-w-[38ch] text-[13px] leading-snug text-white/80">
                    {r.caption}
                  </p>
                )}

                {/* --------------------------------------- overlay: buy this */}
                {r.product && v && (
                  <div className="pointer-events-auto mt-3 flex items-center gap-3 rounded-lg bg-white/95 p-2.5 backdrop-blur">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset(imgSrc(v.image))}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-semibold">
                        {listingTitle(r.product, v)}
                      </div>
                      <Price price={variantPrice(r.product, v)} size="sm" />
                    </div>
                    <Link
                      href={r.href}
                      className="shrink-0 bg-ink px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-maroon"
                    >
                      Buy this
                    </Link>
                  </div>
                )}
              </div>

              {/* -------------------------------------- overlay: mute toggle */}
              {r.playable && (
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M5 9v6h4l5 4V5L9 9H5Z" />
                    {muted ? (
                      <path d="M17 9l4 6M21 9l-4 6" />
                    ) : (
                      <path d="M17.5 8.5a5 5 0 0 1 0 7" />
                    )}
                  </svg>
                </button>
              )}
            </div>

            {/* Progress pips, so the length of the feed is legible. */}
            <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 flex-col gap-1.5 md:flex">
              {items.map((x, k) => (
                <span
                  key={x.id}
                  className={[
                    "w-[3px] rounded-full transition-all",
                    k === active ? "h-5 bg-white" : "h-2 bg-white/40",
                  ].join(" ")}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
