/** Format requiredBy ISO as DD MM YYYY (UTC). */
export function formatRequiredBy(iso: string | null | undefined): string {
  if (!iso) return "Not specified";
  try {
    const d = new Date(iso);
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = d.getUTCFullYear();
    return `${dd} ${mm} ${yyyy}`;
  } catch {
    return "Not specified";
  }
}

/** Format bill money strings as INR currency. */
export function formatBillAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "₹0";
  const num = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

/** Local yyyy-mm-dd → requiredBy ISO (UTC midnight). */
export function localDateToRequiredByIso(dateIso: string): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  if (!y || !m || !d) return new Date(dateIso).toISOString();
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
}
