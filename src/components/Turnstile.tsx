"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile — the only thing standing between the CRM's order
 * intake endpoint and a bot writing junk orders into the ledger. The
 * storefront is a static export on another origin, so it can hold no shared
 * secret; this token is what the Worker verifies instead.
 *
 * Renders nothing when no site key is configured, and the checkout treats a
 * missing token as "cannot place order" — failing closed on both ends.
 */

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onloadTurnstileCallback?: () => void;
  }
}

export default function Turnstile({ onToken }: { onToken: (t: string | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !box.current) return;

    const render = () => {
      if (!window.turnstile || !box.current || widget.current) return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => onToken(token),
        // A token is single-use and expires; clearing it forces the checkout
        // to wait for a fresh one rather than posting a stale one.
        "expired-callback": () => onToken(null),
        "error-callback": () => {
          setFailed(true);
          onToken(null);
        },
      });
    };

    if (window.turnstile) {
      render();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = render;
    s.onerror = () => setFailed(true);
    document.head.appendChild(s);
  }, [onToken]);

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <div className="mt-4">
      <div ref={box} />
      {failed && (
        <p className="mt-1 text-[12.5px] text-[#a33a2f]">
          The security check could not load. Please refresh, or message us on
          WhatsApp to place your order.
        </p>
      )}
    </div>
  );
}
