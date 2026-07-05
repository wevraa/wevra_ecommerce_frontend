import Link from "next/link";
import type { BillOrderItem } from "@/data/dummy";
import styles from "./BillOrderCard.module.scss";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function BillOrderCard({ order }: { order: BillOrderItem }) {
  return (
    <Link href={`/bills/${encodeURIComponent(order.id)}`} className={styles.card}>
      <div className={styles.iconWrap}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <div className={styles.details}>
        <h3 className={styles.boutiqueName}>{order.boutiqueName}</h3>
        <p className={styles.areaName}>{order.areaName}</p>
        <p className={styles.deliveredBy}>{order.deliveredBy}</p>
        <p className={styles.date}>{order.date}</p>
      </div>
      <div className={styles.right}>
        <p className={styles.totalOrders}>Total Orders</p>
        <p className={styles.totalOrdersNum}>{order.totalOrders}</p>
        <p className={styles.orderValue}>Order Value</p>
        <p className={styles.orderValueNum}>{formatPrice(order.orderValue)}</p>
      </div>
    </Link>
  );
}
