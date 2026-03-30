"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ApiAccessoryOption } from "@/lib/api";
import styles from "./AddonsForm.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

export default function AddonsForm() {
  const [accessoryOptions, setAccessoryOptions] = useState<ApiAccessoryOption[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!API_BASE) {
      setLoaded(true);
      return;
    }
    fetch(`${API_BASE}/v1/addon/accessory-options`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: unknown) => {
        const raw = Array.isArray(json) ? json : (json as { data?: unknown[] })?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];
        const options: ApiAccessoryOption[] = list.map((item: unknown, index: number) => {
          const o = item as Record<string, unknown>;
          const id = typeof o.id === "string" ? o.id : `opt-${index}`;
          const name = typeof o.name === "string" ? o.name : "";
          return { id, name };
        }).filter((o) => o.name);
        setAccessoryOptions(options);
        setSelected((prev) => {
          const next = { ...prev };
          for (const opt of options) {
            if (next[opt.id] === undefined) next[opt.id] = true;
          }
          return next;
        });
      })
      .catch(() => setAccessoryOptions([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <p className={styles.intro}>Select Which you required</p>

        {loaded && accessoryOptions.length === 0 ? (
          <p className={styles.intro}>No accessory options available.</p>
        ) : null}
        {!loaded ? (
          <p className={styles.intro}>Loading accessory options…</p>
        ) : (
          accessoryOptions.map((option) => (
            <div key={option.id} className={styles.row}>
              <span className={styles.label}>{option.name}</span>
              <button
                type="button"
                role="switch"
                aria-checked={!!selected[option.id]}
                className={`${styles.toggle} ${selected[option.id] ? styles.on : ""}`}
                onClick={() =>
                  setSelected((prev) => ({ ...prev, [option.id]: !prev[option.id] }))
                }
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))
        )}

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
