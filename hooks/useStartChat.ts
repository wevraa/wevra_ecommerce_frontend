"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { startChatWithTailor, ChatUnauthorizedError } from "@/lib/chat/startChat";

interface UseStartChatOptions {
  onUnauthorized?: () => void;
}

export function useStartChat(options?: UseStartChatOptions) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openChat = async (tailorId: string) => {
    if (!getAccessToken()) {
      options?.onUnauthorized?.();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const conversation = await startChatWithTailor(tailorId);
      router.push(`/chat/${encodeURIComponent(conversation.id)}`);
    } catch (e) {
      if (e instanceof ChatUnauthorizedError) {
        options?.onUnauthorized?.();
      } else {
        setError(e instanceof Error ? e.message : "Could not start chat");
      }
    } finally {
      setLoading(false);
    }
  };

  return { openChat, loading, error };
}
