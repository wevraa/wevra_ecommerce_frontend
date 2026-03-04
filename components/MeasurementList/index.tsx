"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MeasurementItem } from "@/data/measurement";
import styles from "./MeasurementList.module.scss";

interface MeasurementListProps {
  items: MeasurementItem[];
}

const RULER_MIN = 0;
const RULER_MAX = 60;
const RULER_STEP = 0.25;
const TICKS_COUNT = 120;

function RulerSegment() {
  const ticks = Array.from({ length: 25 }, (_, i) => (
    <span
      key={i}
      className={`${styles.tick} ${i % 5 === 0 ? styles.tickMajor : ""}`}
    />
  ));
  return <div className={styles.rulerLine}>{ticks}</div>;
}

function valueToScrollOffset(value: number, scrollWidth: number, clientWidth: number): number {
  const range = RULER_MAX - RULER_MIN;
  const fraction = (value - RULER_MIN) / range;
  const maxScroll = Math.max(0, scrollWidth - clientWidth);
  return fraction * maxScroll;
}

function scrollOffsetToValue(scrollLeft: number, scrollWidth: number, clientWidth: number): number {
  const maxScroll = Math.max(0, scrollWidth - clientWidth);
  const fraction = maxScroll > 0 ? scrollLeft / maxScroll : 0;
  const range = RULER_MAX - RULER_MIN;
  let value = RULER_MIN + fraction * range;
  value = Math.round(value / RULER_STEP) * RULER_STEP;
  return Math.max(RULER_MIN, Math.min(RULER_MAX, value));
}

export default function MeasurementList({ items }: MeasurementListProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.value]))
  );
  const rulerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingRef = useRef<Record<string, boolean>>({});
  const touchStartX = useRef<Record<string, number>>({});
  const touchStartScrollLeft = useRef<Record<string, number>>({});
  const activeTouchRulerId = useRef<string | null>(null);

  const updateValue = useCallback((id: string, value: number) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  useLayoutEffect(() => {
    const syncScroll = () => {
      items.forEach((item) => {
        const el = rulerRefs.current[item.id];
        if (!el) return;
        const value = values[item.id] ?? item.value;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return;
        const scrollLeft = valueToScrollOffset(value, el.scrollWidth, el.clientWidth);
        if (!isScrollingRef.current[item.id]) {
          el.scrollLeft = scrollLeft;
        }
      });
    };
    syncScroll();
    const id = requestAnimationFrame(syncScroll);
    return () => cancelAnimationFrame(id);
  }, [items]);

  const handleScroll = useCallback(
    (id: string) => {
      const el = rulerRefs.current[id];
      if (!el) return;
      isScrollingRef.current[id] = true;
      const value = scrollOffsetToValue(el.scrollLeft, el.scrollWidth, el.clientWidth);
      updateValue(id, value);
    },
    [updateValue]
  );

  const handleScrollEnd = useCallback((id: string) => {
    isScrollingRef.current[id] = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>, id: string) => {
      const el = rulerRefs.current[id];
      if (!el) return;
      const dx = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      el.scrollLeft += dx;
      e.preventDefault();
    },
    []
  );

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>, id: string) => {
    const el = rulerRefs.current[id];
    if (!el) return;
    activeTouchRulerId.current = id;
    touchStartX.current[id] = e.touches[0].clientX;
    touchStartScrollLeft.current[id] = el.scrollLeft;
  }, []);

  const handleTouchMove = useCallback(
    (id: string, clientX: number) => {
      const el = rulerRefs.current[id];
      if (!el || touchStartX.current[id] == null) return;
      const dx = touchStartX.current[id] - clientX;
      el.scrollLeft = touchStartScrollLeft.current[id] + dx;
    },
    []
  );

  const handleTouchEnd = useCallback((id: string) => {
    activeTouchRulerId.current = null;
    touchStartX.current[id] = undefined as unknown as number;
    handleScrollEnd(id);
  }, [handleScrollEnd]);

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

  return (
    <div className={styles.wrap}>
      <p className={styles.scrollHint}>
        <span aria-hidden>→</span> Scroll to Select
      </p>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.bar}>
              <span className={styles.barName}>{item.name}</span>
              <span className={styles.barValue}>
                {(values[item.id] ?? item.value).toFixed(2)}
              </span>
            </div>
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
              onMouseUp={() => handleScrollEnd(item.id)}
              role="slider"
              aria-valuenow={values[item.id] ?? item.value}
              aria-valuemin={RULER_MIN}
              aria-valuemax={RULER_MAX}
              aria-label={`${item.name} measurement`}
              tabIndex={0}
            >
              <div className={styles.rulerTrack}>
                {Array.from({ length: TICKS_COUNT }, (_, i) => (
                  <RulerSegment key={i} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
