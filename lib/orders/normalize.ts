import type {
  BillLineItem,
  BillTailorDetails,
  EcomBillDetail,
  EcomOrderDetail,
  OrderCustomization,
  OrderDesignReference,
  OrderMeasurement,
  OrderRelatedTab,
  ProductionStage,
} from "./types";

type RawRecord = Record<string, unknown>;

const DEFAULT_STAGES = ["PATTERN", "CUTTING", "STITCHING", "FINISHING"];

function asRecord(value: unknown): RawRecord | null {
  return value && typeof value === "object" ? (value as RawRecord) : null;
}

function pickString(record: RawRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return "";
}

function pickNullableString(record: RawRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (value === null) return null;
  }
  return null;
}

function pickNumber(record: RawRecord, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && !Number.isNaN(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const n = Number(value);
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

function unwrapData(raw: unknown): RawRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  return asRecord(record.data) ?? record;
}

function pickAmount(record: RawRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value.toFixed(2);
    }
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return "0";
}

function formatMeasurementValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  return "";
}

function normalizeDesignReferences(raw: unknown, attachments?: unknown): OrderDesignReference[] {
  if (Array.isArray(raw)) {
    const result: OrderDesignReference[] = [];
    for (const item of raw) {
      const record = asRecord(item);
      if (!record) continue;
      const imageUrl = pickString(record, "imageUrl", "image_url", "url");
      const label = pickString(record, "label", "name", "title");
      if (imageUrl && label) result.push({ label, imageUrl });
    }
    if (result.length > 0) return result;
  }

  if (Array.isArray(attachments)) {
    const result: OrderDesignReference[] = [];
    for (const item of attachments) {
      const record = asRecord(item);
      if (!record) continue;
      const imageUrl = pickString(record, "imageUrl", "image_url", "url");
      const label = pickString(record, "label", "name") || "Reference";
      if (imageUrl) result.push({ label, imageUrl });
    }
    if (result.length > 0) return result;
  }

  return [];
}

function normalizeDesignReferencesFromOrder(source: RawRecord): OrderDesignReference[] {
  const attachments = source.attachments ?? source.images ?? source.designReferences ?? source.design_references;
  const fromList = normalizeDesignReferences(
    source.designReferences ?? source.design_references,
    attachments
  );
  if (fromList.length > 0) return fromList;

  const refs: OrderDesignReference[] = [];
  const productImage = pickString(source, "productImage", "product_image", "imageUrl", "image_url");
  if (productImage) refs.push({ label: "Material", imageUrl: productImage });

  const sleeveImage = pickString(
    source,
    "sleeveDesignImage",
    "sleeve_design_image",
    "sleeveImage",
    "sleeve_image"
  );
  if (sleeveImage) refs.push({ label: "Sleeves", imageUrl: sleeveImage });

  const imageUrls = source.imageUrls ?? source.image_urls;
  if (Array.isArray(imageUrls)) {
    for (const [index, url] of imageUrls.entries()) {
      if (typeof url === "string" && url) {
        refs.push({ label: `Reference ${index + 1}`, imageUrl: url });
      }
    }
  }

  if (Array.isArray(source.addons)) {
    for (const addon of source.addons) {
      const record = asRecord(addon);
      if (!record) continue;
      const imageUrl = pickString(record, "imageUrl", "image_url");
      const label =
        pickString(record, "subOptionName", "sub_option_name", "optionName", "option_name") || "Addon";
      if (imageUrl) refs.push({ label, imageUrl });
    }
  }

  return refs;
}

function normalizeCustomizations(raw: unknown): OrderCustomization[] {
  if (!Array.isArray(raw)) return [];
  const result: OrderCustomization[] = [];
  for (const item of raw) {
    const record = asRecord(item);
    if (!record) continue;
    const label =
      pickString(record, "label", "optionName", "option_name", "name") ||
      pickString(record, "subOptionName", "sub_option_name");
    const value =
      pickString(record, "value", "subOptionName", "sub_option_name") ||
      pickString(record, "optionName", "option_name");
    if (label) result.push({ label: label.toUpperCase(), value: value || "—" });
  }
  return result;
}

function normalizeMeasurements(raw: unknown): OrderMeasurement[] {
  if (!Array.isArray(raw)) return [];
  const result: OrderMeasurement[] = [];
  for (const item of raw) {
    const record = asRecord(item);
    if (!record) continue;
    const name = pickString(record, "name", "label");
    const value = formatMeasurementValue(record.value);
    if (!name || !value) continue;
    const unit = pickString(record, "unit") || undefined;
    result.push({ name: name.toUpperCase(), value, unit });
  }
  return result;
}

