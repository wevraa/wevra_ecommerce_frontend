import { getAccessToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

export interface ApiProfileAddress {
  line: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ApiProfile {
  id: string;
  email: string | null;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: ApiProfileAddress | null;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getProfile(): Promise<ApiProfile> {
  const res = await fetch(`${API_BASE}/v1/ecom/profile`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Failed to load profile";
    throw new Error(msg);
  }
  return data as ApiProfile;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<ApiProfile> {
  const res = await fetch(`${API_BASE}/v1/ecom/profile`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Failed to update profile";
    throw new Error(msg);
  }
  return data as ApiProfile;
}
