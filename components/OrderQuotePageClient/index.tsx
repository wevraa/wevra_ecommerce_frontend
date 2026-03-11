"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./OrderQuotePageClient.module.scss";

const DATES = [
  { day: "Sun", num: "20" },
  { day: "Mon", num: "21" },
  { day: "Thu", num: "22" },
  { day: "Wed", num: "23" },
  { day: "Thu", num: "24" },
  { day: "Fri", num: "25" },
];

export default function OrderQuotePageClient() {
  const [selectedDateIndex, setSelectedDateIndex] = useState(1);
  const [month, setMonth] = useState("November");

  return (
    <main className={styles.main}>
      <div className={styles.headerBar}>
        <Link href="/boutiques-selection" className={styles.backBtn} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <p className={styles.summaryTitle}>5 Boutiques</p>
            <p className={styles.summarySub}>Selected For Order Quote</p>
            <p className={styles.summarySub}>Star Boutique, Ap Designers, GGRFas......</p>
          </div>
        </div>
        <Link href="/boutiques-selection" className={styles.arrowBtn} aria-label="View boutiques">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </Link>
      </div>

      <div className={styles.content}>
        <section className={styles.dateSection}>
          <div className={styles.dateLabel}>
            <span className={styles.dateLabelText}>When you Required :</span>
            <button type="button" className={styles.monthSelect}>
              {month} ▾
            </button>
          </div>
          <div className={styles.dateStrip}>
            {DATES.map((d, i) => (
              <button
                key={d.day + d.num}
                type="button"
                className={`${styles.dateCard} ${i === selectedDateIndex ? styles.selected : ""}`}
                onClick={() => setSelectedDateIndex(i)}
              >
                <span className={styles.dateDay}>{d.day}</span>
                <span className={styles.dateNum}>{d.num}</span>
              </button>
            ))}
          </div>
        </section>

        {[1, 2].map((i) => (
          <div key={i} className={styles.productCard}>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>Machine Embroidery Blouse</h3>
              <p className={styles.addonsWarning}>No Add-ons selected</p>
              <Link href="/addons" className={styles.addonsLink}>
                Add-ons to quote better
                <span aria-hidden>›</span>
              </Link>
              <p className={styles.measurementOk}>Measurement added</p>
              <Link href="/measurement" className={styles.measurementLink}>
                Tap to Select Measurement
                <span aria-hidden>›</span>
              </Link>
            </div>
            <div className={styles.productImage}>
              <Image src="/images/product-5.svg" alt="" fill sizes="80px" style={{ objectFit: "cover" }} />
            </div>
          </div>
        ))}

        <div className={styles.btn_wrap}>
          <button type="button" className={styles.addItemsBtn}>
            <span aria-hidden>+</span>
            Add Items
          </button>
        </div>


        <div className={styles.footerBtns}>
          <Link href="/boutiques-selection" className={styles.cancelBtn}>
            Cancel
          </Link>
          <button type="button" className={styles.sendBtn}>
            send
          </button>
        </div>
      </div>
    </main>
  );
}
