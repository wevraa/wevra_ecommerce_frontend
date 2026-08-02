"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MeasurementItem } from "@/data/measurement";
import styles from "./MeasurementList.module.scss";

interface MeasurementListProps {
  items: MeasurementItem[];
  /** Fires when the expanded measurement changes (for guide image). */
  onActiveChange?: (item: MeasurementItem | null) => void;
  /** Fires whenever draft ruler values change (parent commits on Save). */
  onDraftChange?: (
    measurements: { name: string; value: number; unit: string }[]
  ) => void;
}

const RULER_MIN = 0;
const RULER_MAX = 60;
const FRACTIONS = [
  { label: "¼", value: 0.25 },
  { label: "½", value: 0.5 },
  { label: "¾", value: 0.75 },
] as const;

/** Width of one integer step (two half-ticks). */
const TICK_STEP_PX = 24;
const HALF_TICK_PX = TICK_STEP_PX / 2;

function splitValue(value: number): { whole: number; frac: number } {
  const clamped = Math.max(RULER_MIN, Math.min(RULER_MAX, value));
  const whole = Math.floor(clamped + 1e-9);
  const rawFrac = clamped - whole;
  if (rawFrac < 0.125) return { whole, frac: 0 };
  if (rawFrac < 0.375) return { whole, frac: 0.25 };
  if (rawFrac < 0.625) return { whole, frac: 0.5 };
  if (rawFrac < 0.875) return { whole, frac: 0.75 };
  return { whole: Math.min(RULER_MAX, whole + 1), frac: 0 };
}

function formatFraction(frac: number): string {
  if (frac === 0.25) return "¼";
  if (frac === 0.5) return "½";
  if (frac === 0.75) return "¾";
  return "";
}

function combineValue(whole: number, frac: number): number {
  return Math.max(RULER_MIN, Math.min(RULER_MAX, whole + frac));
}

function wholeToScrollLeft(whole: number): number {
  return (whole - RULER_MIN) * TICK_STEP_PX;
}

function scrollLeftToWhole(scrollLeft: number): number {
  const whole = Math.round(scrollLeft / TICK_STEP_PX) + RULER_MIN;
  return Math.max(RULER_MIN, Math.min(RULER_MAX, whole));
}

function ValueDisplay({ value }: { value: number }) {
  const { whole, frac } = splitValue(value);
  const fracLabel = formatFraction(frac);
  return (
    <span className={styles.valueDisplay}>
      <span className={styles.valueWhole}>{whole}</span>
      {fracLabel ? <span className={styles.valueFrac}>{fracLabel}</span> : null}
    </span>
  );
}

