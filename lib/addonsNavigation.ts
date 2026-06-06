export type AddonsReturnTo = "order-quote" | "select-boutiques";

export interface AddonsNavParams {
  returnTo?: AddonsReturnTo;
  productId?: string;
  productImage?: string;
  boutiqueId?: string;
}

function appendParams(params: URLSearchParams, options: AddonsNavParams): void {
  if (options.returnTo) params.set("returnTo", options.returnTo);
  if (options.productId) params.set("productId", options.productId);
  if (options.productImage) params.set("image", options.productImage);
  if (options.boutiqueId) params.set("boutiqueId", options.boutiqueId);
}

/** Build href for navigating to the add-ons page with return context. */
export function buildAddonsHref(options: AddonsNavParams = {}): string {
  const params = new URLSearchParams();
  appendParams(params, options);
  const qs = params.toString();
  return qs ? `/addons?${qs}` : "/addons";
}

/** Resolve the page to return to from the add-ons flow. */
export function getAddonsReturnHref(options: AddonsNavParams = {}): string {
  if (options.returnTo === "order-quote") {
    const params = new URLSearchParams();
    if (options.boutiqueId) params.set("boutiqueId", options.boutiqueId);
    const qs = params.toString();
    return qs ? `/order-quote?${qs}` : "/order-quote";
  }

  if (options.returnTo === "select-boutiques") {
    const params = new URLSearchParams();
    if (options.productId) params.set("productId", options.productId);
    if (options.productImage) params.set("image", options.productImage);
    const qs = params.toString();
    return qs ? `/select-boutiques?${qs}` : "/select-boutiques";
  }

  return "/select-boutiques";
}
