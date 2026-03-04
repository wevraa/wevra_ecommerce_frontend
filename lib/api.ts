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

export interface ApiProductMedia {
  id: string;
  productId: string;
  url: string;
  type: string;
  alt: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProductCollectionEntry {
  id: string;
  collectionId: string;
  productId: string;
  createdAt: string;
  collection: {
    id: string;
    title: string;
  };
}

export interface ApiProduct {
  id: string;
  title: string;
  productDescription: string | null;
  productDetails: string | null;
  fitAndFabric: string | null;
  shippingAndReturns: string | null;
  status: string;
  publishOnlineStore: boolean;
  publishPOS: boolean;
  mrp: string | null;
  compareAtPrice: string | null;
  discountType: string | null;
  discountValue: string | null;
  finalPrice: string | null;
  inventoryTracked: boolean;
  quantity: number;
  sku: string | null;
  barcode: string | null;
  shopLocation: string | null;
  allowOutOfStockSales: boolean;
  isPhysicalProduct: boolean;
  packageType: string | null;
  weight: string | null;
  weightUnit: string | null;
  countryOfOrigin: string | null;
  hsCode: string | null;
  categoryId: string | null;
  vendorId: string | null;
  productType: string;
  themeTemplate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: { id: string; name: string } | null;
  vendor: { id: string; companyName: string } | null;
  media: ApiProductMedia[];
  collections: ApiProductCollectionEntry[];
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

export interface ApiCollectionListItem {
  id: string;
  title: string;
  image?: string | null;
  thumbnailImage?: string | null;
  [key: string]: unknown;
}

export interface ApiCollectionDetail {
  id: string;
  title: string;
  image?: string | null;
  // products shape for /collections/:id – array of { product: { ... } }
  products?: unknown;
  [key: string]: unknown;
}

export async function getCollections(): Promise<ApiCollectionListItem[]> {
  if (!API_BASE) {
    return [];
  }
  try {
    const res = await fetch(`${API_BASE}/v1/collections`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as ApiCollectionListItem[]) : [];
  } catch {
    return [];
  }
}

export async function getCollectionById(id: string): Promise<ApiCollectionDetail | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/v1/collections/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as ApiCollectionDetail;
  } catch {
    return null;
  }
}

export async function getProducts(): Promise<ApiProduct[]> {
  if (!API_BASE) {
    return [];
  }
  try {
    const res = await fetch(`${API_BASE}/v1/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as ApiProduct[]) : [];
  } catch {
    return [];
  }
}

export async function getProductById(id: string): Promise<ApiProduct | null> {
  if (!API_BASE) {
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}/v1/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as ApiProduct;
  } catch {
    return null;
  }
}

// Banners (hero carousel)
export interface ApiBanner {
  id: string;
  image?: string | null;
  url?: string | null;
  title?: string | null;
  alt?: string | null;
  [key: string]: unknown;
}

export async function getBanners(): Promise<ApiBanner[]> {
  if (!API_BASE) return [];
  try {
    const res = await fetch(`${API_BASE}/v1/banners`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as ApiBanner[]) : [];
  } catch {
    return [];
  }
}

// Reviews
export interface ApiReview {
  id: string;
  customerId: string;
  productId: string;
  rating: number;
  reviewText: string;
  status: string;
  customerImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string };
  product: { id: string; title: string };
}

export interface ApiReviewsResponse {
  data: ApiReview[];
  total: number;
  page: number;
  limit: number;
}

const REVIEWS_LIMIT = 10;

export async function getReviews(limit: number = REVIEWS_LIMIT): Promise<ApiReview[]> {
  if (!API_BASE) return [];
  try {
    const res = await fetch(`${API_BASE}/v1/reviews?limit=${limit}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const response = json as ApiReviewsResponse;
    const list = response?.data ?? [];
    return Array.isArray(list) ? list.slice(0, limit) : [];
  } catch {
    return [];
  }
}