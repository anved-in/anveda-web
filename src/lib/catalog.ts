import raw from "@/data/catalog.json";

export interface Collection {
  slug: string;
  name: string;
  blurb: string;
  story: string;
  cover: string;
  order: number;
}

export interface Product {
  id: string;
  collection: string;
  collectionName: string;
  name: string;
  colour: string;
  price: number;
  pieces: number;
  image: string;
  sizes: string[];
  blurb: string;
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

/** Image path for a product photo living in /public/img/products. */
export const imgSrc = (file: string): string => `/img/products/${file}`;

/** Prices are whole rupees; format them the way an Indian customer expects. */
export const inr = (n: number): string =>
  "₹" + Math.round(n).toLocaleString("en-IN");

/**
 * Other pieces to show on a product page: same collection first (they stack
 * together), topped up from elsewhere so the row is never half empty.
 */
export const related = (p: Product, n = 4): Product[] => {
  const same = products.filter(
    (x) => x.collection === p.collection && x.id !== p.id,
  );
  const rest = products.filter(
    (x) => x.collection !== p.collection && x.id !== p.id,
  );
  return [...same, ...rest].slice(0, n);
};

/** Bangle sizes, in inches of inner diameter, with a plain-language note. */
export const SIZE_GUIDE: { size: string; label: string; cm: string }[] = [
  { size: "2.2", label: "Petite", cm: "5.6 cm" },
  { size: "2.4", label: "Small", cm: "6.1 cm" },
  { size: "2.6", label: "Regular", cm: "6.5 cm" },
  { size: "2.8", label: "Medium", cm: "7.0 cm" },
];
