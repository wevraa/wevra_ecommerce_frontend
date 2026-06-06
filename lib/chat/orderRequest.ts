import {
  createConversation,
  cacheConversation,
  ChatUnauthorizedError,
} from "./api";
import { chatSocket } from "./socket";
import { resolveChatImageUrl } from "./upload";
import { normalizeMessage } from "./normalize";
import type {
  ChatAttachment,
  ChatMessage,
  CustomerOrderRequestInput,
  OrderRequestSocketPayload,
} from "./types";
import { ChatApiError } from "./types";

export { ChatUnauthorizedError };

const PENDING_ORDER_PREFIX = "wevraa-pending-order-";

export function cachePendingOrder(conversationId: string, message: ChatMessage): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${PENDING_ORDER_PREFIX}${conversationId}`, JSON.stringify(message));
  } catch {
    /* ignore */
  }
}

export function getPendingOrder(conversationId: string): ChatMessage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PENDING_ORDER_PREFIX}${conversationId}`);
    return raw ? (JSON.parse(raw) as ChatMessage) : null;
  } catch {
    return null;
  }
}

export function clearPendingOrder(conversationId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${PENDING_ORDER_PREFIX}${conversationId}`);
}

export function buildPendingOrderMessage(
  conversationId: string,
  input: CustomerOrderRequestInput,
  userId: string | null
): ChatMessage {
  const attachments: ChatAttachment[] = [];
  if (input.productImage) attachments.push({ url: input.productImage, label: "Fabric" });
  if (input.sleeveDesignImage) {
    attachments.push({ url: input.sleeveDesignImage, label: "Front Neck Design" });
  }

  return {
    id: `pending-order-${conversationId}`,
    conversationId,
    senderUserId: userId ?? "local-user",
    type: "ORDER_REQUEST",
    body: null,
    description: input.description ?? null,
    category: input.category,
    orderTypes: input.orderTypes ?? [],
    imageUrls: attachments.map((a) => a.url),
    attachments,
    measurements: input.measurements ?? [],
    addons: input.addons ?? [],
    requiredBy: input.requiredBy,
    orderId: null,
    createdAt: new Date().toISOString(),
  };
}

async function buildOrderPayload(
  conversationId: string,
  input: CustomerOrderRequestInput
): Promise<OrderRequestSocketPayload> {
  const fabricUrl = await resolveChatImageUrl(input.productImage);
  const neckUrl = await resolveChatImageUrl(input.sleeveDesignImage);

  const attachments: ChatAttachment[] = [];
  if (fabricUrl) attachments.push({ url: fabricUrl, label: "Fabric" });
  if (neckUrl) attachments.push({ url: neckUrl, label: "Front Neck Design" });

  const imageUrls = attachments.map((a) => a.url);

  return {
    conversationId,
    type: "ORDER_REQUEST",
    category: input.category,
    orderTypes: input.orderTypes?.length ? input.orderTypes : undefined,
    attachments: attachments.length ? attachments : undefined,
    imageUrls: imageUrls.length ? imageUrls : undefined,
    measurements: input.measurements?.length ? input.measurements : undefined,
    addons: input.addons?.length ? input.addons : undefined,
    requiredBy: input.requiredBy,
    description: input.description,
  };
}

export async function startChatWithTailor(tailorId: string) {
  const conversation = await createConversation(tailorId);
  cacheConversation(conversation);
  return conversation;
}

export async function sendOrderRequestViaChat(
  conversationId: string,
  input: CustomerOrderRequestInput
): Promise<ChatMessage> {
  chatSocket.connect();
  chatSocket.joinConversation(conversationId);

  const payload = await buildOrderPayload(conversationId, input);
  const ack = await chatSocket.sendOrderRequest(payload);

  if (!ack?.ok) {
    throw new ChatApiError(
      ack?.error?.message ?? "Failed to send order request",
      400,
      ack?.error?.code
    );
  }

  const message = ack.message ? normalizeMessage(ack.message) : null;
  if (!message) {
    throw new ChatApiError("Order sent but no message returned", 500);
  }

  if (message.type !== "ORDER_REQUEST") {
    throw new ChatApiError("Unexpected message type from server", 500);
  }

  if (!message.orderId) {
    throw new ChatApiError("Order was not created (missing orderId)", 500);
  }

  clearPendingOrder(conversationId);
  return message;
}

export async function prepareAndCachePendingOrder(
  conversationId: string,
  input: CustomerOrderRequestInput,
  userId: string | null
): Promise<void> {
  cachePendingOrder(conversationId, buildPendingOrderMessage(conversationId, input, userId));
}
