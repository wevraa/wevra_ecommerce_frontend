const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

export const AUTH_ACCESS_TOKEN_KEY = "wevraa_access_token";
export const AUTH_REFRESH_TOKEN_KEY = "wevraa_refresh_token";
export const AUTH_USER_KEY = "wevraa_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
}

/** Format phone as in API examples: "+91 9876543210" */
export function normalizePhoneForApi(input: string): string {
  const digits = input.replace(/\D/g, "");
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
  if (last10.length !== 10) {
    const trimmed = input.trim();
    return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  }
  return `+91 ${last10}`;
}

export interface RequestOtpResponse {
  phone: string;
  otp?: string;
  expiresIn?: number;
}

export interface EcomLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  user?: unknown;
  [key: string]: unknown;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  [key: string]: unknown;
}

export async function requestEcomOtp(phone: string): Promise<RequestOtpResponse> {
  const res = await fetch(`${API_BASE}/v1/auth/ecom/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : JSON.stringify(data) || "Failed to send OTP";
    throw new Error(msg);
  }
  return data as RequestOtpResponse;
}

export async function ecomLogin(phone: string, otp: string): Promise<EcomLoginResponse> {
  const res = await fetch(`${API_BASE}/v1/auth/ecom/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : JSON.stringify(data) || "Login failed";
    throw new Error(msg);
  }
  return data as EcomLoginResponse;
}

export async function refreshAuthTokens(refreshToken: string): Promise<RefreshTokenResponse> {
  const res = await fetch(`${API_BASE}/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Refresh failed";
    throw new Error(msg);
  }
  return data as RefreshTokenResponse;
}

export function persistAuthSession(data: EcomLoginResponse): void {
  if (typeof window === "undefined") return;
  if (data.accessToken) localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, data.accessToken);
  if (data.refreshToken) localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken);
  if (data.user !== undefined) {
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new CustomEvent("auth-changed"));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new CustomEvent("auth-changed"));
}

/** Call when access token may be expired; updates localStorage on success. */
export async function tryRefreshFromStorage(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;
  try {
    const data = await refreshAuthTokens(refreshToken);
    if (data.accessToken) localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, data.accessToken);
    if (data.refreshToken) localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken);
    window.dispatchEvent(new CustomEvent("auth-changed"));
    return true;
  } catch {
    clearAuthSession();
    return false;
  }
}
