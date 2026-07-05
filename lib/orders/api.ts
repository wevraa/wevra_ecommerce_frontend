import { getAccessToken, tryRefreshFromStorage } from "@/lib/auth";
import { normalizeBillDetail, normalizeOrderDetail } from "./normalize";
import type { EcomBillDetail, EcomOrderDetail } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

export class OrdersApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "OrdersApiError";
  }
}

async function apiFetch<T>(
  basePath: string,
  path: string,
  options: { auth?: boolean } = {},
  retry = true
): Promise<T> {
  const auth = options.auth ?? true;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getAccessToken();
    if (!token) {
      throw new OrdersApiError("Please log in to continue", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${basePath}${path}`, {
    headers,
    cache: "no-store",
  });

  if (auth && res.status === 401 && retry) {
    const refreshed = await tryRefreshFromStorage();
    if (refreshed) return apiFetch<T>(basePath, path, options, false);
    throw new OrdersApiError("Session expired. Please log in again.", 401);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : `Request failed (${res.status})`;
    throw new OrdersApiError(msg, res.status);
  }

  return data as T;
}

async function ecomFetch<T>(path: string, retry = true): Promise<T> {
  return apiFetch<T>("/v1/ecom", path, { auth: true }, retry);
}

async function tailorFetch<T>(path: string, options: { auth?: boolean } = {}, retry = true): Promise<T> {
  return apiFetch<T>("/v1/tailor", path, options, retry);
}

async function publicTailorFetch<T>(path: string): Promise<T> {
  return tailorFetch<T>(path, { auth: false });
}

/** GET /api/v1/ecom/orders/:orderId */
export async function getEcomOrderDetail(orderId: string): Promise<EcomOrderDetail> {
  const data = await ecomFetch<unknown>(`/orders/${encodeURIComponent(orderId)}`);
  const order = normalizeOrderDetail(data);
  if (!order) {
    throw new OrdersApiError("Invalid order response", 500);
  }
  return order;
}

/** GET /api/v1/ecom/bills/:billId */
export async function getEcomBillDetail(billId: string): Promise<EcomBillDetail> {
  const data = await ecomFetch<unknown>(`/bills/${encodeURIComponent(billId)}`);
  const bill = normalizeBillDetail(data);
  if (!bill) {
    throw new OrdersApiError("Invalid bill response", 500);
  }
  return bill;
}

/** GET /api/v1/tailor/bills/:billId — public, no auth required */
export async function getTailorBillDetail(billId: string): Promise<EcomBillDetail> {
  const data = await publicTailorFetch<unknown>(`/bills/${encodeURIComponent(billId)}`);
  const bill = normalizeBillDetail(data);
  if (!bill) {
    throw new OrdersApiError("Invalid bill response", 500);
  }
  return bill;
}

/** GET /api/v1/tailor/orders/:orderId — public, no auth required */
export async function getTailorOrderDetail(orderId: string): Promise<EcomOrderDetail> {
  const data = await publicTailorFetch<unknown>(`/orders/${encodeURIComponent(orderId)}`);
  const order = normalizeOrderDetail(data);
  if (!order) {
    throw new OrdersApiError("Invalid order response", 500);
  }
  return order;
}
