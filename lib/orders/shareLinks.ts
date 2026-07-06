/** Customer-facing share URL paths (prepend origin in share messages). */
export function buildBillSharePath(billId: string, shareToken: string): string {
  const params = new URLSearchParams({ token: shareToken });
  return `/bill/${encodeURIComponent(billId)}?${params.toString()}`;
}

export function buildOrderSharePath(orderId: string, shareToken: string): string {
  const params = new URLSearchParams({ token: shareToken });
  return `/order/${encodeURIComponent(orderId)}?${params.toString()}`;
}
