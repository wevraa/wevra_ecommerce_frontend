"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { closeDetailPage, useCloseDetailPageOnBack } from "@/lib/orders/closePage";
import { getPublicOrderDetail } from "@/lib/orders/api";
import { buildBillSharePath, buildOrderSharePath } from "@/lib/orders/shareLinks";
import { formatOrderDisplayDate } from "@/lib/orders/format";
import type { EcomOrderDetail } from "@/lib/orders/types";
import styles from "./OrderDetailsPageClient.module.scss";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

const REF_BACKGROUNDS = [styles.r1, styles.r2, styles.r3, styles.r4, styles.r5, styles.r6];
const REFS_PREVIEW_COUNT = 4;

interface OrderDetailsPageClientProps {
  orderId: string;
  shareToken: string;
  fromBillId?: string | null;
}

export default function OrderDetailsPageClient({
  orderId,
  shareToken,
  fromBillId = null,
}: OrderDetailsPageClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<EcomOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllRefs, setShowAllRefs] = useState(false);
  const [barsReady, setBarsReady] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameFromBill = Boolean(fromBillId?.trim());

  // Only exit the page when opened as a standalone share link.
  // When opened from bill DETAILS, allow normal back to the bill.
  useCloseDetailPageOnBack(!cameFromBill);

  const handleBack = () => {
    if (cameFromBill && fromBillId && shareToken.trim()) {
      router.push(buildBillSharePath(fromBillId, shareToken));
      return;
    }
    if (cameFromBill) {
      router.back();
      return;
    }
    closeDetailPage();
  };

  useEffect(() => {
    let cancelled = false;

    if (!shareToken.trim()) {
      setOrder(null);
      setError("Invalid link — missing share token");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getPublicOrderDetail(orderId, shareToken)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load order");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, shareToken]);

  useEffect(() => {
    if (!order) return;
    const t = setTimeout(() => setBarsReady(true), 100);
    return () => clearTimeout(t);
  }, [order]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (text: string) => {
    setToastText(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(null), 1800);
  };

  const handleShare = async () => {
    if (!order || typeof navigator === "undefined") return;
    const url = window.location.href;
    const text = `Order #${order.orderNo} — ${order.orderType}\nExpected: ${formatOrderDisplayDate(order.expectedDate)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Order Summary", text, url });
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      showToast("Link copied");
    } catch {
      showToast("Copy the link from the address bar");
    }
  };

  const pageClass = `${styles.page} ${inter.className}`;

  const header = (
    <header className={styles.head}>
      <button type="button" className={styles.iconBtn} onClick={handleBack} aria-label="Back">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1F1537" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </button>
      <h1>Order Details</h1>
    </header>
  );

  const blobs = (
    <div className={styles.blobs} aria-hidden>
      <span className={styles.b1} />
      <span className={styles.b2} />
    </div>
  );

  if (loading) {
    return (
      <div className={pageClass}>
        {blobs}
        <main className={styles.wrap}>
          {header}
          <div className={styles.loading}>Loading order…</div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={pageClass}>
        {blobs}
        <main className={styles.wrap}>
          {header}
          <div className={styles.errorState}>
            <p>{error ?? "Order not found"}</p>
            <button type="button" onClick={handleBack} className={styles.retryBtn}>
              {cameFromBill ? "Back to bill" : "Close"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const stages = order.productionStages;
  const stageCount = stages.length || 1;
  const segment = 100 / stageCount;
  const percent = Math.max(0, Math.min(100, order.progressPercent || 0));
  const currentStage = stages.findIndex((s) => !s.completed);
  const stageFill = (index: number) => {
    if (stages[index]?.completed) return 100;
    const partial = ((percent - index * segment) / segment) * 100;
    return Math.max(0, Math.min(100, partial));
  };

  const refs = order.designReferences;
  const visibleRefs = showAllRefs ? refs : refs.slice(0, REFS_PREVIEW_COUNT);

  return (
    <div className={pageClass}>
      {blobs}

      <main className={styles.wrap}>
        {header}

        {order.relatedOrders.length > 1 && shareToken ? (
          <div className={styles.tabs}>
            {order.relatedOrders.map((tab) => (
              <Link
                key={tab.id}
                href={buildOrderSharePath(tab.id, shareToken, {
                  fromBillId: fromBillId ?? undefined,
                })}
                className={`${styles.tab} ${tab.id === order.id ? styles.tabOn : ""}`}
              >
                ORDER #{tab.orderNo}
              </Link>
            ))}
          </div>
        ) : null}

        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.heroInfo}>
              <div className={styles.eyebrow}>Customer name</div>
              <div className={styles.customerName}>{order.customerName}</div>
              <div className={styles.design}>{order.orderType}</div>
            </div>
            {order.membershipTier ? (
              <div className={styles.premium}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                  <path d="m12 2 3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z" />
                </svg>
                {order.membershipTier}
              </div>
            ) : null}
          </div>
          <div className={styles.heroBottom}>
            <div>
              <div className={styles.eyebrow}>Expected date</div>
              <b>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {formatOrderDisplayDate(order.expectedDate)}
              </b>
            </div>
            <div>
              <div className={styles.eyebrow}>Order status</div>
              <b>
                <span className={styles.live} aria-hidden />
                {order.status}
              </b>
            </div>
          </div>
        </section>

        {stages.length > 0 ? (
          <>
            <div className={styles.sectionTitle}>
              <h2>Production flow</h2>
              <span className={styles.pill}>{percent}% complete</span>
            </div>
            <section className={styles.flow}>
              <div className={styles.bars} style={{ gridTemplateColumns: `repeat(${stageCount}, 1fr)` }}>
                {stages.map((stage, i) => (
                  <div key={stage.name} className={styles.bar}>
                    <i style={{ width: barsReady ? `${stageFill(i)}%` : 0 }} />
                  </div>
                ))}
              </div>
              <div className={styles.stageNames} style={{ gridTemplateColumns: `repeat(${stageCount}, 1fr)` }}>
                {stages.map((stage, i) => (
                  <span
                    key={stage.name}
                    className={
                      stage.completed ? styles.stageDone : i === currentStage ? styles.stageNow : undefined
                    }
                  >
                    {stage.name}
                  </span>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {refs.length > 0 ? (
          <>
            <div className={styles.sectionTitle}>
              <h2>Design references</h2>
              {refs.length > REFS_PREVIEW_COUNT ? (
                <button type="button" className={styles.linkBtn} onClick={() => setShowAllRefs((v) => !v)}>
                  {showAllRefs ? "Show less ‹" : "View all ›"}
                </button>
              ) : null}
            </div>
            <section className={styles.refs}>
              {visibleRefs.map((ref, i) => (
                <div
                  key={`${ref.label}-${ref.imageUrl}`}
                  className={`${styles.ref} ${REF_BACKGROUNDS[i % REF_BACKGROUNDS.length]}`}
                >
                  {ref.imageUrl ? (
                    <Image
                      src={ref.imageUrl}
                      alt={ref.label}
                      fill
                      className={styles.refImage}
                      sizes="(max-width: 440px) 50vw, 220px"
                      unoptimized={ref.imageUrl.startsWith("blob:")}
                    />
                  ) : null}
                  <div className={styles.caption}>
                    <small>Reference</small>
                    <b>{ref.label}</b>
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : null}

        {order.customizations.length > 0 ? (
          <>
            <div className={styles.sectionTitle}>
              <h2>Customizations</h2>
            </div>
            <section className={styles.grid}>
              {order.customizations.map((item) => (
                <div key={item.label} className={styles.custCard}>
                  <small>{item.label}</small>
                  <b>{item.value}</b>
                </div>
              ))}
            </section>
          </>
        ) : null}

        {order.measurements.length > 0 ? (
          <>
            <div className={styles.sectionTitle}>
              <h2>Detailed measurements</h2>
            </div>
            <div className={styles.unit}>
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C423CF" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                  <rect x="2" y="8" width="20" height="8" rx="2" />
                  <path d="M6 8v4M10 8v3M14 8v4M18 8v3" />
                </svg>
                Unit: {order.measurementUnit}
              </span>
            </div>
            <div className={styles.lock}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8A819F" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Measurement values are hidden to protect customer privacy
            </div>
            <section className={styles.grid}>
              {order.measurements.map((m) => (
                <div key={m.name} className={styles.measCard}>
                  <small>{m.name}</small>
                  <b className={styles.hidden} aria-hidden="true">88</b>
                </div>
              ))}
            </section>
          </>
        ) : null}
      </main>

      <div className={styles.dock}>
        <div className={styles.dockInner}>
          <button type="button" className={styles.shareBtn} onClick={handleShare}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" />
            </svg>
            Share Order Summary
          </button>
        </div>
      </div>

      <div className={`${styles.toast} ${toastText ? styles.toastShow : ""}`} role="status" aria-live="polite">
        {toastText}
      </div>
    </div>
  );
}
