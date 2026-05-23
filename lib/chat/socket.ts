import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth";
import { getApiHost } from "./api";
import { normalizeMessage } from "./normalize";
import type { ChatMessage } from "./types";

type MessageHandler = (message: ChatMessage) => void;
type ErrorHandler = (payload: { code?: string; message?: string }) => void;

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

  joinConversation(conversationId: string): void {
    this.ensureConnected().emit("join_conversation", { conversationId });
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit("leave_conversation", { conversationId });
  }

  sendMessage(conversationId: string, body: string): void {
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 4000) return;
    this.ensureConnected().emit("send_message", { conversationId, body: trimmed });
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
