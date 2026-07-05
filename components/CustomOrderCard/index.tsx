import Image from "next/image";
import Link from "next/link";
import type { CustomOrderItem } from "@/data/dummy";
import styles from "./CustomOrderCard.module.scss";

export default function CustomOrderCard({ order }: { order: CustomOrderItem }) {
  return (
    <article className={styles.card}>
      <p className={styles.dateLabel}>{order.dateLabel}</p>
      <h3 className={styles.status}>{order.status}</h3>
      <p className={styles.desc}>{order.description}</p>
      <div className={styles.imageWrap}>
        <Image src={order.image} alt="" fill className={styles.image} sizes="80px" />
      </div>
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          {Array.from({ length: order.progressSegments }).map((_, i) => (
            <span
              key={i}
              className={`${styles.segment} ${i < order.progressFilled ? styles.filled : ""}`}
            />
          ))}
        </div>
      </div>
      <p className={styles.finishedBy}>Finished By {order.finishedBy}</p>
      <div className={styles.footer}>
        <Link href={`/orders/${encodeURIComponent(order.id)}`} className={styles.viewInvoice}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          View Details
        </Link>
      </div>
      <div className={styles.ratingRow}>
        <span className={styles.ratingLabel}>Rate this Order</span>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>
    </article>
  );
}
