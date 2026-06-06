import { getAccessToken, tryRefreshFromStorage } from "@/lib/auth";
import { ChatApiError, ChatUnauthorizedError } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

function isRemoteUrl(source: string): boolean {
  return source.startsWith("http://") || source.startsWith("https://");
}

async function sourceToFile(source: string): Promise<File> {
  const res = await fetch(source);
  const blob = await res.blob();
  const ext = blob.type.split("/")[1] || "jpg";
  return new File([blob], `chat-image.${ext}`, { type: blob.type || "image/jpeg" });
}

async function uploadFile(file: File, retry = true): Promise<string> {
  const token = getAccessToken();
  if (!token) throw new ChatUnauthorizedError();

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/v1/upload/image?folder=chat-images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshFromStorage();
    if (refreshed) return uploadFile(file, false);
    throw new ChatUnauthorizedError();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : `Upload failed (${res.status})`;
    throw new ChatApiError(msg, res.status);
  }

  const url = typeof data?.url === "string" ? data.url : "";
  if (!url) throw new ChatApiError("Upload response missing url", 500);
  return url;
}

/** Upload blob/data URLs; pass through existing remote https URLs. */
export async function resolveChatImageUrl(source: string | undefined): Promise<string | undefined> {
  if (!source) return undefined;
  if (isRemoteUrl(source) && !source.startsWith("blob:")) return source;

  if (source.startsWith("blob:") || source.startsWith("data:")) {
    return uploadFile(await sourceToFile(source));
  }

  return source.startsWith("/") ? source : undefined;
}
