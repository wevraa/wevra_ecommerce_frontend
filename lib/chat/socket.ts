import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth";
import { getApiHost } from "./api";
import { normalizeMessage } from "./normalize";
import type {
  ChatMessage,
  OrderRequestSocketPayload,
  SendMessageAck,
} from "./types";

type MessageHandler = (message: ChatMessage) => void;
type ErrorHandler = (payload: { code?: string; message?: string }) => void;

const ACK_TIMEOUT_MS = 15000;

class ChatSocketService {
  private socket: Socket | null = null;
  private messageHandlers = new Set<MessageHandler>();
  private errorHandlers = new Set<ErrorHandler>();

  connect(): Socket {
    const token = getAccessToken();
    if (!token) {
      throw new Error("UNAUTHORIZED");
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    this.disconnect();

    this.socket = io(`${getApiHost()}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    this.socket.on("message:new", (payload: unknown) => {
      const message = normalizeMessage(payload);
      if (!message) return;
      this.messageHandlers.forEach((h) => h(message));
    });

    this.socket.on("error", (payload: { code?: string; message?: string }) => {
      this.errorHandlers.forEach((h) => h(payload));
    });

    return this.socket;
  }

  ensureConnected(): Socket {
    if (this.socket?.connected) return this.socket;
    return this.connect();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  reconnect(): void {
    this.disconnect();
    const token = getAccessToken();
    if (token) this.connect();
  }

  private emitWithAck<T>(event: string, payload: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const socket = this.ensureConnected();
      const timer = window.setTimeout(() => {
        reject(new Error("Chat request timed out"));
      }, ACK_TIMEOUT_MS);

      socket.emit(event, payload, (ack: T) => {
        window.clearTimeout(timer);
        resolve(ack);
      });
    });
  }

  joinConversation(conversationId: string): void {
    this.ensureConnected().emit("join_conversation", { conversationId }, (ack: { error?: string }) => {
      if (ack?.error) console.error("[chat] join_conversation:", ack.error);
    });
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit("leave_conversation", { conversationId });
  }

  async sendTextMessage(
    conversationId: string,
    body: string,
    replyToMessageId?: string
  ): Promise<SendMessageAck> {
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 4000) {
      return { ok: false, error: { message: "Invalid message" } };
    }
    const payload: Record<string, unknown> = {
      conversationId,
      type: "TEXT",
      body: trimmed,
    };
    if (replyToMessageId) {
      payload.replyToMessageId = replyToMessageId;
    }
    return this.emitWithAck<SendMessageAck>("send_message", payload);
  }

  async sendOrderRequest(payload: OrderRequestSocketPayload): Promise<SendMessageAck> {
    return this.emitWithAck<SendMessageAck>("send_message", payload);
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }
}

export const chatSocket = new ChatSocketService();

if (typeof window !== "undefined") {
  window.addEventListener("auth-changed", () => {
    chatSocket.reconnect();
  });
}
