"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { closeDetailPage, useCloseDetailPageOnBack } from "@/lib/orders/closePage";
import { getPublicBillDetail } from "@/lib/orders/api";
import { buildOrderSharePath } from "@/lib/orders/shareLinks";
import {
  formatBillAmount,
  formatBillShortDate,
  formatOrderDisplayDate,
} from "@/lib/orders/format";
import type { EcomBillDetail } from "@/lib/orders/types";
import styles from "./BillDetailsPageClient.module.scss";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

interface BillDetailsPageClientProps {
  billId: string;
  shareToken: string;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

function dueParts(iso: string | null | undefined): { day: string; month: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: String(d.getUTCDate()).padStart(2, "0"),
    month: d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }).toUpperCase(),
  };
}

function phoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function splitAmount(formatted: string): { symbol: string; value: string } {
  return formatted.startsWith("₹")
    ? { symbol: "₹", value: formatted.slice(1) }
    : { symbol: "", value: formatted };
}

const PhoneIcon = ({ size = 14, color = "#C423CF" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export default function BillDetailsPageClient({ billId, shareToken }: BillDetailsPageClientProps) {
  const [bill, setBill] = useState<EcomBillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const [toastText, setToastText] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const paid = toNumber(bill?.advancePaid);
  const balance = toNumber(bill?.balance);
  const paidPercent = paid + balance > 0 ? Math.min(100, (paid / (paid + balance)) * 100) : 0;

  useEffect(() => {
    if (!bill) return;
    const t = setTimeout(() => setProgress(paidPercent), 100);
    return () => clearTimeout(t);
  }, [bill, paidPercent]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (text: string) => {
    setToastText(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(null), 1800);
  };

  const pageClass = `${styles.page} ${inter.className}`;

  if (loading) {
    return (
      <div className={pageClass}>
        <div className={styles.blobs} aria-hidden>
          <span className={styles.b1} /><span className={styles.b2} /><span className={styles.b3} />
        </div>
        <main className={styles.wrap}>
          <div className={styles.loading}>Loading bill…</div>
        </main>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className={pageClass}>
        <div className={styles.blobs} aria-hidden>
          <span className={styles.b1} /><span className={styles.b2} /><span className={styles.b3} />
        </div>
        <main className={styles.wrap}>
          <div className={styles.errorState}>
            <p>{error ?? "Bill not found"}</p>
            <button type="button" onClick={closeDetailPage} className={styles.retryBtn}>
              Close
            </button>
          </div>
        </main>
      </div>
    );
  }

  const tailor = bill.tailorDetails;
  const addressLine = [tailor.address, tailor.city, tailor.state, tailor.pincode]
    .filter((part): part is string => Boolean(part && part.trim()))
    .filter((part, i, arr) => i === 0 || !arr[0].toLowerCase().includes(part.toLowerCase()))
    .join(", ");
  const tailorPhone = tailor.phone?.trim() ?? "";
  const customerInitial = bill.customerName?.trim().charAt(0).toUpperCase() || "C";
  const due = dueParts(bill.dueDate);
  const balanceParts = splitAmount(formatBillAmount(bill.balance));
  const whatsappText = encodeURIComponent(`Hi ${tailor.boutiqueName}, regarding Bill #${bill.billNo}`);

  const toggleItem = (id: string) => setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleShare = async () => {
    const url = window.location.href;
    const data = {
      title: `Bill #${bill.billNo} · ${tailor.boutiqueName}`,
      text: `Your bill from ${tailor.boutiqueName}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      showToast("Copy the link from the address bar");
    }
  };

  return (
    <div className={pageClass}>
      <div className={styles.blobs} aria-hidden>
        <span className={styles.b1} /><span className={styles.b2} /><span className={styles.b3} />
      </div>

      <main className={styles.wrap}>
        <section className={styles.hero}>
          <div className={styles.cover} aria-hidden>
            <span className={styles.c1} /><span className={styles.c2} /><span className={styles.c3} />
          </div>
          <div className={styles.ring}>
            <div className={styles.ringInner}>
              {tailor.logoUrl ? (
                <Image src={tailor.logoUrl} alt="" fill className={styles.logo} sizes="100px" />
              ) : (
                <span aria-hidden>🏪</span>
              )}
            </div>
          </div>
          <h1 className={styles.boutiqueName}>{tailor.boutiqueName}</h1>
          <div className={styles.sub}>Boutique &amp; tailoring</div>
          {addressLine ? <p className={styles.address}>{addressLine}</p> : null}
          {(tailorPhone || tailor.email) ? (
            <div className={styles.contacts}>
              {tailorPhone ? (
                <a className={styles.contactPill} href={`tel:${tailorPhone.replace(/\s/g, "")}`}>
                  <PhoneIcon />
                  {tailorPhone}
                </a>
              ) : null}
              {tailor.email ? (
                <a className={styles.contactPill} href={`mailto:${tailor.email}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C423CF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                  {tailor.email}
                </a>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className={styles.meta}>
          <div className={`${styles.metaCard} ${styles.metaHot}`}>
            <small>Bill no.</small>
            <b className={styles.metaBig}>#{bill.billNo}</b>
          </div>
          <div className={styles.metaCard}>
            <small>Order date</small>
            <b>{formatBillShortDate(bill.orderDate)}</b>
          </div>
          <div className={styles.metaCard}>
            <small>Due date</small>
            <b>{formatBillShortDate(bill.dueDate)}</b>
          </div>
        </section>

        <section className={`${styles.card} ${styles.customer}`}>
          <div className={styles.avatar} aria-hidden>{customerInitial}</div>
          <div className={styles.customerInfo}>
            <span className={styles.label}>Customer</span>
            <b>{bill.customerName}</b>
          </div>
          {bill.customerPhone ? (
            <a className={styles.phonePill} href={`tel:${bill.customerPhone.replace(/\s/g, "")}`}>
              {bill.customerPhone}
            </a>
          ) : null}
        </section>

        <div className={styles.sectionHead}>
          <span className={styles.label}>Ordered items</span>
          <span className={styles.count}>
            {bill.items.length} ITEM{bill.items.length === 1 ? "" : "S"}
          </span>
        </div>

        {bill.items.map((item) => {
          const open = Boolean(openItems[item.id]);
          return (
            <section key={item.id} className={`${styles.card} ${styles.item}`}>
              <div className={styles.itemRow}>
                <div className={styles.thumb}>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      className={styles.thumbImage}
                      sizes="72px"
                      unoptimized={item.imageUrl.startsWith("blob:")}
                    />
                  ) : (
                    <span aria-hidden>🥻</span>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <b>{item.orderType || item.description}</b>
                  <small>
                    {item.orderNo ? `Order #${item.orderNo}` : "Order"} · Qty {item.qty}
                    {item.statusLabel ? <span className={styles.chip}>{item.statusLabel}</span> : null}
                  </small>
                </div>
                <div className={styles.price}>
                  <b>{formatBillAmount(item.lineTotal)}</b>
                  <button
                    type="button"
                    className={styles.detailsBtn}
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={open}
                  >
                    DETAILS
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C423CF"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className={open ? styles.chevOpen : styles.chev}
                      aria-hidden
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className={styles.unit}>
                <span>Unit price</span>
                <b>{formatBillAmount(item.unitPrice)}</b>
              </div>
              {open ? (
                <div className={styles.more}>
                  <div><span>Order number</span><b>{item.orderNo ? `#${item.orderNo}` : "—"}</b></div>
                  <div><span>Quantity</span><b>{item.qty}</b></div>
                  <div><span>Expected delivery</span><b>{formatBillShortDate(bill.dueDate)}</b></div>
                  {item.orderId && shareToken ? (
                    <div>
                      <span>Full order</span>
                      <Link
                        href={buildOrderSharePath(item.orderId, shareToken, { fromBillId: billId })}
                        className={styles.viewOrder}
                      >
                        View details ›
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })}

        <section className={`${styles.card} ${styles.summary}`}>
          <div className={styles.row}>
            <span>Subtotal</span>
            <b>{formatBillAmount(bill.subtotal)}</b>
          </div>
          <div className={`${styles.row} ${styles.rowAdvance}`}>
            <span>
              Advance received
              {bill.advancePaidDate ? (
                <small className={styles.paidOn}>Paid on {formatOrderDisplayDate(bill.advancePaidDate)}</small>
              ) : null}
            </span>
            <b>− {formatBillAmount(bill.advancePaid)}</b>
          </div>
          <div className={styles.progress}>
            <div className={styles.bar}>
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.progressLabels}>
              <span><b>{formatBillAmount(bill.advancePaid)}</b> paid</span>
              <span><b>{formatBillAmount(bill.balance)}</b> to pay</span>
            </div>
          </div>
          <div className={styles.balance}>
            <div className={styles.balanceLeft}>
              <small>Balance due</small>
              <div className={styles.amount}>
                {balanceParts.symbol ? <sup>{balanceParts.symbol}</sup> : null}
                {balanceParts.value}
              </div>
            </div>
            <div className={styles.dueBox}>
              <small>Due date</small>
              {due ? (
                <b>{due.day}<br />{due.month}</b>
              ) : (
                <b>—</b>
              )}
            </div>
          </div>
        </section>

        <nav className={styles.actions}>
          {tailorPhone ? (
            <a className={`${styles.action} ${styles.actionPrimary}`} href={`tel:${tailorPhone.replace(/\s/g, "")}`}>
              <i><PhoneIcon size={22} color="#fff" /></i>
              Call
            </a>
          ) : null}
          {tailorPhone ? (
            <a
              className={styles.action}
              href={`https://wa.me/${phoneDigits(tailorPhone)}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                  <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.29A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.49-8.41" />
                </svg>
              </i>
              WhatsApp
            </a>
          ) : null}
          <button type="button" className={styles.action} onClick={() => window.print()}>
            <i>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1F1537" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
              </svg>
            </i>
            PDF
          </button>
          <button type="button" className={styles.action} onClick={handleShare}>
            <i>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1F1537" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            </i>
            Share
          </button>
        </nav>

        <div className={styles.foot}>
          <span>Powered by <b>wevraa.in</b></span>
        </div>
      </main>

      <div className={`${styles.toast} ${toastText ? styles.toastShow : ""}`} role="status" aria-live="polite">
        {toastText}
      </div>
    </div>
  );
}
