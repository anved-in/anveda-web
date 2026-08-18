"use client";

import { useEffect } from "react";

/**
 * Marks the document as JS-capable and reveals .reveal elements as they enter
 * the viewport.
 *
 * Two details that matter and are easy to get wrong:
 *  - threshold 0, not a fraction. Any element TALLER than the viewport can
 *    never satisfy a fractional threshold, so it would stay hidden forever.
 *  - a bottom safety net: anything still unrevealed once the visitor nears the
 *    end of the page is shown outright. A decorative fade must never be able to
 *    withhold real content.
 */
export default function Reveal() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("js");

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          const d = Number(el.dataset.d ?? 0);
          window.setTimeout(() => el.classList.add("in"), d);
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px 10% 0px", threshold: 0 },
    );
    els.forEach((e) => io.observe(e));

    const onScroll = () => {
      if (window.innerHeight + window.scrollY < document.body.scrollHeight - 240)
        return;
      els.forEach((e) => e.classList.add("in"));
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
