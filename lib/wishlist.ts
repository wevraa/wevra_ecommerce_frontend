import { getAccessToken, tryRefreshFromStorage } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

export interface WishlistProductMedia {
  id: string;
  url: string;
  type?: string;
  alt?: string | null;
  order?: number;
  [key: string]: unknown;
}

export interface WishlistItemProduct {
  id: string;
  title: string;
  finalPrice: string | null;
  mrp: string | null;
  compareAtPrice: string | null;
  status: string;
  media: WishlistProductMedia[];
  [key: string]: unknown;
}

export interface WishlistItem {
  id?: string;
  productId?: string;
  createdAt?: string;
  product: WishlistItemProduct;
  [key: string]: unknown;
}

function normalizeWishlistRows(raw: unknown[]): WishlistItem[] {
  const out: WishlistItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    if (o.product && typeof o.product === "object") {
      out.push(row as WishlistItem);
      continue;
    }
    if (typeof o.id === "string" && typeof o.title === "string") {
      out.push({
        product: {
          id: o.id,
          title: o.title,
          finalPrice: (o.finalPrice as string) ?? null,
          mrp: (o.mrp as string) ?? null,
          compareAtPrice: (o.compareAtPrice as string) ?? null,
          status: String(o.status ?? "ACTIVE"),
          media: Array.isArray(o.media) ? (o.media as WishlistProductMedia[]) : [],
        },
      });
    }
  }
  return out;
}

function parseWishlistJson(json: unknown): WishlistItem[] {
  let raw: unknown[] = [];
  if (Array.isArray(json)) raw = json;
  else {
    const data = (json as { data?: unknown })?.data;
    if (Array.isArray(data)) raw = data;
  }
  return normalizeWishlistRows(raw);
}

async function fetchWithAuth(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  let token = getAccessToken();
  const run = (t: string | null) => {
    const h = new Headers(headers);
    if (t) h.set("Authorization", `Bearer ${t}`);
    return fetch(url, { ...init, headers: h });
  };

  let res = await run(token);
  if (res.status === 401) {
    await tryRefreshFromStorage();
    token = getAccessToken();
    res = await run(token);
  }
  return res;
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const res = await fetchWithAuth("/v1/wishlist", { method: "GET" });
  if (!res.ok) return [];
  const json = await res.json().catch(() => null);
  return parseWishlistJson(json);
}

export async function addToWishlist(productId: string): Promise<{ ok: boolean; alreadyAdded?: boolean }> {
  const res = await fetchWithAuth("/v1/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
  if (res.status === 409) return { ok: true, alreadyAdded: true };
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof (err as { message?: string }).message === "string"
      ? (err as { message: string }).message
      : "Could not add to wishlist";
    throw new Error(msg);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("wishlist-changed"));
  }
  return { ok: true };
}

export async function removeFromWishlist(productId: string): Promise<boolean> {
  const res = await fetchWithAuth(`/v1/wishlist/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
  if (res.status === 404) return false;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof (err as { message?: string }).message === "string"
      ? (err as { message: string }).message
      : "Could not remove from wishlist";
    throw new Error(msg);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("wishlist-changed"));
  }
  return true;
}

export function productIdsInWishlist(items: WishlistItem[]): Set<string> {
  const set = new Set<string>();
  for (const row of items) {
    const id = row.product?.id ?? row.productId;
    if (id) set.add(id);
  }
  return set;
}
