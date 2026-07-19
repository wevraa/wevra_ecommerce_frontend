"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { closeDetailPage, useCloseDetailPageOnBack } from "@/lib/orders/closePage";
import { getPublicBillDetail } from "@/lib/orders/api";
import { buildOrderSharePath } from "@/lib/orders/shareLinks";
import {
  formatBillAmount,
  formatBillShortDate,
  formatDueBadge,
  formatLocationLine,
  formatOrderDisplayDate,
} from "@/lib/orders/format";
import type { EcomBillDetail } from "@/lib/orders/types";
import styles from "./BillDetailsPageClient.module.scss";

interface BillDetailsPageClientProps {
  billId: string;
  shareToken: string;
}

export default function BillDetailsPageClient({ billId, shareToken }: BillDetailsPageClientProps) {
  const [bill, setBill] = useState<EcomBillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useCloseDetailPageOnBack();

  useEffect(() => {
    let cancelled = false;

    if (!shareToken.trim()) {
      setBill(null);
      setError("Invalid link — missing share token");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getPublicBillDetail(billId, shareToken)
      .then((data) => {
        if (!cancelled) setBill(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load bill");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [billId, shareToken]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading bill…</div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>{error ?? "Bill not found"}</p>
          <button type="button" onClick={closeDetailPage} className={styles.retryBtn}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const tailor = bill.tailorDetails;
  const locationLine = formatLocationLine(tailor);

  return (
    <div className={styles.page}>
      <div className={styles.boutiqueCard}>
        {tailor.logoUrl ? (
          <div className={styles.logoWrap}>
            <Image src={tailor.logoUrl} alt="" fill className={styles.logo} sizes="64px" />
          </div>
        ) : (
          <div className={styles.logoPlaceholder} aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}
        <h1 className={styles.boutiqueName}>{tailor.boutiqueName}</h1>
        {locationLine ? (
          <span className={styles.locationBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {locationLine}
          </span>
        ) : null}
        {tailor.address ? <p className={styles.address}>{tailor.address}</p> : null}
        {(tailor.phone || tailor.email) ? (
          <div className={styles.contactRow}>
            {tailor.phone ? (
              <a href={`tel:${tailor.phone.replace(/\s/g, "")}`} className={styles.contactLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {tailor.phone}
              </a>
            ) : null}
            {tailor.email ? (
              <a href={`mailto:${tailor.email}`} className={styles.contactLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {tailor.email}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>BILL NUMBER</span>
          <span className={styles.infoValueBlue}>#{bill.billNo}</span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>ORDER DATE</span>
          <span className={styles.infoValue}>{formatBillShortDate(bill.orderDate)}</span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>DUE DATE</span>
          <span className={styles.infoValue}>{formatBillShortDate(bill.dueDate)}</span>
        </div>
      </div>

      <div className={styles.customerCard}>
        <div className={styles.customerLeft}>
          <div className={styles.avatar} aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <span className={styles.customerLabel}>CUSTOMER</span>
            <span className={styles.customerName}>{bill.customerName}</span>
          </div>
        </div>
        {bill.customerPhone ? (
          <span className={styles.phoneBadge}>{bill.customerPhone}</span>
        ) : null}
      </div>

      <section className={styles.itemsSection}>
        <div className={styles.itemsHead}>
          <h2 className={styles.itemsTitle}>ORDERED ITEMS</h2>
          <span className={styles.itemsCount}>
            {bill.items.length} ITEM{bill.items.length === 1 ? "" : "S"}
          </span>
        </div>

        {bill.items.map((item) => (
          <article key={item.id} className={styles.itemCard}>
            <div className={styles.itemThumb}>
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className={styles.itemImage}
                  sizes="72px"
                  unoptimized={item.imageUrl.startsWith("blob:")}
                />
              ) : (
                <span className={styles.itemThumbPlaceholder} aria-hidden>👗</span>
              )}
            </div>
            <div className={styles.itemBody}>
              <div className={styles.itemTop}>
                <h3 className={styles.itemTitle}>{item.orderType}</h3>
                <span className={styles.itemTotal}>{formatBillAmount(item.lineTotal)}</span>
              </div>
              <p className={styles.itemMeta}>
                {item.orderNo ? `Order #${item.orderNo}` : "Order"}
                {" • "}Qty: {item.qty}
                {item.statusLabel ? ` • ${item.statusLabel}` : ""}
              </p>
              <div className={styles.itemFooter}>
                <span className={styles.unitPrice}>Unit Price: {formatBillAmount(item.unitPrice)}</span>
                {item.orderId && shareToken ? (
                  <Link
                    href={buildOrderSharePath(item.orderId, shareToken, { fromBillId: billId })}
                    className={styles.detailsLink}
                  >
                    DETAILS ›
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span className={styles.summaryBold}>{formatBillAmount(bill.subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <div>
            <span>Advance Received</span>
            {bill.advancePaidDate ? (
              <span className={styles.paidOn}>
                Paid on {formatOrderDisplayDate(bill.advancePaidDate)}
              </span>
            ) : null}
          </div>
          <span className={styles.summaryBlue}>{formatBillAmount(bill.advancePaid)}</span>
        </div>
        <div className={styles.balanceCard}>
          <div>
            <span className={styles.balanceLabel}>BALANCE DUE</span>
            <span className={styles.balanceAmount}>{formatBillAmount(bill.balance)}</span>
          </div>
          <div className={styles.dueBox}>
            <span className={styles.dueLabel}>DUE DATE</span>
            <span className={styles.dueValue}>{formatDueBadge(bill.dueDate)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
