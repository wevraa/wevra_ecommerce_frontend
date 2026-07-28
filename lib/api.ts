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

/** Single category (optional embedded products). */
export interface ApiCategoryDetail extends Omit<ApiCategory, "products"> {
  products?: unknown;
}

export async function getCategoryById(id: string): Promise<ApiCategoryDetail | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/v1/categories/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as ApiCategoryDetail;
  } catch {
    return null;
  }
}

/** Normalize category.products or collection-style { product } rows into full product list. */
export function normalizeCategoryProductsPayload(raw: unknown): ApiProduct[] {
  if (!Array.isArray(raw)) return [];
  const result: ApiProduct[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (o.product && typeof o.product === "object") {
      const p = o.product as ApiProduct;
      if (p?.id && p?.title) result.push(p);
      continue;
    }
    if (typeof o.id === "string" && typeof o.title === "string") {
      result.push(item as ApiProduct);
    }
  }
  return result;
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

// Tailors / Boutiques
const TAILORS_API =
  process.env.NEXT_PUBLIC_TAILORS_API_URL ?? `${API_BASE || "https://api.wevraa.in/api"}/v1/tailors`;

export interface ApiTailor {
  id: string;
  name: string;
  phone: string;
  email: string;
  experience: string;
  status: string;
  addressLine1: string;
  addressLine2: string | null;
  pincode: string;
  specializations: string[];
  hasGst: boolean;
  gstNumber: string | null;
  gstPercentage: string | null;
  hsnCode: string | null;
  categoryTags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getTailors(): Promise<ApiTailor[]> {
  try {
    const res = await fetch(TAILORS_API, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as ApiTailor[]) : [];
  } catch {
    return [];
  }
}

// Tailor categories (custom order types)
export interface ApiTailorCategory {
  id: string;
  name: string;
  description: string;
  status: string;
  sortOrder: number;
  parentId: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { children: number };
}

export interface ApiTailorCategoryChild {
  id: string;
  name: string;
  description: string;
  status: string;
  sortOrder: number;
}

export interface ApiTailorCategoryTreeNode extends ApiTailorCategory {
  children: ApiTailorCategoryChild[];
}

function tailorCategoriesBase(): string {
  return `${API_BASE || "https://api.wevraa.in/api"}/v1/tailor-categories`;
}

export async function getTailorCategories(): Promise<ApiTailorCategory[]> {
  try {
    const res = await fetch(tailorCategoriesBase(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? (data as ApiTailorCategory[]) : [];
    return list
      .filter((c) => c.status === "ACTIVE")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

export async function getTailorCategoriesTree(): Promise<ApiTailorCategoryTreeNode[]> {
  try {
    const res = await fetch(`${tailorCategoriesBase()}/tree`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? (data as ApiTailorCategoryTreeNode[]) : [];
    return list
      .filter((c) => c.status === "ACTIVE")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((node) => ({
        ...node,
        children: (node.children ?? [])
          .filter((child) => child.status === "ACTIVE")
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }));
  } catch {
    return [];
  }
}

// Measurement presets (size chips + measurement rows per order type)
export interface ApiMeasurementPresetRow {
  id: string;
  subcategoryId: string;
  presetId: string;
  name: string;
  value: string;
  unit: string;
  status: string;
  imageUrl?: string | null;
  sortOrder: number;
}

export interface ApiMeasurementPreset {
  id: string;
  subcategoryId: string;
  label: string;
  sortOrder: number;
  measurements?: ApiMeasurementPresetRow[];
  subcategory?: {
    id: string;
    name: string;
    parent?: { id: string; name: string };
  };
}

export async function getMeasurementPresets(
  subcategoryId: string,
  includeMeasurements = true
): Promise<ApiMeasurementPreset[]> {
  if (!subcategoryId) return [];
  const base = API_BASE || "https://api.wevraa.in/api";
  const params = new URLSearchParams({
    subcategoryId,
    includeMeasurements: String(includeMeasurements),
  });
  try {
    const res = await fetch(`${base}/v1/measurement-presets?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? (data as ApiMeasurementPreset[]) : [];
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

/** Enabled measurement rows for a preset, sorted, as editor items. */
export function presetToMeasurementItems(
  preset: ApiMeasurementPreset | undefined
): { id: string; name: string; value: number; unit: string; imageUrl?: string }[] {
  if (!preset?.measurements?.length) return [];
  return preset.measurements
    .filter((m) => m.status === "ENABLED")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: Number(m.value) || 0,
      unit: m.unit || "INCHES",
      imageUrl: m.imageUrl ?? undefined,
    }));
}

// Sleeve / Neck Designs
export interface ApiDesign {
  id: string;
  designName: string;
  description: string | null;
  categoryId: string;
  subcategoryId: string;
  imageUrl: string;
  imageUrls?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string };
  subcategory: { id: string; name: string };
}

export interface ApiDesignsPage {
  data: ApiDesign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetDesignsParams {
  page?: number;
  limit?: number;
  /** Tag variants sent as repeated `tags` query params. */
  tags?: string[];
  search?: string;
}

export async function getDesignsPage(
  params: GetDesignsParams = {}
): Promise<ApiDesignsPage> {
  const base = API_BASE || "https://api.wevraa.in/api";
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 50));
  if (params.search?.trim()) qs.set("search", params.search.trim());
  for (const tag of params.tags ?? []) {
    qs.append("tags", tag);
  }
  try {
    const res = await fetch(`${base}/v1/designs?${qs.toString()}`, {
      next: { revalidate: 0 },
      cache: "no-store",
    });
    if (!res.ok) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
    const json = await res.json();
    if (Array.isArray(json)) {
      return {
        data: json as ApiDesign[],
        total: json.length,
        page: 1,
        limit: json.length,
        totalPages: 1,
      };
    }
    const data = Array.isArray(json?.data) ? (json.data as ApiDesign[]) : [];
    return {
      data,
      total: Number(json?.total) || data.length,
      page: Number(json?.page) || 1,
      limit: Number(json?.limit) || 50,
      totalPages: Number(json?.totalPages) || 1,
    };
  } catch {
    return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }
}

/** @deprecated Prefer getDesignsPage for pagination. */
export async function getDesigns(): Promise<ApiDesign[]> {
  const page = await getDesignsPage({ page: 1, limit: 50 });
  return page.data;
}

// Reference images (Hangings / Drawing for add-ons)
export type ReferenceImageType = "HANGING" | "DRAWING";

export interface ApiReferenceImage {
  id: string;
  type: ReferenceImageType | string;
  imageUrl: string;
  label: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getReferenceImages(
  type: ReferenceImageType
): Promise<ApiReferenceImage[]> {
  const base = API_BASE || "https://api.wevraa.in/api";
  try {
    const res = await fetch(
      `${base}/v1/reference-images?type=${encodeURIComponent(type)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? (data as ApiReferenceImage[]) : [];
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

// Add-ons → accessory options (addons page)
export interface ApiAccessoryOption {
  id: string;
  name: string;
  [key: string]: unknown;
}

export async function getAccessoryOptions(): Promise<ApiAccessoryOption[]> {
  const base = API_BASE || "https://api.wevraa.in/api";
  try {
    const res = await fetch(`${base}/v1/addon/accessory-options`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const raw = Array.isArray(json) ? json : (json as { data?: unknown[] })?.data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.filter((item): item is ApiAccessoryOption => typeof item === "object" && item !== null && "name" in item);
  } catch {
    return [];
  }
}