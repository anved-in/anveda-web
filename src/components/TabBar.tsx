"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

/**
 * Fixed bottom tab bar on mobile, as the reference storefront has. Phone-only
 * — on desktop the same destinations live in the header.
 */
const ICONS = {
  shop: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  home: <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.6 2.6 0 1 1 3.2 2.5c-.5.2-.7.6-.7 1.1v.4" />
      <circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none" />
    </>
  ),
  bag: (
    <>
      <path d="M6 7h12l1 13H5L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </>
  ),
} as const;

export default function TabBar() {
  const path = usePathname();
  const { count, setOpen, ready } = useCart();

  const items = [
    { href: "/collections", label: "Shop", icon: ICONS.shop },
    { href: "/", label: "Home", icon: ICONS.home },
    { href: "/contact", label: "Help", icon: ICONS.help },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Quick navigation"
    >
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={[
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[9.5px] uppercase tracking-[0.08em]",
            path === it.href ? "text-maroon" : "text-ink-soft",
          ].join(" ")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            {it.icon}
          </svg>
          {it.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[9.5px] uppercase tracking-[0.08em] text-ink-soft"
        aria-label={`Open bag${ready && count ? `, ${count} items` : ""}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          {ICONS.bag}
        </svg>
        Bag
        {ready && count > 0 && (
          <span
            suppressHydrationWarning
            className="absolute right-[22%] top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-maroon px-1 text-[9px] font-bold text-white"
          >
            {count}
          </span>
        )}
      </button>
    </nav>
  );
}
