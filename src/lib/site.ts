/**
 * Single source of truth for the things that differ between environments or
 * that the owner may want to change without touching components.
 *
 * BASE_PATH: GitHub Pages serves a project site from /<repo>, so every internal
 * link and asset must be prefixed. Next handles this via `basePath` in
 * next.config, but raw <img src> and manual hrefs need `asset()`.
 */
export const SITE = {
  name: "ANVEDA",
  tagline: "Handpicked Glass Bangles",
  description:
    "Handpicked glass, antique and kundan bangles. Chosen in small batches, packed with care, delivered across India.",
  /** The owner's WhatsApp number, digits only, with country code. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "918217544994",
  email: "anveda.in@gmail.com",
  instagram: "https://www.instagram.com/anveda.in/",
  /** Free shipping at or above this order value, in rupees. */
  freeShippingAbove: 999,
  shippingFlat: 79,
} as const;

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a /public asset path for the deployed base path. */
export const asset = (p: string): string =>
  `${BASE_PATH}${p.startsWith("/") ? p : `/${p}`}`;

export const waLink = (text: string): string =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
