import { formatRequiredBy, formatBillAmount } from "@/lib/chat/format";

/** Display date like "05 May 2021". */
export function formatOrderDisplayDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return formatRequiredBy(iso);
  }
}

/** Short date for bill cards: "05 Jun 2021". */
export function formatBillShortDate(iso: string | null | undefined): string {
  return formatOrderDisplayDate(iso);
}

/** Due date badge: "12 JUN". */
export function formatDueBadge(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }).toUpperCase();
    return `${day} ${month}`;
  } catch {
    return "—";
  }
}

export function formatLocationLine(details: {
  city?: string;
  state?: string;
  pincode?: string;
}): string {
  const parts = [details.city, details.state, details.pincode].filter(Boolean);
  return parts.join(" • ").toUpperCase();
}

export { formatBillAmount };
