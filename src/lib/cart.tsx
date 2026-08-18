"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { productById, type Product } from "./catalog";

/**
 * A line is a product AT a size — the same design in two sizes is two lines,
 * because that is how it gets picked and packed.
 */
export interface Line {
  id: string;
  size: string;
  qty: number;
}

interface CartCtx {
  lines: Line[];
  /** Hydration guard: false until localStorage has been read on the client. */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (id: string, size: string, qty?: number) => void;
  setQty: (id: string, size: string, qty: number) => void;
  remove: (id: string, size: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "anveda.cart.v1";

const keyOf = (id: string, size: string) => `${id}__${size}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  // Read once on mount. Server-rendered HTML must not depend on this, or the
  // markup mismatches and React discards it — hence the `ready` flag.
  //
  // The read is deferred to a microtask so the effect does not call setState
  // synchronously during commit (which would cascade an extra render pass on
  // every mount). Correctness is unaffected: nothing renders cart contents
  // until `ready` flips.
  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      let restored: Line[] = [];
      try {
        const s = localStorage.getItem(KEY);
        if (s) {
          const parsed: unknown = JSON.parse(s);
          if (Array.isArray(parsed)) {
            // Drop anything that no longer exists in the catalog, so a stale
            // cart from an older deploy cannot crash the page.
            restored = parsed.filter(
              (l): l is Line =>
                !!l &&
                typeof l === "object" &&
                typeof (l as Line).id === "string" &&
                typeof (l as Line).size === "string" &&
                Number.isFinite((l as Line).qty) &&
                !!productById((l as Line).id),
            );
          }
        }
      } catch {
        /* corrupt storage is not worth breaking the site over */
      }
      if (restored.length) setLines(restored);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* private mode / quota — the cart still works for this session */
    }
  }, [lines, ready]);

  const add = useCallback((id: string, size: string, qty = 1) => {
    setLines((cur) => {
      const i = cur.findIndex((l) => keyOf(l.id, l.size) === keyOf(id, size));
      if (i === -1) return [...cur, { id, size, qty }];
      const next = [...cur];
      next[i] = { ...next[i], qty: Math.min(99, next[i].qty + qty) };
      return next;
    });
  }, []);

  const setQty = useCallback((id: string, size: string, qty: number) => {
    setLines((cur) =>
      qty <= 0
        ? cur.filter((l) => keyOf(l.id, l.size) !== keyOf(id, size))
        : cur.map((l) =>
            keyOf(l.id, l.size) === keyOf(id, size)
              ? { ...l, qty: Math.min(99, qty) }
              : l,
          ),
    );
  }, []);

  const remove = useCallback((id: string, size: string) => {
    setLines((cur) => cur.filter((l) => keyOf(l.id, l.size) !== keyOf(id, size)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  const subtotal = useMemo(
    () =>
      lines.reduce((n, l) => {
        const p = productById(l.id);
        return n + (p ? p.price * l.qty : 0);
      }, 0),
    [lines],
  );

  const value = useMemo(
    () => ({ lines, ready, count, subtotal, add, setQty, remove, clear, open, setOpen }),
    [lines, ready, count, subtotal, add, setQty, remove, clear, open],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
}

/** Join a cart line back to its product record for display. */
export const lineProduct = (l: Line): Product | undefined => productById(l.id);
