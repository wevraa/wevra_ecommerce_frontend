"use client";

import { useRouter } from "next/navigation";
import styles from "./BoutiqueSelectionList.module.scss";

interface BoutiqueItem {
  id: string;
  name: string;
  iconColor: string;
}

const getIconClass = (color: string, s: Record<string, string>) => {
  if (color === "yellow") return s.yellow;
  if (color === "purple") return s.purple;
  if (color === "darkpurple") return s.darkPurple;
  if (color === "lightgray") return s.lightGray;
  if (color === "orange") return s.orange;
  return "";
};

export default function BoutiqueSelectionList({
  items,
}: {
  items: BoutiqueItem[];
}) {
  const router = useRouter();

  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className={styles.item}
            onClick={() => router.push("/order-quote")}
          >
            <span
              className={`${styles.icon} ${getIconClass(item.iconColor, styles)}`}
              aria-hidden
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.arrow} aria-hidden>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
