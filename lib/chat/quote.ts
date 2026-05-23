import type { ChatMessage, QuoteOrderPayload } from "./types";

export function formatRequiredDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d} ${m} ${y}`;
}

export function buildQuoteMessages(
  boutiqueName: string,
  quote: QuoteOrderPayload
): string[] {
  const lines = [
    `Hi, ${boutiqueName}`,
    "Hi, Can u send Costing for this",
    [
      `Product: ${quote.productTitle}`,
      `Required Date: ${quote.requiredDateLabel}`,
      quote.hasMeasurementSelected ? "Measurement added" : "No measurement selected",
      quote.hasAddonsSelected ? "Add ons selected" : "No add-ons selected",
    ].join("\n"),
  ];
  return lines;
}

/** Detect locally-sent quote summary for rich card UI. */
export function parseQuoteBody(body: string): QuoteOrderPayload | null {
  if (!body.includes("Product:") || !body.includes("Required Date:")) return null;
  const productMatch = body.match(/Product:\s*(.+)/);
  const dateMatch = body.match(/Required Date:\s*(.+)/);
  if (!productMatch || !dateMatch) return null;
  return {
    productTitle: productMatch[1].trim(),
    requiredDateLabel: dateMatch[1].trim(),
    hasMeasurementSelected: body.includes("Measurement added"),
    hasAddonsSelected: body.includes("Add ons selected"),
  };
}

const QUOTE_META_PREFIX = "wevraa-quote-meta-";
const PENDING_QUOTE_PREFIX = "wevraa-quote-pending-";

export function cacheQuoteMeta(messageId: string, quote: QuoteOrderPayload): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${QUOTE_META_PREFIX}${messageId}`, JSON.stringify(quote));
  } catch {
    /* ignore */
  }
}

export function getQuoteMeta(messageId: string): QuoteOrderPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${QUOTE_META_PREFIX}${messageId}`);
    return raw ? (JSON.parse(raw) as QuoteOrderPayload) : null;
  } catch {
    return null;
  }
}

export function cachePendingQuote(conversationId: string, quote: QuoteOrderPayload): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${PENDING_QUOTE_PREFIX}${conversationId}`, JSON.stringify(quote));
  } catch {
    /* ignore */
  }
}

export function attachPendingQuoteToMessage(
  conversationId: string,
  messageId: string,
  body: string
): void {
  if (!parseQuoteBody(body)) return;
  const pending = getPendingQuote(conversationId);
  if (!pending) return;
  cacheQuoteMeta(messageId, pending);
  clearPendingQuote(conversationId);
}

export function getPendingQuote(conversationId: string): QuoteOrderPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PENDING_QUOTE_PREFIX}${conversationId}`);
    return raw ? (JSON.parse(raw) as QuoteOrderPayload) : null;
  } catch {
    return null;
  }
}

export function buildPendingQuoteMessages(
  conversationId: string,
  boutiqueName: string,
  userId: string | null
): ChatMessage[] {
  const quote = getPendingQuote(conversationId);
  if (!quote) return [];

  const now = new Date().toISOString();
  const bodies = buildQuoteMessages(boutiqueName, quote);

  return bodies.map((body, index) => ({
    id: `pending-${conversationId}-${index}`,
    conversationId,
    body,
    senderUserId: userId ?? "local-user",
    createdAt: now,
  }));
}

function clearPendingQuote(conversationId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${PENDING_QUOTE_PREFIX}${conversationId}`);
}
