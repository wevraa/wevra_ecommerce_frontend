"use client";

import { useState } from "react";
import styles from "./ProductTabs.module.scss";

const TABS = [
  { id: "details", label: "Details" },
  { id: "fit", label: "Fit & Fabric" },
  { id: "shipping", label: "Shipping & Return" },
] as const;

interface ProductTabsProps {
  details: string;
  fitFabric: string;
  shippingReturn: string;
}

export default function ProductTabs({ details, fitFabric, shippingReturn }: ProductTabsProps) {
  const [active, setActive] = useState<typeof TABS[number]["id"]>("details");

  const content =
    active === "details" ? details : active === "fit" ? fitFabric : shippingReturn;

  return (
    <div className={styles.wrap}>
      <div className={styles.tabList} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`${styles.tab} ${active === tab.id ? styles.active : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.panel} role="tabpanel">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
