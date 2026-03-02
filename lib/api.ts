const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export interface ApiCategory {
  id: string;
  name: string;
  headline: string | null;
  shortDescription: string | null;
  status: string;
  thumbnailImage: string | null;
  createdAt: string;
  updatedAt: string;
  products: unknown[];
}

export async function getCategories(): Promise<ApiCategory[]> {
  if (!API_BASE) {
    return [];
  }
  try {
    const res = await fetch(`${API_BASE}/v1/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getCollections(): Promise<ApiCategory[]> {
  if (!API_BASE) {
    return [];
  }
  try {
    const res = await fetch(`${API_BASE}/v1/collections`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}


export async function getProducts(): Promise<ApiCategory[]> {
  if (!API_BASE) {
    return [];
  }
  try {
    const res = await fetch(`${API_BASE}/v1/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}