export default function MeasurementList({
  items,
  onActiveChange,
  onDraftChange,
}: MeasurementListProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.value]))
  );
  const [expandedId, setExpandedId] = useState<string | null>(() => items[0]?.id ?? null);

  const rulerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingRef = useRef<Record<string, boolean>>({});
  const touchStartX = useRef<Record<string, number>>({});
  const touchStartScrollLeft = useRef<Record<string, number>>({});
  const activeTouchRulerId = useRef<string | null>(null);
  const wheelAccumRef = useRef<Record<string, number>>({});
  const wheelRafRef = useRef<number | null>(null);
  const wheelEndTimerRef = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});
  const onActiveChangeRef = useRef(onActiveChange);
  const onDraftChangeRef = useRef(onDraftChange);
  onActiveChangeRef.current = onActiveChange;
  onDraftChangeRef.current = onDraftChange;

  const updateValue = useCallback((id: string, value: number) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const updateWholeKeepingFrac = useCallback((id: string, whole: number) => {
    setValues((prev) => {
      const current = prev[id] ?? 0;
      const { frac } = splitValue(current);
      return { ...prev, [id]: combineValue(whole, frac) };
    });
  }, []);

  const syncRulerToValue = useCallback((id: string, value: number, smooth = false) => {
    const el = rulerRefs.current[id];
    if (!el) return;
    const { whole } = splitValue(value);
    const target = wholeToScrollLeft(whole);
    if (Math.abs(el.scrollLeft - target) < 0.5) return;
    if (smooth && typeof el.scrollTo === "function") {
      el.scrollTo({ left: target, behavior: "smooth" });
    } else {
      el.scrollLeft = target;
    }
  }, []);

  useLayoutEffect(() => {
    if (!expandedId) return;
    const value = values[expandedId];
    if (value == null) return;
    const frame = requestAnimationFrame(() => {
      syncRulerToValue(expandedId, value, false);
    });
    return () => cancelAnimationFrame(frame);
    // Only re-sync when expanding / items change — not on every value tweak while scrolling
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedId, items, syncRulerToValue]);

  useEffect(() => {
    setValues(Object.fromEntries(items.map((item) => [item.id, item.value])));
    setExpandedId((prev) => {
      if (prev && items.some((i) => i.id === prev)) return prev;
      return items[0]?.id ?? null;
    });
  }, [items]);

  useEffect(() => {
    const active = items.find((i) => i.id === expandedId) ?? items[0] ?? null;
    onActiveChangeRef.current?.(active);
  }, [expandedId, items]);

  useEffect(() => {
    const measurements = items.map((item) => ({
      name: item.name,
      value: values[item.id] ?? item.value,
      unit: item.unit ?? "INCHES",
    }));
    onDraftChangeRef.current?.(measurements);
  }, [values, items]);

  const snapRuler = useCallback(
    (id: string) => {
      const el = rulerRefs.current[id];
      if (!el) return;
      const whole = scrollLeftToWhole(el.scrollLeft);
      const target = wholeToScrollLeft(whole);
      isScrollingRef.current[id] = true;
      el.scrollTo({ left: target, behavior: "smooth" });
      updateWholeKeepingFrac(id, whole);
      window.setTimeout(() => {
        isScrollingRef.current[id] = false;
      }, 280);
    },
    [updateWholeKeepingFrac]
  );

  const handleScroll = useCallback(
    (id: string) => {
      const el = rulerRefs.current[id];
      if (!el) return;
      isScrollingRef.current[id] = true;
      updateWholeKeepingFrac(id, scrollLeftToWhole(el.scrollLeft));
    },
    [updateWholeKeepingFrac]
  );

  const flushWheelAccum = useCallback(() => {
    wheelRafRef.current = null;
    for (const id of Object.keys(wheelAccumRef.current)) {
      const acc = wheelAccumRef.current[id];
      if (!acc) continue;
      wheelAccumRef.current[id] = 0;
      const el = rulerRefs.current[id];
      if (!el) continue;
      isScrollingRef.current[id] = true;
      el.scrollLeft += acc;
      updateWholeKeepingFrac(id, scrollLeftToWhole(el.scrollLeft));
    }
  }, [updateWholeKeepingFrac]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>, id: string) => {
      const el = rulerRefs.current[id];
      if (!el) return;
      e.preventDefault();
      const raw = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      wheelAccumRef.current[id] = (wheelAccumRef.current[id] || 0) + raw * 0.55;
      if (wheelRafRef.current === null) {
        wheelRafRef.current = requestAnimationFrame(flushWheelAccum);
      }
      const prevT = wheelEndTimerRef.current[id];
      if (prevT) clearTimeout(prevT);
      wheelEndTimerRef.current[id] = setTimeout(() => {
        snapRuler(id);
        wheelEndTimerRef.current[id] = undefined;
      }, 120);
    },
    [flushWheelAccum, snapRuler]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>, id: string) => {
    const el = rulerRefs.current[id];
    if (!el) return;
    activeTouchRulerId.current = id;
    touchStartX.current[id] = e.touches[0].clientX;
    touchStartScrollLeft.current[id] = el.scrollLeft;
  }, []);

  const handleTouchMove = useCallback((id: string, clientX: number) => {
    const el = rulerRefs.current[id];
    if (!el || touchStartX.current[id] == null) return;
    const dx = touchStartX.current[id] - clientX;
    el.scrollLeft = touchStartScrollLeft.current[id] + dx;
  }, []);

  const handleTouchEnd = useCallback(
    (id: string) => {
      activeTouchRulerId.current = null;
      touchStartX.current[id] = undefined as unknown as number;
      snapRuler(id);
    },
    [snapRuler]
  );

  useEffect(() => {
    const touchMoveOpts = { passive: false as const };
    const onTouchMove = (e: TouchEvent) => {
      const id = activeTouchRulerId.current;
      if (id && e.cancelable) {
        handleTouchMove(id, e.touches[0].clientX);
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", onTouchMove, touchMoveOpts);
    return () => document.removeEventListener("touchmove", onTouchMove);
  }, [handleTouchMove]);

  useEffect(() => {
    return () => {
      if (wheelRafRef.current !== null) cancelAnimationFrame(wheelRafRef.current);
      for (const t of Object.values(wheelEndTimerRef.current)) {
        if (t) clearTimeout(t);
      }
    };
  }, []);

  const setFraction = (id: string, frac: number) => {
    const current = values[id] ?? 0;
    const { whole, frac: currentFrac } = splitValue(current);
    const nextFrac = currentFrac === frac ? 0 : frac;
    updateValue(id, combineValue(whole, nextFrac));
  };

  const visualTicks = Array.from(
    { length: (RULER_MAX - RULER_MIN) * 2 + 1 },
    (_, i) => RULER_MIN + i * 0.5
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        {items.map((item) => {
          const value = values[item.id] ?? item.value;
          const { frac } = splitValue(value);
          const expanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`${styles.card} ${expanded ? styles.cardExpanded : ""}`}
            >
              <button
                type="button"
                className={styles.cardHeader}
                onClick={() => setExpandedId(item.id)}
                aria-expanded={expanded}
              >
                <span className={styles.barName}>{item.name}</span>
                <ValueDisplay value={value} />
              </button>

              {expanded ? (
                <div className={styles.cardBody}>
                  <div className={styles.rulerShell}>
                    <div className={styles.rulerCenter} aria-hidden />
                    <div
                      ref={(r) => {
                        rulerRefs.current[item.id] = r;
                      }}
                      data-ruler-id={item.id}
                      className={styles.ruler}
                      onScroll={() => handleScroll(item.id)}
                      onWheel={(e) => handleWheel(e, item.id)}
                      onTouchStart={(e) => handleTouchStart(e, item.id)}
                      onTouchEnd={() => handleTouchEnd(item.id)}
                      onMouseUp={() => snapRuler(item.id)}
                      role="slider"
                      aria-valuenow={value}
                      aria-valuemin={RULER_MIN}
                      aria-valuemax={RULER_MAX}
                      aria-label={`${item.name} measurement`}
                      tabIndex={0}
                    >
                      <div className={styles.rulerTrack}>
                        {visualTicks.map((n) => {
                          const isInteger = Number.isInteger(n);
                          const isMajor = isInteger && n % 5 === 0;
                          return (
                            <div
                              key={n}
                              className={`${styles.tickCell} ${
                                isInteger ? styles.tickCellSnap : ""
                              }`}
                              style={{ width: HALF_TICK_PX }}
                            >
                              <span
                                className={`${styles.tick} ${
                                  isMajor
                                    ? styles.tickMajor
                                    : isInteger
                                      ? styles.tickTall
                                      : styles.tickShort
                                }`}
                                aria-hidden
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className={styles.fracRow} role="group" aria-label="Fraction">
                    {FRACTIONS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        className={`${styles.fracBtn} ${
                          frac === f.value ? styles.fracBtnActive : ""
                        }`}
                        aria-pressed={frac === f.value}
                        onClick={() => setFraction(item.id, f.value)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
