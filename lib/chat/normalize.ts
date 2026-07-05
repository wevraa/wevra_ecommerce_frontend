import type {
  ChatAddon,
  ChatAttachment,
  ChatBill,
  ChatBillItem,
  ChatBillTailorDetails,
  ChatConversation,
  ChatMeasurement,
  ChatMessage,
  ChatMessageType,
  ChatMessagesResponse,
  ChatReplyTo,
} from "./types";

type RawRecord = Record<string, unknown>;

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

function normalizeAttachments(raw: unknown): ChatAttachment[] {
  if (!Array.isArray(raw)) return [];
  const result: ChatAttachment[] = [];
  for (const item of raw) {
    const record = asRecord(item);
    if (!record) continue;
    const url = pickString(record, "url", "imageUrl", "image_url");
    if (!url) continue;
    const label = pickString(record, "label") || undefined;
    result.push({ url, label });
  }
  return result;
}

function normalizeMeasurements(raw: unknown): ChatMeasurement[] {
  if (!Array.isArray(raw)) return [];
  const result: ChatMeasurement[] = [];
  for (const item of raw) {
    const record = asRecord(item);
    if (!record) continue;
    const name = pickString(record, "name");
    const value = Number(record.value);
    if (!name || Number.isNaN(value)) continue;
    const unit = pickString(record, "unit") || undefined;
    result.push({ name, value, unit });
  }
  return result;
}

function normalizeAddons(raw: unknown): ChatAddon[] {
  if (!Array.isArray(raw)) return [];
  const result: ChatAddon[] = [];
  for (const item of raw) {
    const record = asRecord(item);
    if (!record) continue;
    const optionName = pickString(record, "optionName", "option_name");
    const subOptionName =
      pickString(record, "subOptionName", "sub_option_name") || optionName;
    if (!optionName) continue;
    const imageUrl = pickString(record, "imageUrl", "image_url") || undefined;
    result.push({ optionName, subOptionName, imageUrl });
  }
  return result;
}

function normalizeUser(raw: unknown) {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record, "id");
  if (!id) return null;
  return {
    id,
    firstName: (record.firstName ?? record.first_name ?? null) as string | null,
    lastName: (record.lastName ?? record.last_name ?? null) as string | null,
    email: (record.email ?? null) as string | null,
    role: (record.role ?? null) as "CUSTOMER" | "TAILOR" | undefined,
  };
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

function normalizeBillTailorDetails(raw: unknown): ChatBillTailorDetails | undefined {
  const record = asRecord(raw);
  if (!record) return undefined;
  return {
    boutiqueName: pickString(record, "boutiqueName", "boutique_name", "name") || undefined,
    phone: pickString(record, "phone") || undefined,
    email: pickString(record, "email") || undefined,
    logoUrl: (record.logoUrl ?? record.logo_url ?? null) as string | null,
    address: pickString(record, "address", "addressLine1", "address_line1") || undefined,
  };
}

function normalizeBillItems(raw: unknown): ChatBillItem[] {
  if (!Array.isArray(raw)) return [];
  const result: ChatBillItem[] = [];
  for (const item of raw) {
    const record = asRecord(item);
    if (!record) continue;
    const id = pickString(record, "id");
    const description = pickString(record, "description");
    if (!id || !description) continue;
    const qty = pickNumber(record, "qty", "quantity") ?? 1;
    result.push({
      id,
      orderNo: pickNumber(record, "orderNo", "order_no"),
      description,
      orderType: pickString(record, "orderType", "order_type") || undefined,
      unitPrice: pickString(record, "unitPrice", "unit_price") || "0",
      qty,
      lineTotal: pickString(record, "lineTotal", "line_total") || "0",
    });
  }
  return result;
}

function normalizeBill(raw: unknown): ChatBill | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record, "id");
  const billNo = pickNumber(record, "billNo", "bill_no");
  if (!id || billNo === undefined) return null;
  return {
    id,
    billNo,
    deliveryDate: pickNullableString(record, "deliveryDate", "delivery_date"),
    subtotal: pickString(record, "subtotal") || "0",
    total: pickString(record, "total") || "0",
    advancePaid: pickString(record, "advancePaid", "advance_paid") || "0",
    balance: pickString(record, "balance") || "0",
    customerName: pickString(record, "customerName", "customer_name") || undefined,
    customerPhone: pickString(record, "customerPhone", "customer_phone") || undefined,
    tailorDetails: normalizeBillTailorDetails(record.tailorDetails ?? record.tailor_details),
    items: normalizeBillItems(record.items),
  };
}

function normalizeTailor(raw: unknown) {
  const record = asRecord(raw);
  if (!record) return undefined;
  const id = pickString(record, "id");
  if (!id) return undefined;
  return {
    id,
    name: pickString(record, "name") || undefined,
    boutiqueName:
      pickString(record, "boutiqueName", "boutique_name", "name") || undefined,
    logoUrl: (record.logoUrl ?? record.logo_url ?? null) as string | null,
  };
}

function normalizeMessageType(record: RawRecord, body: string | null): ChatMessageType {
  const raw = pickString(record, "type").toUpperCase();
  if (raw === "ORDER_REQUEST" || raw === "IMAGE" || raw === "TEXT" || raw === "BILL") {
    return raw as ChatMessageType;
  }
  if (record.bill || record.billId || record.bill_id) {
    return "BILL";
  }
  if (
    record.category ||
    record.requiredBy ||
    record.required_by ||
    (Array.isArray(record.attachments) && record.attachments.length > 0)
  ) {
    return "ORDER_REQUEST";
  }
  return body ? "TEXT" : "TEXT";
}

