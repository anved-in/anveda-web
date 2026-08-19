import raw from "@/data/catalog.json";

export interface Collection {
  slug: string;
  name: string;
  blurb: string;
  story: string;
  cover: string;
  order: number;
}

/** One colourway of a product: its own photo, and a swatch hex when we know it. */
export interface Variant {
  colour: string;
  image: string;
  /** null when the shade has no single representative colour ("Assorted"). */
  hex: string | null;
}

export interface Product {
  id: string;
  collection: string;
  collectionName: string;
  name: string;
  price: number;
  pieces: number;
  sizes: string[];
  blurb: string;
  story: string;
  variants: Variant[];
  /** Lead photo — the first variant's image. */
  image: string;
}

const data = raw as { collections: Collection[]; products: Product[] };

export const collections: Collection[] = [...data.collections].sort(
  (a, b) => a.order - b.order,
);
export const products: Product[] = data.products;

export const productsIn = (slug: string): Product[] =>
  products.filter((p) => p.collection === slug);

export const collectionBySlug = (slug: string): Collection | undefined =>
  collections.find((c) => c.slug === slug);

export const productById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);

/**
 * A single colourway, addressable on its own. Collection grids list these so a
 * shopper still browses by colour, but every one of them links to the same
 * product page with that colour preselected.
 */
export interface Listing {
  product: Product;
  variant: Variant;
  /** /product/<id>?c=<colour> — the product page reads `c` and preselects it. */
  href: string;
}

export const listingsIn = (slug: string): Listing[] =>
  productsIn(slug).flatMap((p) =>
    p.variants.map((v) => ({
      product: p,
      variant: v,
      href: `/product/${p.id}/?c=${encodeURIComponent(v.colour)}`,
    })),
  );

export const allListings = (): Listing[] =>
  products.flatMap((p) =>
    p.variants.map((v) => ({
      product: p,
      variant: v,
      href: `/product/${p.id}/?c=${encodeURIComponent(v.colour)}`,
    })),
  );

/** Image path for a product photo living in /public/img/products. */
export const imgSrc = (file: string): string => `/img/products/${file}`;

/** Prices are whole rupees; format them the way an Indian customer expects. */
export const inr = (n: number): string =>
  "₹" + Math.round(n).toLocaleString("en-IN");

/** Other products to show alongside this one. */
export const related = (p: Product, n = 4): Listing[] =>
  products
    .filter((x) => x.id !== p.id)
    .slice(0, n)
    .map((x) => ({
      product: x,
      variant: x.variants[0],
      href: `/product/${x.id}/`,
    }));

/** Bangle sizes, in inches of inner diameter, with a plain-language note. */
export const SIZE_GUIDE: { size: string; label: string; cm: string }[] = [
  { size: "2.2", label: "Petite", cm: "5.6 cm" },
  { size: "2.4", label: "Small", cm: "6.1 cm" },
  { size: "2.6", label: "Regular", cm: "6.5 cm" },
  { size: "2.8", label: "Medium", cm: "7.0 cm" },
];