function normalizeProductionStages(
  raw: unknown,
  status: string,
  progressPercent: number
): ProductionStage[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((item, index) => {
      const record = asRecord(item);
      const name =
        typeof item === "string"
          ? item
          : pickString(record ?? {}, "name", "label", "stage") || DEFAULT_STAGES[index] || `STAGE ${index + 1}`;
      const completed =
        typeof record?.completed === "boolean"
          ? record.completed
          : typeof record?.done === "boolean"
            ? record.done
            : index < Math.round((progressPercent / 100) * raw.length);
      return { name: name.toUpperCase(), completed };
    });
  }

  const filledCount = Math.max(
    0,
    Math.min(DEFAULT_STAGES.length, Math.round((progressPercent / 100) * DEFAULT_STAGES.length))
  );
  return DEFAULT_STAGES.map((name, index) => ({
    name,
    completed: index < filledCount || status.toLowerCase().includes("deliver"),
  }));
}

function normalizeRelatedOrders(raw: unknown, currentId: string, currentNo: number): OrderRelatedTab[] {
  if (!Array.isArray(raw)) return [{ id: currentId, orderNo: currentNo }];
  const tabs: OrderRelatedTab[] = [];
  for (const item of raw) {
    const record = asRecord(item);
    if (!record) continue;
    const id = pickString(record, "id");
    const orderNo = pickNumber(record, "orderNo", "order_no", "no");
    if (id && orderNo !== undefined) tabs.push({ id, orderNo });
  }
  if (!tabs.some((t) => t.id === currentId)) {
    tabs.unshift({ id: currentId, orderNo: currentNo });
  }
  return tabs.sort((a, b) => b.orderNo - a.orderNo);
}

export function normalizeOrderDetail(raw: unknown): EcomOrderDetail | null {
  const record = unwrapData(raw);
  if (!record) return null;

  const nestedOrder = asRecord(record.order);
  const source = nestedOrder ?? record;
  const customer = asRecord(source.customer ?? record.customer);
  const tailorRaw = source.tailorDetails ?? source.tailor_details ?? source.tailor ?? record.tailor;

  const id = pickString(source, "id") || pickString(record, "id");
  const orderNo = pickNumber(source, "orderNo", "order_no", "no") ?? pickNumber(record, "orderNo", "order_no", "no") ?? 0;
  if (!id) return null;

  const status = pickString(source, "status", "orderStatus", "order_status") || "In Progress";
  const progressPercent =
    pickNumber(source, "progressPercent", "progress_percent", "productionProgressPercent") ??
    pickNumber(record, "progressPercent", "progress_percent", "productionProgressPercent") ??
    pickNumber(asRecord(source.productionProgress ?? record.productionProgress) ?? {}, "percent", "percentage") ??
    (status.toLowerCase().includes("deliver") ? 100 : 40);

  return {
    id,
    orderNo,
    customerName:
      pickString(source, "customerName", "customer_name") ||
      pickString(record, "customerName", "customer_name") ||
      pickString(customer ?? {}, "name", "fullName", "full_name") ||
      "Customer",
    orderType:
      pickString(source, "orderType", "order_type", "category", "title", "description") ||
      pickString(record, "orderType", "order_type", "category") ||
      "Custom Order",
    membershipTier:
      pickString(source, "membershipTier", "membership_tier", "tier") ||
      pickString(record, "membershipTier", "membership_tier", "tier") ||
      undefined,
    expectedDate:
      pickNullableString(
        source,
        "expectedDate",
        "expected_date",
        "deliveryDate",
        "delivery_date",
        "requiredBy",
        "required_by"
      ) ??
      pickNullableString(
        record,
        "expectedDate",
        "expected_date",
        "deliveryDate",
        "delivery_date",
        "requiredBy",
        "required_by"
      ),
    status,
    progressPercent,
    productionStages: normalizeProductionStages(
      source.productionStages ??
        source.stages ??
        record.productionStages ??
        asRecord(source.productionProgress ?? record.productionProgress)?.stages,
      status,
      progressPercent
    ),
    designReferences: normalizeDesignReferencesFromOrder(source),
    customizations: normalizeCustomizations(
      source.customizations ?? source.addons ?? record.customizations ?? record.addons
    ),
    measurements: normalizeMeasurements(source.measurements ?? record.measurements),
    measurementUnit:
      pickString(source, "measurementUnit", "measurement_unit", "unit") ||
      pickString(record, "measurementUnit", "measurement_unit", "unit") ||
      "INCHES",
    relatedOrders: normalizeRelatedOrders(
      source.relatedOrders ??
        source.related_orders ??
        source.siblingOrders ??
        record.relatedOrders ??
        record.related_orders ??
        record.siblingOrders,
      id,
      orderNo
    ),
    tailorDetails: {
      boutiqueName:
        pickString(source, "boutiqueName", "boutique_name") ||
        pickString(asRecord(tailorRaw) ?? {}, "boutiqueName", "boutique_name", "name"),
      logoUrl: (asRecord(tailorRaw)?.logoUrl ?? asRecord(tailorRaw)?.logo_url ?? null) as string | null,
      address: pickString(asRecord(tailorRaw) ?? {}, "address", "addressLine1", "address_line1"),
      phone: pickString(asRecord(tailorRaw) ?? {}, "phone"),
    },
  };
}

