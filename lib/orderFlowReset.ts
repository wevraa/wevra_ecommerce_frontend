const ORDER_FLOW_RESET_KEY = "wevraa-order-flow-reset";

/** Mark that a custom order was sent — select-boutiques should drop stale URL params. */
export function markOrderFlowReset(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ORDER_FLOW_RESET_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Clear the reset flag (e.g. when starting a fresh order from a product). */
export function clearOrderFlowReset(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ORDER_FLOW_RESET_KEY);
  } catch {
    /* ignore */
  }
}

/** Returns true once if a reset was pending, then clears the flag. */
export function consumeOrderFlowReset(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const pending = sessionStorage.getItem(ORDER_FLOW_RESET_KEY) === "1";
    if (pending) sessionStorage.removeItem(ORDER_FLOW_RESET_KEY);
    return pending;
  } catch {
    return false;
  }
}
