import type { ChatConversation, ChatMessage, ChatMessagesResponse } from "./types";

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

export function normalizeMessage(raw: unknown): ChatMessage | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = pickString(record, "id");
  const conversationId = pickString(record, "conversationId", "conversation_id");
  const body = pickString(record, "body", "text", "content");
  const senderUserId = pickString(record, "senderUserId", "sender_user_id", "senderId", "sender_id");
  const createdAt = pickString(record, "createdAt", "created_at");

  if (!id || !conversationId || !senderUserId || !createdAt) return null;

  return {
    id,
    conversationId,
    body,
    senderUserId,
    createdAt,
    sender: normalizeUser(record.sender),
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

  return {
    messages,
    hasMore,
    nextCursor,
  };
}

export function normalizeConversationResponse(raw: unknown): ChatConversation | null {
  const record = asRecord(raw);
  if (!record) return null;

  const nested = asRecord(record.data) ?? asRecord(record.conversation);
  return normalizeConversation(nested ?? raw);
}
