"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import Announce from "./Announce";
import { useCart } from "@/lib/cart";
import { collections } from "@/lib/catalog";

const NAV = [
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "Our Story" },
  { href: "/sizing", label: "Sizing" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const path = usePathname();
  const { count, setOpen, ready } = useCart();
  const [stuck, setStuck] = useState(false);

  // The reference storefront keeps a solid white header on every page —
  // there is no transparent-over-hero state to manage. `stuck` is still
  // tracked, but only to drop a shadow once the page has scrolled.

  useEffect(() => {
    let tick = false;
    const upd = () => {
      setStuck(window.scrollY > 60);
      tick = false;
    };
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(upd);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Deferred rather than called inline: a synchronous setState here cascades
    // an extra render on mount, and reading scrollY after layout also picks up
    // a browser-restored scroll position correctly on reload.
    const first = requestAnimationFrame(upd);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the mobile menu on navigation, or it stays open over the new page.
  // Derived from the path rather than synced to it with an effect: storing the
  // path the menu was opened on means a navigation closes it during render,
  // with no extra commit and no flash of the old menu over the new page.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menu = menuPath === path;
  const setMenu = (v: boolean | ((cur: boolean) => boolean)) => {
    const next = typeof v === "function" ? v(menu) : v;
    setMenuPath(next ? path : null);
  };

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);


  return (
    <header className="sticky top-0 z-50 bg-white text-ink">
      <Announce />

      <div
        className={[
          "border-b border-line transition-shadow duration-300",
          stuck ? "shadow-[0_1px_12px_rgba(0,0,0,0.07)]" : "",
        ].join(" ")}
      >
        {/* Row 1 — utility row: menu / centred logo / bag, as the reference. */}
        <div className="mx-auto flex h-[64px] max-w-[1320px] items-center px-5 sm:px-6 md:h-[84px]">
          <div className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              className="-ml-2.5 p-2.5 md:hidden"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                {menu ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
            <Link
              href="/contact"
              className="hidden text-[11.5px] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-maroon md:block"
            >
              Contact
            </Link>
          </div>

          <Link
            href="/"
            aria-label="ANVEDA home"
            className="h-[21px] shrink-0 md:h-[26px]"
          >
            <Logo />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1">
            <Link
              href="/sizing"
              className="hidden text-[11.5px] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-maroon md:block"
            >
              Sizing
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative -mr-2.5 p-2.5"
              aria-label={`Open bag${ready && count ? `, ${count} items` : ""}`}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M6 7h12l1 13H5L6 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              {/* suppressHydrationWarning: the count comes from localStorage, so
                  it is legitimately different on server and first client paint. */}
              {ready && count > 0 && (
                <span
                  suppressHydrationWarning
                  className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-bold text-white"
                >
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2 — the category bar. The reference lists its collections
            straight across the header; ours are generated from the catalogue
            so the bar can never fall out of step with what is in stock.
            Eleven family names are too wide for one row at 1440px, so the bar
            shows the first seven and rolls the rest into a "More" dropdown
            rather than clipping them off both edges. */}
        <nav className="hidden border-t border-line md:block">
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-6 gap-y-1 px-6 py-3">
            <Link
              href="/collections"
              className="whitespace-nowrap py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-maroon transition-opacity hover:opacity-70"
            >
              All
            </Link>
            {collections.slice(0, 7).map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className={[
                  "whitespace-nowrap py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-maroon",
                  path === `/collections/${c.slug}` ? "text-maroon" : "",
                ].join(" ")}
              >
                {c.name}
              </Link>
            ))}

            {collections.length > 7 && (
              <div className="group relative">
                <button
                  type="button"
                  className="whitespace-nowrap py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors group-hover:text-maroon"
                  aria-haspopup="true"
                >
                  More +
                </button>
                {/* CSS-only dropdown: opens on hover and on keyboard focus
                    within, so it is reachable without a pointer. */}
                <div className="invisible absolute left-1/2 top-full z-50 w-[240px] -translate-x-1/2 border border-line bg-white py-2 opacity-0 shadow-[0_8px_28px_rgba(0,0,0,0.1)] transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {collections.slice(7).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/collections/${c.slug}`}
                      className="block px-4 py-2 text-[12px] font-semibold transition-colors hover:bg-cream-2 hover:text-maroon"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/about"
              className="whitespace-nowrap py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-maroon"
            >
              Our Story
            </Link>
          </div>
        </nav>
      </div>

      {menu && (
        <nav className="max-h-[calc(100vh-140px)] overflow-y-auto border-t border-line bg-white px-5 pb-8 pt-2 md:hidden">
          <div className="eyebrow pb-2 pt-3">Shop</div>
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="block border-b border-line py-3 text-[13.5px] font-semibold"
            >
              {c.name}
            </Link>
          ))}
          <div className="eyebrow pb-2 pt-6">More</div>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block border-b border-line py-3 text-[13.5px] font-semibold"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/collections"
            className="mt-6 block bg-ink px-5 py-3.5 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-white"
          >
            Shop all
          </Link>
        </nav>
      )}
    </header>
  );
}
