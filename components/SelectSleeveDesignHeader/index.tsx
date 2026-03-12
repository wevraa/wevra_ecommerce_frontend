"use client"

import Link from "next/link";
import styles from "./SelectSleeveDesignHeader.module.scss";
import { useState } from "react";

export default function SelectSleeveDesignHeader() {
  const CATEGORY_TABS = ["Boat Neck", "High Neck", "U Neck", "Collar", "V Neck", "Square Neck"];
   const [activeTab, setActiveTab] = useState(CATEGORY_TABS[0]);
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Link href="/" className={styles.backBtn} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Select Sleeve Design</h1>
          <p className={styles.subtitle}>Select Design or Upload Your Own</p>
        </div>
      </div>
      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search designs..."
            aria-label="Search designs"
          />
        </div>
      </div>
      <div className={styles.tabs} role="tablist">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            className={styles.tab}
            onClick={() => setActiveTab(tab)}
            aria-selected={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  );
}
