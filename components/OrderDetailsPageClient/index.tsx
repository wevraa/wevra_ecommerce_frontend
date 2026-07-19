"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { closeDetailPage, useCloseDetailPageOnBack } from "@/lib/orders/closePage";
import { getPublicOrderDetail } from "@/lib/orders/api";
import { buildBillSharePath, buildOrderSharePath } from "@/lib/orders/shareLinks";
import { formatOrderDisplayDate } from "@/lib/orders/format";
import type { EcomOrderDetail } from "@/lib/orders/types";
import styles from "./OrderDetailsPageClient.module.scss";

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

  const handleShare = async () => {
    if (!order || typeof navigator === "undefined") return;
    const text = `Order #${order.orderNo} — ${order.orderType}\nExpected: ${formatOrderDisplayDate(order.expectedDate)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Order Summary", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* user cancelled */
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.iconBtn} onClick={handleBack} aria-label="Back">
            ←
          </button>
          <h1 className={styles.headerTitle}>Order Details</h1>
          <div className={styles.headerActions} />
        </header>
        <div className={styles.loading}>Loading order…</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.iconBtn} onClick={handleBack} aria-label="Back">
            ←
          </button>
          <h1 className={styles.headerTitle}>Order Details</h1>
          <div className={styles.headerActions} />
        </header>
        <div className={styles.errorState}>
          <p>{error ?? "Order not found"}</p>
          <button type="button" onClick={handleBack} className={styles.retryBtn}>
            {cameFromBill ? "Back to bill" : "Close"}
          </button>
        </div>
      </div>
    );
  }

  const statusClass = order.status.toLowerCase().includes("progress")
    ? styles.statusProgress
    : styles.statusDefault;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.iconBtn} onClick={handleBack} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.headerTitle}>Order Details</h1>
        <div className={styles.headerActions}>
          <button type="button" className={styles.iconBtn} aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button type="button" className={styles.iconBtn} aria-label="More options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </header>

      {order.relatedOrders.length > 1 && shareToken ? (
        <div className={styles.orderTabs}>
          {order.relatedOrders.map((tab) => (
            <Link
              key={tab.id}
              href={buildOrderSharePath(tab.id, shareToken, {
                fromBillId: fromBillId ?? undefined,
              })}
              className={`${styles.orderTab} ${tab.id === order.id ? styles.orderTabActive : ""}`}
            >
              ORDER #{tab.orderNo}
            </Link>
          ))}
        </div>
      ) : null}

      <div className={styles.heroCard}>
        {order.membershipTier ? (
          <span className={styles.premiumBadge}>{order.membershipTier}</span>
        ) : null}
        <p className={styles.heroLabel}>CUSTOMER NAME</p>
        <h2 className={styles.heroName}>{order.customerName}</h2>
        <p className={styles.heroType}>{order.orderType}</p>
        <div className={styles.heroFooter}>
          <div>
            <p className={styles.metaLabel}>EXPECTED DATE</p>
            <p className={styles.metaValue}>
              <span aria-hidden>📅</span> {formatOrderDisplayDate(order.expectedDate)}
            </p>
          </div>
          <div>
            <p className={styles.metaLabel}>ORDER STATUS</p>
            <p className={`${styles.metaValue} ${statusClass}`}>
              <span className={styles.statusDot} aria-hidden /> {order.status}
            </p>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>PRODUCTION FLOW</h3>
          <span className={styles.percentBadge}>{order.progressPercent}% COMPLETE</span>
        </div>
        <div className={styles.progressBar}>
          {order.productionStages.map((stage) => (
            <span
              key={stage.name}
              className={`${styles.progressSegment} ${stage.completed ? styles.progressFilled : ""}`}
            />
          ))}
        </div>
        <div className={styles.stageLabels}>
          {order.productionStages.map((stage) => (
            <span
              key={stage.name}
              className={stage.completed ? styles.stageActive : styles.stageMuted}
            >
              {stage.name}
            </span>
          ))}
        </div>
      </section>

      {order.designReferences.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitlePlain}>Design References</h3>
            <button type="button" className={styles.viewAll}>
              View All ›
            </button>
          </div>
          <div className={styles.refGrid}>
            {order.designReferences.map((ref) => (
              <div key={`${ref.label}-${ref.imageUrl}`} className={styles.refCard}>
                <Image
                  src={ref.imageUrl}
                  alt={ref.label}
                  fill
                  className={styles.refImage}
                  sizes="50vw"
                  unoptimized={ref.imageUrl.startsWith("blob:")}
                />
                <span className={styles.refLabel}>{ref.label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {order.customizations.length > 0 ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitlePlain}>Customizations</h3>
          <div className={styles.dataGrid}>
            {order.customizations.map((item) => (
              <div key={item.label} className={styles.dataCard}>
                <span className={styles.dataLabel}>{item.label}</span>
                <span className={styles.dataValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {order.measurements.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitlePlain}>Detailed Measurements</h3>
            <span className={styles.unitBadge}>UNIT: {order.measurementUnit}</span>
          </div>
          <div className={styles.dataGrid}>
            {order.measurements.map((m) => (
              <div key={m.name} className={styles.dataCard}>
                <span className={styles.dataLabel}>{m.name}</span>
                <span className={styles.dataValue}>{m.value}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.shareWrap}>
        <button type="button" className={styles.shareBtn} onClick={handleShare}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share Order Summary
        </button>
      </div>
    </div>
  );
}
