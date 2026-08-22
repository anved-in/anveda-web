"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { useCart } from "@/lib/cart";
import { collections } from "@/lib/catalog";

/** The reference keeps a short text nav on the left of a single header row. */
const NAV = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Category" },
  { href: "/reels", label: "Reels" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/sizing", label: "Sizing" },
];

/** Sub-route aware: /collections/kada and /product/x both light "Category". */
const isActive = (path: string, href: string): boolean => {
  if (href === "/") return path === "/";
  if (href === "/collections")
    return path.startsWith("/collections") || path.startsWith("/product");
  return path.startsWith(href);
};

export default function Header() {
  const path = usePathname();
  const { count, setOpen, ready } = useCart();

  // Close the mobile menu on navigation, or it stays open over the new page.
  // Derived from the path rather than synced with an effect: storing the path
  // the menu was opened on means a navigation closes it during render, with no
  // extra commit and no flash of the old menu over the new page.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menu = menuPath === path;
  const setMenu = (v: boolean | ((cur: boolean) => boolean)) => {
    const next = typeof v === "function" ? v(menu) : v;
    setMenuPath(next ? path : null);
  };

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  return (
    <header className="sticky top-0 z-50 bg-white text-ink">
      {/* One compact row, as the reference: text nav left, centred wordmark,
          icons right. No announcement bar and no second category row — the
          reference has neither, and both were making our header twice as tall
          as the one we are matching. */}
      <div className="border-b border-line">
        <div className="mx-auto flex h-[56px] max-w-[1320px] items-center px-4 sm:px-6 md:h-[64px]">
          <div className="flex flex-1 items-center gap-6">
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              className="-ml-2 p-2 md:hidden"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                {menu ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h14M3 18h18" />}
              </svg>
            </button>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={[
                  "hidden whitespace-nowrap text-[11px] uppercase tracking-[0.1em] transition-colors hover:text-maroon md:block",
                  isActive(path, n.href) ? "font-bold text-maroon" : "",
                ].join(" ")}
              >
                {n.label}
              </Link>
            ))}
          </div>

          <Link
            href="/"
            aria-label="ANVEDA home"
            className="h-[20px] shrink-0 md:h-[24px]"
          >
            <Logo />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-0.5">
            <a
              href="https://www.instagram.com/anveda.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden p-2 transition-colors hover:text-maroon md:block"
              aria-label="ANVEDA on Instagram"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* Desktop only: on a phone the fixed bottom tab bar already
                carries a bag button, and two of them on one screen was simply
                confusing. See <TabBar />. */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative -mr-2 hidden p-2 md:block"
              aria-label={`Open bag${ready && count ? `, ${count} items` : ""}`}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M6 7h12l1 13H5L6 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              {/* suppressHydrationWarning: the count comes from localStorage, so
                  it is legitimately different on server and first client paint. */}
              {ready && count > 0 && (
                <span
                  suppressHydrationWarning
                  className="absolute right-0 top-0 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-maroon px-1 text-[9.5px] font-bold text-white"
                >
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile category chips — the reference's scrolling pill row. Hidden on
          desktop, where the same collections are reachable from Category, and
          hidden on /reels, where the feed is meant to own the whole screen. */}
      <div
        className={[
          "border-b border-line md:hidden",
          path.startsWith("/reels") ? "hidden" : "",
        ].join(" ")}
      >
        <div className="no-bar flex gap-2 overflow-x-auto px-4 py-2.5">
          {collections.map((c) => {
            const on = path === `/collections/${c.slug}`;
            return (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className={[
                  "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                  on
                    ? "border-maroon bg-maroon text-white"
                    : "border-line-strong text-ink",
                ].join(" ")}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {menu && (
        <nav className="max-h-[calc(100dvh-120px)] overflow-y-auto border-b border-line bg-white px-4 pb-8 pt-3 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block border-b border-line py-3 text-[13px] uppercase tracking-[0.1em]"
            >
              {n.label}
            </Link>
          ))}
          <div className="pb-1 pt-5 text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
            Collections
          </div>
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="block border-b border-line py-3 text-[13px]"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
