"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Select from "@radix-ui/react-select";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import { getAccessToken, getAuthUserId } from "@/lib/auth";
import { localDateToRequiredByIso } from "@/lib/chat/format";
import type { CustomerOrderRequestInput, ChatAddon, ChatMeasurement } from "@/lib/chat/types";
import {
  prepareAndCachePendingOrder,
  sendOrderRequestViaChat,
  startChatWithTailor,
  ChatUnauthorizedError,
} from "@/lib/chat/startChat";
import { ChatApiError } from "@/lib/chat/types";
import { sanitizeMeasurementsForApi } from "@/lib/chat/orderRequest";
import {
  useBoutiquesSelectionStore,
  MAX_BOUTIQUE_SELECTION,
  resetBoutiquesSelection,
  type OrderAddon,
  type OrderContext,
} from "@/lib/stores/boutiquesSelectionStore";
import {
  resetBoutiqueOrderImages,
  useBoutiqueOrderStore,
} from "@/lib/stores/boutiqueOrderStore";
import { buildAddonsHref } from "@/lib/addonsNavigation";
import { markOrderFlowReset } from "@/lib/orderFlowReset";
import { navigateBack } from "@/lib/navigateBack";
import type { ApiTailor } from "@/lib/api";
import styles from "./OrderQuotePageClient.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";
const PLACEHOLDER_IMAGE = "/images/placeholder-rect.svg";

/** All measurement rows selected on select-boutiques / measurement page. */
function measurementsForSend(ctx: OrderContext): ChatMeasurement[] {
  return sanitizeMeasurementsForApi(ctx.measurements) ?? [];
}

