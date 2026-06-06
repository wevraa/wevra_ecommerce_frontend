export type ChatMessageType = "TEXT" | "IMAGE" | "ORDER_REQUEST";

export type ChatUserRole = "CUSTOMER" | "TAILOR";

export interface ChatUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: ChatUserRole;
}

export interface ChatTailor {
  id: string;
  name?: string;
  boutiqueName?: string;
  logoUrl?: string | null;
}

export interface ChatConversation {
  id: string;
  tailorId: string;
  customerUserId?: string;
  tailor?: ChatTailor;
  lastMessage?: ChatMessage | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatAttachment {
  url: string;
  label?: string;
}

export interface ChatMeasurement {
  name: string;
  value: number;
  unit?: string;
}

export interface ChatAddon {
  optionName: string;
  subOptionName: string;
  imageUrl?: string;
}

/** Snapshot of the message being replied to (from API or optimistic send). */
export interface ChatReplyTo {
  id: string;
  body?: string | null;
  type?: ChatMessageType;
  category?: string | null;
  sender?: ChatUser | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  type: ChatMessageType;
  body: string | null;
  description: string | null;
  category: string | null;
  orderTypes: string[];
  imageUrls: string[];
  attachments: ChatAttachment[];
  measurements: ChatMeasurement[];
  addons: ChatAddon[];
  requiredBy: string | null;
  orderId: string | null;
  createdAt: string;
  sender?: ChatUser | null;
  replyToMessageId?: string | null;
  replyTo?: ChatReplyTo | null;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string | null;
}

/** Input collected from the order-quote flow before upload + socket send. */
export interface CustomerOrderRequestInput {
  category: string;
  orderTypes?: string[];
  productImage?: string;
  sleeveDesignImage?: string;
  measurements?: ChatMeasurement[];
  addons?: ChatAddon[];
  requiredBy: string;
  description?: string;
}

export interface OrderRequestSocketPayload {
  conversationId: string;
  type: "ORDER_REQUEST";
  category: string;
  orderTypes?: string[];
  attachments?: ChatAttachment[];
  imageUrls?: string[];
  measurements?: ChatMeasurement[];
  addons?: ChatAddon[];
  requiredBy: string;
  description?: string;
}

export interface SendMessageAck {
  ok?: boolean;
  message?: ChatMessage;
  order?: unknown;
  error?: { message?: string; code?: string };
}

export class ChatApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ChatApiError";
  }
}

export class ChatUnauthorizedError extends ChatApiError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "ChatUnauthorizedError";
  }
}
