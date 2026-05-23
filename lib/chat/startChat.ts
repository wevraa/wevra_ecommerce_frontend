import {
  createConversation,
  cacheConversation,
  ChatUnauthorizedError,
} from "./api";
import { chatSocket } from "./socket";
import type { QuoteOrderPayload } from "./types";
import { buildQuoteMessages, cachePendingQuote } from "./quote";

export { formatRequiredDate, buildQuoteMessages } from "./quote";
export type { QuoteOrderPayload } from "./types";

export async function startChatWithTailor(tailorId: string) {
  const conversation = await createConversation(tailorId);
  cacheConversation(conversation);
  return conversation;
}

export async function sendQuoteViaChat(
  conversationId: string,
  boutiqueName: string,
  quote: QuoteOrderPayload
): Promise<void> {
  chatSocket.connect();
  chatSocket.joinConversation(conversationId);

  const bodies = buildQuoteMessages(boutiqueName, quote);
  for (const body of bodies) {
    chatSocket.sendMessage(conversationId, body);
    await new Promise((r) => setTimeout(r, 80));
  }

  cachePendingQuote(conversationId, quote);
}

export { ChatUnauthorizedError };