function normalizeBillTailor(raw: unknown): BillTailorDetails {
  const record = asRecord(raw) ?? {};
  const addressParts = [
    pickString(record, "address", "addressLine1", "address_line1"),
    pickString(record, "addressLine2", "address_line2"),
  ].filter(Boolean);

  return {
    boutiqueName:
      pickString(record, "boutiqueName", "boutique_name", "name") || "Boutique",
    logoUrl: (record.logoUrl ?? record.logo_url ?? null) as string | null,
    address: addressParts.join(", ") || undefined,
    city: pickString(record, "city") || undefined,
    state: pickString(record, "state") || undefined,
    pincode: pickString(record, "pincode", "postalCode", "postal_code") || undefined,
    phone: pickString(record, "phone") || undefined,
    email: pickString(record, "email") || undefined,
  };
}

function normalizeBillItems(raw: unknown): BillLineItem[] {
  if (!Array.isArray(raw)) return [];
  const result: BillLineItem[] = [];
  for (const [index, item] of raw.entries()) {
    const record = asRecord(item);
    if (!record) continue;
    const nestedOrder = asRecord(record.order);
    const id = pickString(record, "id") || `bill-item-${index + 1}`;
    const description =
      pickString(record, "description", "title", "name", "itemName", "item_name", "productName", "product_name") ||
      pickString(nestedOrder ?? {}, "description", "orderType", "order_type", "category");
    if (!description) continue;

    const orderId =
      pickString(record, "orderId", "order_id") ||
      pickString(nestedOrder ?? {}, "id") ||
      undefined;

    result.push({
      id,
      orderId,
      orderNo:
        pickNumber(record, "orderNo", "order_no") ??
        pickNumber(nestedOrder ?? {}, "orderNo", "order_no"),
      description,
      orderType:
        pickString(record, "orderType", "order_type") ||
        pickString(nestedOrder ?? {}, "orderType", "order_type", "category") ||
        undefined,
      imageUrl:
        pickString(record, "imageUrl", "image_url", "thumbnailUrl", "thumbnail_url", "productImage", "product_image") ||
        pickString(nestedOrder ?? {}, "imageUrl", "image_url", "productImage", "product_image") ||
        undefined,
      unitPrice: pickAmount(record, "unitPrice", "unit_price", "rate", "price"),
      qty: pickNumber(record, "qty", "quantity") ?? 1,
      lineTotal: pickAmount(record, "lineTotal", "line_total", "total", "amount"),
    });
  }
  return result;
}

export function normalizeBillDetail(raw: unknown): EcomBillDetail | null {
  const record = unwrapData(raw);
  if (!record) return null;

  const nestedBill = asRecord(record.bill);
  const source = nestedBill ?? record;
  const customer = asRecord(source.customer ?? record.customer);
  const tailorRaw =
    source.tailorDetails ??
    source.tailor_details ??
    source.tailor ??
    source.boutique ??
    record.tailorDetails ??
    record.tailor ??
    record.boutique;

  const id = pickString(source, "id") || pickString(record, "id");
  const billNo = pickNumber(source, "billNo", "bill_no") ?? pickNumber(record, "billNo", "bill_no");
  if (!id || billNo === undefined) return null;

  const tailorDetails = normalizeBillTailor(tailorRaw);
  const items = normalizeBillItems(
    source.items ?? source.billItems ?? source.bill_items ?? source.lineItems ?? record.items
  );

  return {
    id,
    billNo,
    orderDate:
      pickNullableString(source, "orderDate", "order_date", "billDate", "bill_date", "createdAt", "created_at") ??
      pickNullableString(record, "orderDate", "order_date", "billDate", "bill_date", "createdAt", "created_at"),
    dueDate:
      pickNullableString(source, "deliveryDate", "delivery_date", "dueDate", "due_date") ??
      pickNullableString(record, "deliveryDate", "delivery_date", "dueDate", "due_date"),
    customerName:
      pickString(source, "customerName", "customer_name") ||
      pickString(record, "customerName", "customer_name") ||
      pickString(customer ?? {}, "name", "fullName", "full_name") ||
      "Customer",
    customerPhone:
      pickString(source, "customerPhone", "customer_phone") ||
      pickString(record, "customerPhone", "customer_phone") ||
      pickString(customer ?? {}, "phone", "mobile", "phoneNumber", "phone_number") ||
      undefined,
    subtotal:
      pickAmount(source, "subtotal", "subTotal", "sub_total") ||
      pickAmount(record, "subtotal", "subTotal", "sub_total"),
    total: pickAmount(source, "total", "grandTotal", "grand_total") || pickAmount(record, "total"),
    advancePaid:
      pickAmount(source, "advancePaid", "advance_paid", "advanceReceived", "advance_received") ||
      pickAmount(record, "advancePaid", "advance_paid", "advanceReceived", "advance_received"),
    advancePaidDate:
      pickNullableString(
        source,
        "advancePaidDate",
        "advance_paid_date",
        "advancePaidOn",
        "advance_paid_on",
        "advanceReceivedDate",
        "advance_received_date"
      ) ?? pickNullableString(record, "advancePaidDate", "advance_paid_date"),
    balance: pickAmount(source, "balance", "balanceDue", "balance_due") || pickAmount(record, "balance"),
    tailorDetails,
    items,
  };
}