function normalizeReplyTo(raw: unknown): ChatReplyTo | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = pickString(record, "id", "messageId", "message_id");
  if (!id) return null;

  const body = pickNullableString(record, "body", "text", "content");
  const rawType = pickString(record, "type").toUpperCase();
  const type =
    rawType === "ORDER_REQUEST" ||
    rawType === "IMAGE" ||
    rawType === "TEXT" ||
    rawType === "BILL"
      ? (rawType as ChatMessageType)
      : body
        ? "TEXT"
        : record.category
          ? "ORDER_REQUEST"
          : record.bill
            ? "BILL"
            : undefined;

  return {
    id,
    body,
    type,
    category: pickNullableString(record, "category"),
    sender: normalizeUser(record.sender),
  };
}

export function normalizeMessage(raw: unknown): ChatMessage | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = pickString(record, "id");
  const conversationId = pickString(record, "conversationId", "conversation_id");
  const senderUserId = pickString(record, "senderUserId", "sender_user_id", "senderId", "sender_id");
  const createdAt = pickString(record, "createdAt", "created_at");
  const body = pickNullableString(record, "body", "text", "content");

  if (!id || !conversationId || !senderUserId || !createdAt) return null;

  const type = normalizeMessageType(record, body);
  const attachments = normalizeAttachments(record.attachments);
  const imageUrlsRaw = record.imageUrls ?? record.image_urls;
  const imageUrls = Array.isArray(imageUrlsRaw)
    ? imageUrlsRaw.filter((u): u is string => typeof u === "string")
    : attachments.map((a) => a.url);

  const replyToRaw = record.replyTo ?? record.reply_to ?? record.quotedMessage ?? record.quoted_message;
  const replyTo = normalizeReplyTo(replyToRaw);
  const billRaw = record.bill;
  const bill = billRaw ? normalizeBill(billRaw) : null;

  return {
    id,
    conversationId,
    senderUserId,
    type,
    body,
    description: pickNullableString(record, "description"),
    category: pickNullableString(record, "category"),
    orderTypes: Array.isArray(record.orderTypes)
      ? record.orderTypes.filter((t): t is string => typeof t === "string")
      : Array.isArray(record.order_types)
        ? record.order_types.filter((t): t is string => typeof t === "string")
        : [],
    imageUrls,
    attachments,
    measurements: normalizeMeasurements(record.measurements),
    addons: normalizeAddons(record.addons),
    requiredBy: pickNullableString(record, "requiredBy", "required_by"),
    orderId: pickNullableString(record, "orderId", "order_id"),
    billId: pickNullableString(record, "billId", "bill_id") ?? bill?.id ?? null,
    bill,
    createdAt,
    sender: normalizeUser(record.sender),
    replyToMessageId:
      pickNullableString(
        record,
        "replyToMessageId",
        "reply_to_message_id",
        "replyToId",
        "reply_to_id"
      ) ?? replyTo?.id ?? null,
    replyTo,
  };
}

export function normalizeConversation(raw: unknown): ChatConversation | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = pickString(record, "id");
  const tailorId = pickString(record, "tailorId", "tailor_id");
  if (!id || !tailorId) return null;

  const lastMessageRaw = record.lastMessage ?? record.last_message;
  const lastMessage = lastMessageRaw ? normalizeMessage(lastMessageRaw) : null;

  return {
    id,
    tailorId,
    customerUserId: pickString(record, "customerUserId", "customer_user_id") || undefined,
    tailor: normalizeTailor(record.tailor),
    lastMessage,
    createdAt: pickString(record, "createdAt", "created_at") || undefined,
    updatedAt: pickString(record, "updatedAt", "updated_at") || undefined,
  };
}

export function normalizeConversationList(raw: unknown): ChatConversation[] {
  const record = asRecord(raw);
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(record?.data)
      ? record!.data
      : Array.isArray(record?.conversations)
        ? record!.conversations
        : [];

  return list
    .map((item) => normalizeConversation(item))
    .filter((item): item is ChatConversation => item !== null);
}

export function normalizeMessagesResponse(raw: unknown): ChatMessagesResponse {
  const record = asRecord(raw);
  const payload = asRecord(record?.data) ?? record;
  const messagesRaw = Array.isArray(payload?.messages)
    ? payload!.messages
    : Array.isArray(record?.messages)
      ? record!.messages
      : Array.isArray(raw)
        ? raw
        : [];

  const messages = messagesRaw
    .map((item) => normalizeMessage(item))
    .filter((item): item is ChatMessage => item !== null);

  const hasMore = Boolean(payload?.hasMore ?? payload?.has_more ?? record?.hasMore ?? record?.has_more);
  const nextCursor =
    (payload?.nextCursor ?? payload?.next_cursor ?? record?.nextCursor ?? record?.next_cursor ?? null) as
      | string
      | null;

  return { messages, hasMore, nextCursor };
}

export function normalizeConversationResponse(raw: unknown): ChatConversation | null {
  const record = asRecord(raw);
  if (!record) return null;

  const nested = asRecord(record.data) ?? asRecord(record.conversation);
  return normalizeConversation(nested ?? raw);
}
