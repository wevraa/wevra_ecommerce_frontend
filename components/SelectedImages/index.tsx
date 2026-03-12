"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SelectedImage } from "@/data/dummy";
import styles from "./SelectedImages.module.scss";

interface SelectedImagesProps {
  images: SelectedImage[];
}

export default function SelectedImages({ images }: SelectedImagesProps) {
  const router = useRouter();

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Selected Images</h2>
      <div className={styles.grid}>
        {images.map((item) => {
          const isFrontNeck = item.label.toLowerCase().includes("front neck");
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.card} ${
                isFrontNeck ? styles.cardInteractive : ""
              }`}
              onClick={() => {
                if (isFrontNeck) {
                  router.push("/select-sleeve-design");
                }
              }}
            >
              <Image
                src={item.image}
                alt=""
                fill
                className={styles.image}
                sizes="50vw"
              />
              {isFrontNeck && (
                <span className={styles.plusBadge} aria-hidden>
                  +
                </span>
              )}
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.expandBtn}
        aria-label="View more"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </section>
  );
}