/** Accessory toggles + hanging/drawing reference images. */
function addonsForSend(
  ctx: OrderContext,
  slotMap: Record<string, Record<string, string>>
): ChatAddon[] {
  const fromToggles: OrderAddon[] = (ctx.addons ?? []).filter(
    (a) => Boolean(a?.optionName) && Boolean(a?.subOptionName)
  );

  const images: ChatAddon[] = [];
  const seen = new Set(
    fromToggles.map((a) => `${a.optionName}::${a.subOptionName}::${a.imageUrl ?? ""}`)
  );

  for (const bySlot of Object.values(slotMap)) {
    for (const [slotId, url] of Object.entries(bySlot ?? {})) {
      if (!url) continue;
      let optionName = "";
      let subOptionName = "";
      if (slotId.startsWith("hanging-")) {
        optionName = "Hanging";
        subOptionName = slotId.replace(/^hanging-/, "");
      } else if (slotId.startsWith("drawing-")) {
        optionName = "Drawing";
        subOptionName = slotId.replace(/^drawing-/, "");
      } else {
        continue;
      }
      const key = `${optionName}::${subOptionName}::${url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      images.push({ optionName, subOptionName, imageUrl: url });
    }
  }

  return [
    ...fromToggles.map((a) => ({
      optionName: a.optionName,
      subOptionName: a.subOptionName,
      ...(a.imageUrl ? { imageUrl: a.imageUrl } : {}),
    })),
    ...images,
  ];
}

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
  monthIndex: number,
  todayIso: string
): { iso: string; day: string; num: string; disabled: boolean }[] {
  const n = daysInMonth(year, monthIndex);
  const cells: { iso: string; day: string; num: string; disabled: boolean }[] = [];
  for (let day = 1; day <= n; day++) {
    const d = new Date(year, monthIndex, day);
    const iso = toIsoDateLocal(d);
    cells.push({
      iso,
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      num: String(day),
      disabled: iso < todayIso,
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

function formatReviewCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k Reviews`;
  }
  return `${n} Reviews`;
}

interface OrderQuotePageClientProps {
  tailors?: ApiTailor[];
}

export default function OrderQuotePageClient({
  tailors = [],
}: OrderQuotePageClientProps) {
  const router = useRouter();
  const boutiqueSectionRef = useRef<HTMLElement | null>(null);
  const dateSectionRef = useRef<HTMLElement | null>(null);
  const [sending, setSending] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBoutiqueId, setActiveBoutiqueId] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const monthSlots = useMemo(() => buildMonthsThisYearFrom(now), [now]);
  const initialYM =
    monthSlots[0]?.value ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [viewYM, setViewYM] = useState(initialYM);
  /** Must be explicitly chosen before Send is allowed. */
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayIso = useMemo(() => toIsoDateLocal(now), [now]);
  const { year, monthIndex } = parseViewYM(viewYM);
  const dayCells = useMemo(
    () => buildMonthDayCells(year, monthIndex, todayIso),
    [year, monthIndex, todayIso]
  );

  const {
    selectedBoutiques,
    orderContext,
    setOrderContext,
    toggleBoutique,
  } = useBoutiquesSelectionStore();
  const selectedImageByProductAndSlot = useBoutiqueOrderStore(
    (s) => s.selectedImageByProductAndSlot
  );

  const [productTitle, setProductTitle] = useState("Machine Embroidery Blouse");

  useEffect(() => {
    if (!orderContext.productId) return;
    let cancelled = false;
    fetch(`${API_BASE}/v1/products/${orderContext.productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { title?: string; category?: { name?: string } } | null) => {
        if (cancelled || !data) return;
        if (data.title) setProductTitle(data.title);
        // Don't overwrite tailor category / order-type selections from select-boutiques
        if (!orderContext.tailorCategoryId && !orderContext.orderTypeId) {
          setOrderContext({
            category: data.category?.name ?? data.title,
            orderTypes: data.title ? [data.title] : undefined,
          });
        } else if (!orderContext.category && data.category?.name) {
          setOrderContext({ category: data.category.name });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [
    orderContext.productId,
    orderContext.tailorCategoryId,
    orderContext.orderTypeId,
    orderContext.category,
    setOrderContext,
  ]);

  const selectedIds = useMemo(
    () => new Set(selectedBoutiques.map((b) => b.id)),
    [selectedBoutiques]
  );

  const measurementsPayload = useMemo(
    () => measurementsForSend(orderContext),
    [orderContext]
  );
  const addonsPayload = useMemo(
    () => addonsForSend(orderContext, selectedImageByProductAndSlot),
    [orderContext, selectedImageByProductAndSlot]
  );

  const hasAddonsSelected =
    orderContext.hasAddonsSelected === true || addonsPayload.length > 0;
  const hasMeasurementSelected =
    orderContext.hasMeasurementSelected === true ||
    measurementsPayload.length > 0 ||
    Boolean(orderContext.selectedSize || orderContext.selectedPresetId);

  const addonsHref = buildAddonsHref({
    returnTo: "order-quote",
    productId: orderContext.productId,
    productImage: orderContext.productImage,
  });

  const quoteItems = useMemo(() => {
    const items: { id: string; title: string; image: string }[] = [];
    if (orderContext.productImage) {
      items.push({
        id: "fabric",
        title: productTitle,
        image: orderContext.productImage,
      });
    }
    if (orderContext.sleeveDesignImage) {
      items.push({
        id: "sleeve",
        title: productTitle,
        image: orderContext.sleeveDesignImage,
      });
    }
    if (items.length === 0) {
      items.push({
        id: "default",
        title: productTitle,
        image: "/images/product-5.svg",
      });
    }
    return items;
  }, [orderContext.productImage, orderContext.sleeveDesignImage, productTitle]);

  /** All boutiques from backend, selected first. */
  const boutiqueCards = useMemo(() => {
    const mapped = tailors.map((t, index) => {
      const reviewSeed = 800 + ((t.id.charCodeAt(0) || 0) % 7) * 400;
      const exp = Number(t.experience);
      return {
        id: t.id,
        name: t.name,
        phone: t.phone,
        address: t.addressLine1,
        image: PLACEHOLDER_IMAGE,
        ordersCompleted: Number.isFinite(exp) ? Math.max(50, exp * 40) : 200,
        holdingOrders: 2 + (index % 5),
        reviewCount: reviewSeed,
        selected: selectedIds.has(t.id),
      };
    });
    return mapped.sort((a, b) => Number(b.selected) - Number(a.selected));
  }, [tailors, selectedIds]);

  const filteredBoutiqueCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return boutiqueCards;
    return boutiqueCards.filter((b) => b.name.toLowerCase().includes(q));
  }, [boutiqueCards, searchQuery]);

  const applyViewYM = (value: string) => {
    setViewYM(value);
    const { year: y, monthIndex: mi } = parseViewYM(value);
    setSelectedDate((prev) => {
      if (!prev) return null;
      return isoBelongsToMonth(prev, y, mi) ? prev : null;
    });
  };

  const selectBoutiquesFallback = () => {
    const params = new URLSearchParams();
    if (orderContext.productId) params.set("productId", orderContext.productId);
    if (orderContext.productImage) params.set("image", orderContext.productImage);
    return params.size > 0
      ? `/select-boutiques?${params.toString()}`
      : "/select-boutiques";
  };

  const goToSelectBoutiques = () => {
    navigateBack(router, selectBoutiquesFallback());
  };

  const handleCancel = () => {
    navigateBack(router, selectBoutiquesFallback());
  };

  const scrollToBoutiques = () => {
    boutiqueSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToDate = () => {
    dateSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleToggleBoutique = (b: {
    id: string;
    name: string;
    phone?: string;
    address?: string;
  }) => {
    toggleBoutique({
      id: b.id,
      name: b.name,
      phone: b.phone,
      address: b.address,
    });
    setActiveBoutiqueId(b.id);
  };

  const handleSend = async () => {
    if (selectedBoutiques.length === 0) {
      setSendError("Select at least one boutique before sending.");
      scrollToBoutiques();
      return;
    }
    if (!selectedDate) {
      setSendError("Please select a delivery date before sending.");
      scrollToDate();
      return;
    }
    if (sending) return;

    if (!getAccessToken()) {
      setLoginOpen(true);
      return;
    }

    setSending(true);
    setSendError(null);
    try {
      let firstConversationId: string | null = null;

      for (const boutique of selectedBoutiques) {
        const conversation = await startChatWithTailor(boutique.id);

        const orderInput: CustomerOrderRequestInput = {
          category: orderContext.category ?? productTitle,
          orderTypes: orderContext.orderTypes?.length
            ? orderContext.orderTypes
            : [productTitle],
          productImage: orderContext.productImage,
          sleeveDesignImage: orderContext.sleeveDesignImage,
          // Always send every selected measurement / addon value from select-boutiques
          measurements: measurementsPayload,
          addons: addonsPayload,
          requiredBy: localDateToRequiredByIso(selectedDate),
          description: `Order quote for ${boutique.name}`,
        };

        prepareAndCachePendingOrder(conversation.id, orderInput, getAuthUserId());
        await sendOrderRequestViaChat(conversation.id, orderInput);

        if (!firstConversationId) firstConversationId = conversation.id;
      }

      if (firstConversationId) {
        const chatHref = `/chat/${encodeURIComponent(firstConversationId)}`;

        // Wipe order state + mark select-boutiques to drop stale URL params
        markOrderFlowReset();
        resetBoutiquesSelection();
        resetBoutiqueOrderImages();

        router.push(chatHref);
        // Hard fallback if soft navigation does not land on chat
        window.setTimeout(() => {
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/chat/")) {
            window.location.assign(chatHref);
          }
        }, 400);
        return;
      }
    } catch (e) {
      if (e instanceof ChatUnauthorizedError) {
        setLoginOpen(true);
      } else {
        setSendError(
          e instanceof ChatApiError || e instanceof Error
            ? e.message
            : "Failed to send order request"
        );
      }
    } finally {
      setSending(false);
    }
  };

  const selectedMonthLabel =
    monthSlots.find((s) => s.value === viewYM)?.label ?? "Month";
  const selectedCount = selectedBoutiques.length;
  const selectionAtMax = selectedCount >= MAX_BOUTIQUE_SELECTION;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <button
          type="button"
          onClick={goToSelectBoutiques}
          className={styles.backBtn}
          aria-label="Back"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.headerTitle}>Order Preview</h1>
        <span className={styles.headerSpacer} aria-hidden />
      </header>

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search boutiques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search boutiques"
        />
        <span className={styles.locationIcon} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
      </div>

      <div className={styles.content}>
        {sendError ? (
          <p className={styles.sendError} role="alert">
            {sendError}
          </p>
        ) : null}

        <section className={styles.sendingSection}>
          <div className={styles.sendingHeader}>
            <div>
              <p className={styles.sendingLabel}>Sending Request To</p>
              {selectedCount > 0 ? (
                <p className={styles.sendingCount}>
                  {selectedCount} Boutique{selectedCount === 1 ? "" : "s"}
                </p>
              ) : (
                <p className={styles.sendingEmpty}>No boutique selected</p>
              )}
            </div>
            {selectedCount > 0 ? (
              <button
                type="button"
                className={styles.viewAllBtn}
                onClick={scrollToBoutiques}
              >
                View All
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ) : null}
          </div>
          {selectedCount > 0 ? (
            <div className={styles.chipRow} role="list">
              {selectedBoutiques.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  role="listitem"
                  className={`${styles.chip} ${
                    (activeBoutiqueId ?? selectedBoutiques[0]?.id) === b.id
                      ? styles.chipActive
                      : ""
                  }`}
                  onClick={() => {
                    setActiveBoutiqueId(b.id);
                    scrollToBoutiques();
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className={styles.dateSection} ref={dateSectionRef}>
          <div className={styles.dateLabel}>
            <span className={styles.dateLabelText}>Delivery Required By</span>
            <div className={styles.monthPicker}>
              <span className={styles.srOnly} id="quote-month-field-label">
                Select month
              </span>
              <Select.Root value={viewYM} onValueChange={applyViewYM}>
                <Select.Trigger
                  className={styles.monthSelectTrigger}
                  aria-labelledby="quote-month-field-label"
                >
                  <Select.Value placeholder="Select month">
                    {selectedMonthLabel}
                  </Select.Value>
                  <Select.Icon className={styles.monthSelectIcon} aria-hidden>
                    <svg
                      width={14}
                      height={14}
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
                disabled={d.disabled}
                className={`${styles.dateCard} ${selectedDate === d.iso ? styles.selected : ""} ${
                  d.disabled ? styles.dateDisabled : ""
                }`}
                onClick={() => {
                  if (d.disabled) return;
                  setSelectedDate(d.iso);
                  setSendError(null);
                }}
              >
                <span className={styles.dateDay}>{d.day}</span>
                <span className={styles.dateNum}>{d.num}</span>
              </button>
            ))}
          </div>
          {!selectedDate ? (
            <p className={styles.dateHint}>Select a delivery date to enable Send.</p>
          ) : null}
        </section>

        <section className={styles.itemsSection}>
          <div className={styles.itemsHeader}>
            <h2 className={styles.sectionTitle}>Items for Quote</h2>
            <span className={styles.itemsBadge}>
              {quoteItems.length} Item{quoteItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className={styles.itemList}>
            {quoteItems.map((item) => (
              <article key={item.id} className={styles.itemCard}>
                <div className={styles.itemThumb}>
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="64px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className={styles.itemBody}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <Link
                    href={addonsHref}
                    className={`${styles.statusRow} ${
                      hasAddonsSelected ? styles.statusOk : styles.statusMuted
                    }`}
                  >
                    <span className={styles.statusLeft}>
                      <span className={styles.statusIcon} aria-hidden>
                        {hasAddonsSelected ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                        )}
                      </span>
                      {hasAddonsSelected ? "Add-ons selected" : "No Add-ons selected"}
                    </span>
                    <span aria-hidden>›</span>
                  </Link>
                  <Link
                    href={
                      orderContext.orderTypeId
                        ? `/measurement?subcategoryId=${encodeURIComponent(orderContext.orderTypeId)}`
                        : "/measurement"
                    }
                    className={`${styles.statusRow} ${
                      hasMeasurementSelected ? styles.statusOk : styles.statusMuted
                    }`}
                  >
                    <span className={styles.statusLeft}>
                      <span className={styles.statusIcon} aria-hidden>
                        {hasMeasurementSelected ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                        )}
                      </span>
                      {hasMeasurementSelected
                        ? "Measurement Added"
                        : "No measurement selected"}
                    </span>
                    <span aria-hidden>›</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className={styles.addMoreBtn}
            onClick={() => router.push(addonsHref)}
          >
            <span className={styles.addMorePlus} aria-hidden>
              +
            </span>
            Add more items
          </button>
        </section>

        <section className={styles.boutiqueSection} ref={boutiqueSectionRef}>
          <h2 className={styles.sectionTitle}>Select Boutique</h2>
          {filteredBoutiqueCards.length === 0 ? (
            <p className={styles.noSearchResults}>
              {tailors.length === 0
                ? "No boutiques available right now."
                : "No boutiques match your search."}
            </p>
          ) : (
            <div className={styles.boutiqueList}>
              {filteredBoutiqueCards.map((b) => {
                const isSelected = b.selected;
                const disableSelect = selectionAtMax && !isSelected;
                return (
                  <article
                    key={b.id}
                    className={`${styles.boutiqueCard} ${
                      isSelected ? styles.boutiqueCardActive : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.boutiqueImageWrap}
                      onClick={() => {
                        if (disableSelect) return;
                        handleToggleBoutique(b);
                      }}
                      disabled={disableSelect}
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? "Deselect" : "Select"} ${b.name}`}
                    >
                      <Image
                        src={b.image}
                        alt=""
                        fill
                        className={styles.boutiqueImage}
                        sizes="(max-width: 768px) 100vw, 480px"
                      />
                      <span
                        className={`${styles.checkCircle} ${
                          isSelected ? styles.checkCircleOn : ""
                        }`}
                        aria-hidden
                      >
                        {isSelected ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                    <div className={styles.boutiqueInfo}>
                      <div className={styles.boutiqueInfoTop}>
                        <h3 className={styles.boutiqueName}>{b.name}</h3>
                        <span className={styles.reviewBadge}>
                          ★ {formatReviewCount(b.reviewCount)}
                        </span>
                      </div>
                      <p className={styles.boutiqueMeta}>
                        {b.ordersCompleted} orders Completed • Holding{" "}
                        {b.holdingOrders} Orders
                      </p>
                      <button
                        type="button"
                        className={`${styles.viewDetailsBtn} ${
                          isSelected ? styles.viewDetailsBtnSolid : ""
                        }`}
                        onClick={() => {
                          if (disableSelect) return;
                          handleToggleBoutique(b);
                        }}
                        disabled={disableSelect}
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className={styles.footerBtns}>
          <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!selectedDate || selectedCount === 0 || sending}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </main>
  );
}
