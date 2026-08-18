"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { useCart } from "@/lib/cart";

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

  // Only the homepage has a dark full-bleed hero for the header to sit over.
  // Everywhere else the header is solid from the first pixel, or it would be
  // invisible cream-on-cream.
  const overHero = path === "/";

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

  const solid = stuck || !overHero || menu;

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-[background-color,color,border-color,box-shadow] duration-300",
        solid
          ? "bg-cream/95 text-ink border-b border-line backdrop-blur-md"
          : "text-cream border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-6 px-5 sm:px-6 md:h-[76px]">
        <Link href="/" aria-label="ANVEDA home" className="h-[19px] shrink-0">
          <Logo />
        </Link>

        <nav className="ml-auto hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="group relative py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em]"
            >
              {n.label}
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
          <Link
            href="/collections"
            className="border border-current px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-espresso hover:border-espresso hover:text-cream"
          >
            Shop
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-4 md:gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative p-2.5"
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
                className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center bg-ink px-1 text-[10px] font-bold text-cream"
              >
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            className="p-2.5 md:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              {menu ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {menu && (
        <nav className="border-t border-line bg-cream px-5 pb-6 pt-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block border-b border-line py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em]"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/collections"
            className="mt-5 block bg-espresso px-5 py-3.5 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-cream"
          >
            Shop all
          </Link>
        </nav>
      )}
    </header>
  );
}
