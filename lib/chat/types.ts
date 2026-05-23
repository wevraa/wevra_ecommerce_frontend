export interface ChatUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
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

export interface ChatMessage {
  id: string;
  conversationId: string;
  body: string;
  senderUserId: string;
  createdAt: string;
  sender?: ChatUser | null;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface QuoteOrderPayload {
  productTitle: string;
  productImage?: string;
  sleeveDesignImage?: string;
  requiredDateLabel: string;
  hasMeasurementSelected: boolean;
  hasAddonsSelected: boolean;
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
