"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./AddonsForm.module.scss";

export default function AddonsForm() {
  const [cups, setCups] = useState(true);
  const [piping, setPiping] = useState(true);
  const [zipType, setZipType] = useState(true);
  const [zipPosition, setZipPosition] = useState<"back" | "front" | "side">("front");
  const [hooks, setHooks] = useState(false);
  const [hooksPosition, setHooksPosition] = useState<"back" | "front">("back");

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <p className={styles.intro}>Select Which you required</p>

        <div className={styles.row}>
          <span className={styles.label}>CUPS</span>
          <button
            type="button"
            role="switch"
            aria-checked={cups}
            className={`${styles.toggle} ${cups ? styles.on : ""}`}
            onClick={() => setCups(!cups)}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>PIPING</span>
          <button
            type="button"
            role="switch"
            aria-checked={piping}
            className={`${styles.toggle} ${piping ? styles.on : ""}`}
            onClick={() => setPiping(!piping)}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>ZIP TYPE</span>
          <button
            type="button"
            role="switch"
            aria-checked={zipType}
            className={`${styles.toggle} ${zipType ? styles.on : ""}`}
            onClick={() => setZipType(!zipType)}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.segmentWrap}>
          <div className={styles.segment}>
            {(["back", "front", "side"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                className={`${styles.segmentBtn} ${zipPosition === opt ? styles.selected : ""}`}
                onClick={() => setZipPosition(opt)}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <span className={`${styles.label} ${styles.labelMuted}`}>HOOKS</span>
          <button
            type="button"
            role="switch"
            aria-checked={hooks}
            className={`${styles.toggle} ${hooks ? styles.on : ""}`}
            onClick={() => setHooks(!hooks)}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.segmentWrap}>
          <div className={styles.segment}>
            {(["back", "front"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                className={`${styles.segmentBtn} ${styles.segmentBtnMuted} ${hooksPosition === opt ? styles.selected : ""}`}
                onClick={() => setHooksPosition(opt)}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.twoCol}>
          <div>
            <h2 className={styles.sectionTitle}>HANGINGS</h2>
            <p className={styles.subtitle}>
              Select or upload hangings or else leave blank
            </p>
            <div className={styles.uploadCard}>
              <span aria-hidden>🎀</span>
            </div>
          </div>

          <div>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleMuted}`}>
              DRAWING IMAGE
            </h2>
            <p className={styles.subtitle}>
              Upload your drawing pattern if required
            </p>
            <div className={styles.uploadCard}>
              <span className={styles.uploadPlus}>+</span>
            </div>
          </div>
        </div>

        <Link href="/profile" className={styles.cta}>
          CONTINUE TO ORDER
        </Link>
      </div>
    </div>
  );
}
