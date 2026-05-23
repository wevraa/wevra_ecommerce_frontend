import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuoteOrderCard {
  productTitle: string;
  productImage?: string;
  sleeveDesignImage?: string;
  requiredDateLabel: string;
  hasMeasurementSelected: boolean;
  hasAddonsSelected: boolean;
}

export interface ChatMessage {
  id: string;
  type: "text" | "quote";
  text?: string;
  quote?: QuoteOrderCard;
  direction: "out" | "in";
  timeLabel: string;
}

export interface ChatThread {
  boutiqueId: string;
  boutiqueName: string;
  messages: ChatMessage[];
}

interface ChatState {
  threads: Record<string, ChatThread>;
  sendQuoteToBoutique: (
    boutiqueId: string,
    boutiqueName: string,
    quote: QuoteOrderCard
  ) => void;
  addTextMessage: (
    boutiqueId: string,
    boutiqueName: string,
    text: string,
    direction?: "out" | "in"
  ) => void;
  getThread: (boutiqueId: string) => ChatThread | undefined;
}

function nowTimeLabel(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function newId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatRequiredDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d} ${m} ${y}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: {},

      getThread: (boutiqueId) => get().threads[boutiqueId],

      sendQuoteToBoutique: (boutiqueId, boutiqueName, quote) => {
        const time = nowTimeLabel();
        const outgoing: ChatMessage[] = [
          {
            id: newId(),
            type: "text",
            text: `Hi, ${boutiqueName}`,
            direction: "out",
            timeLabel: time,
          },
          {
            id: newId(),
            type: "text",
            text: "Hi, Can u send Costing for this",
            direction: "out",
            timeLabel: time,
          },
          {
            id: newId(),
            type: "quote",
            quote,
            direction: "out",
            timeLabel: time,
          },
        ];

        const incoming: ChatMessage = {
          id: newId(),
          type: "text",
          text: "Sure for this price 2000",
          direction: "in",
          timeLabel: time,
        };

        set((state) => ({
          threads: {
            ...state.threads,
            [boutiqueId]: {
              boutiqueId,
              boutiqueName,
              messages: [...outgoing, incoming],
            },
          },
        }));
      },

      addTextMessage: (boutiqueId, boutiqueName, text, direction = "out") => {
        set((state) => {
          const existing = state.threads[boutiqueId];
          const msg: ChatMessage = {
            id: newId(),
            type: "text",
            text,
            direction,
            timeLabel: nowTimeLabel(),
          };
          return {
            threads: {
              ...state.threads,
              [boutiqueId]: {
                boutiqueId,
                boutiqueName: existing?.boutiqueName ?? boutiqueName,
                messages: [...(existing?.messages ?? []), msg],
              },
            },
          };
        });
      },
    }),
    { name: "wevraa-chat-store" }
  )
);
