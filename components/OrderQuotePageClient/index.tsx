"use client";

import { useEffect, useMemo, useState } from "react";
import * as Select from "@radix-ui/react-select";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import { formatRequiredDate, useChatStore } from "@/lib/stores/chatStore";
import styles from "./OrderQuotePageClient.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

/** Local calendar date as yyyy-mm-dd (no UTC shift). */
function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** One card per day in the given month. */
function buildMonthDayCells(
  year: number,
  monthIndex: number
): { iso: string; day: string; num: string }[] {
  const n = daysInMonth(year, monthIndex);
  const cells: { iso: string; day: string; num: string }[] = [];
  for (let day = 1; day <= n; day++) {
    const d = new Date(year, monthIndex, day);
    cells.push({
      iso: toIsoDateLocal(d),
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      num: String(day),
    });
  }
  return cells;
}

type MonthSlot = { year: number; monthIndex: number; value: string; label: string };

/** Current calendar month through end of the same year only (no past months). */
function buildMonthsThisYearFrom(from: Date): MonthSlot[] {
  const slots: MonthSlot[] = [];
  const y = from.getFullYear();
  for (let m = from.getMonth(); m <= 11; m++) {
    const d = new Date(y, m, 1);
    const value = `${y}-${String(m + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", { month: "long" });
    slots.push({ year: y, monthIndex: m, value, label });
  }
  return slots;
}

function parseViewYM(ym: string): { year: number; monthIndex: number } {
  const [y, m] = ym.split("-").map(Number);
  return { year: y, monthIndex: (m || 1) - 1 };
}

function isoBelongsToMonth(iso: string, year: number, monthIndex: number): boolean {
  const [sy, sm] = iso.split("-").map(Number);
  return sy === year && sm === monthIndex + 1;
}

export default function OrderQuotePageClient({ boutiqueId }: { boutiqueId?: string }) {
  const router = useRouter();
  const sendQuoteToBoutique = useChatStore((s) => s.sendQuoteToBoutique);
  const now = useMemo(() => new Date(), []);
  const monthSlots = useMemo(() => buildMonthsThisYearFrom(now), [now]);
  const initialYM = monthSlots[0]?.value ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [viewYM, setViewYM] = useState(initialYM);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => toIsoDateLocal(now));

  const { year, monthIndex } = parseViewYM(viewYM);
  const dayCells = useMemo(
    () => buildMonthDayCells(year, monthIndex),
    [year, monthIndex]
  );

  const { selectedBoutiques, orderContext } = useBoutiquesSelectionStore();

  const activeBoutique = useMemo(
    () =>
      boutiqueId
        ? selectedBoutiques.find((b) => b.id === boutiqueId)
        : selectedBoutiques[0],
    [boutiqueId, selectedBoutiques]
  );

  const [productTitle, setProductTitle] = useState("Machine Embroidery Blouse");

  useEffect(() => {
    if (!orderContext.productId) return;
    let cancelled = false;
    fetch(`${API_BASE}/v1/products/${orderContext.productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { title?: string } | null) => {
        if (!cancelled && data?.title) setProductTitle(data.title);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [orderContext.productId]);

  const boutiqueCount = selectedBoutiques.length;
  const boutiqueNames =
    selectedBoutiques.length > 0
      ? selectedBoutiques.map((b) => b.name).join(", ")
      : "No boutiques selected";

  const hasProduct =
    Boolean(orderContext.productImage) ||
    Boolean(orderContext.sleeveDesignImage);

  const hasAddonsSelected = orderContext.hasAddonsSelected === true;
  const hasMeasurementSelected = orderContext.hasMeasurementSelected === true;

  const applyViewYM = (value: string) => {
    setViewYM(value);
    const { year: y, monthIndex: mi } = parseViewYM(value);
    setSelectedDate((prev) => {
      if (!prev) return null;
      return isoBelongsToMonth(prev, y, mi) ? prev : null;
    });
  };

  const handleSend = () => {
    if (!activeBoutique) {
      router.push("/boutiques-selection");
      return;
    }
    if (!selectedDate) return;

    sendQuoteToBoutique(activeBoutique.id, activeBoutique.name, {
      productTitle,
      productImage: orderContext.productImage,
      sleeveDesignImage: orderContext.sleeveDesignImage,
      requiredDateLabel: formatRequiredDate(selectedDate),
      hasMeasurementSelected,
      hasAddonsSelected,
    });

    router.push(`/chat/${encodeURIComponent(activeBoutique.id)}`);
  };

  return (
    <main className={styles.main}>
      {/* ── Header bar with dynamic boutique summary ── */}
      <div className={styles.headerBar}>
        <Link
          href="/boutiques-selection"
          className={styles.backBtn}
          aria-label="Back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className={styles.boutiqueSummary}>
          <div className={styles.iconWrap}>
            <span className={`${styles.circle} ${styles.b1}`} />
            <span className={`${styles.circle} ${styles.b2}`} />
            <span className={`${styles.circle} ${styles.b3}`} />
          </div>
          <div className={styles.summaryText}>
            <p className={styles.summaryTitle}>
              {boutiqueCount > 0
                ? `${boutiqueCount} Boutique${boutiqueCount > 1 ? "s" : ""}`
                : "Boutiques"}
            </p>
            <p className={styles.summarySub}>Selected For Order Quote</p>
            <p className={styles.summarySub} title={boutiqueNames}>
              {boutiqueNames.length > 40
                ? `${boutiqueNames.slice(0, 40)}...`
                : boutiqueNames}
            </p>
          </div>
        </div>
        <Link
          href="/boutiques-selection"
          className={styles.arrowBtn}
          aria-label="View boutiques"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </Link>
      </div>

      <div className={styles.content}>
        {/* ── Date picker ── */}
        <section className={styles.dateSection}>
          <div className={styles.dateLabel}>
            <span className={styles.dateLabelText}>When you Required :</span>
            <div className={styles.monthPicker}>
              <span className={styles.monthPickerLabel} id="quote-month-field-label">
                Current month of the year
              </span>
              <Select.Root value={viewYM} onValueChange={applyViewYM}>
                <Select.Trigger
                  className={styles.monthSelectTrigger}
                  aria-labelledby="quote-month-field-label"
                >
                  <Select.Value placeholder="Select month" />
                  <Select.Icon className={styles.monthSelectIcon} aria-hidden>
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content
                    className={styles.monthSelectContent}
                    position="popper"
                    sideOffset={6}
                    collisionPadding={12}
                  >
                    <Select.Viewport className={styles.monthSelectViewport}>
                      {monthSlots.map((s, i) => {
                        const isCurrentMonth = i === 0;
                        return (
                          <Select.Item
                            key={s.value}
                            value={s.value}
                            className={styles.monthSelectItem}
                            textValue={`${s.label} ${s.year}`}
                          >
                            <div className={styles.monthItemBody}>
                              <Select.ItemText asChild>
                                <span className={styles.monthItemTitle}>
                                  {s.label}
                                  <span className={styles.monthItemYear}> {s.year}</span>
                                </span>
                              </Select.ItemText>
                              {isCurrentMonth ? (
                                <span className={styles.monthItemBadge}>This month</span>
                              ) : null}
                            </div>
                            <Select.ItemIndicator className={styles.monthItemIndicator}>
                              <svg
                                width={14}
                                height={14}
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden
                              >
                                <path
                                  d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </Select.ItemIndicator>
                          </Select.Item>
                        );
                      })}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
          <div className={styles.dateStrip}>
            {dayCells.map((d) => (
              <button
                key={d.iso}
                type="button"
                className={`${styles.dateCard} ${selectedDate === d.iso ? styles.selected : ""}`}
                onClick={() => setSelectedDate(d.iso)}
              >
                <span className={styles.dateDay}>{d.day}</span>
                <span className={styles.dateNum}>{d.num}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Order details card ── */}
        <div className={styles.productCard}>
          <div className={styles.productInfo}>
            <h3 className={styles.productName}>{productTitle}</h3>
            <p
              className={
                hasAddonsSelected ? styles.selectionPositive : styles.addonsWarning
              }
            >
              {hasAddonsSelected ? "Add ons selected" : "No Add-ons Selected"}
            </p>
            <Link href="/addons" className={styles.addonsLink}>
              Add-ons to quote better
              <span aria-hidden>›</span>
            </Link>
            <p
              className={
                hasMeasurementSelected
                  ? styles.selectionPositive
                  : styles.measurementPending
              }
            >
              {hasMeasurementSelected
                ? "Measurement added"
                : "No measurement selected"}
            </p>
            <Link href="/measurement" className={styles.measurementLink}>
              Tap to Select Measurement
              <span aria-hidden>›</span>
            </Link>
          </div>

          {/* Dynamic product images from order context */}
          <div className={styles.productImages}>
            {hasProduct ? (
              <>
                {orderContext.productImage && (
                  <div className={styles.productImageWrap}>
                    <div className={styles.productImage}>
                      <Image
                        src={orderContext.productImage}
                        alt="Fabric"
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <span className={styles.imageLabel}>Fabric</span>
                  </div>
                )}
                {orderContext.sleeveDesignImage && (
                  <div className={styles.productImageWrap}>
                    <div className={styles.productImage}>
                      <Image
                        src={orderContext.sleeveDesignImage}
                        alt="Sleeve Design"
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <span className={styles.imageLabel}>Sleeve Design</span>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.productImage}>
                <Image
                  src="/images/product-5.svg"
                  alt=""
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.btn_wrap}>
          <button
            type="button"
            className={styles.addItemsBtn}
            onClick={() => router.push("/")}
          >
            <span className={styles.addItemsPlus} aria-hidden>
              +
            </span>
            Add Items
          </button>
        </div>

        <div className={styles.footerBtns}>
          <Link href="/boutiques-selection" className={styles.cancelBtn}>
            Cancel
          </Link>
          <button
            type="button"
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!selectedDate || !activeBoutique}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
