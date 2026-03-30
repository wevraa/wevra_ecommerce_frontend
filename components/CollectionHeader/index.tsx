import Link from "next/link";
import styles from "./CollectionHeader.module.scss";

interface CollectionHeaderProps {
  /** Center label in the sticky bar (main title is still shown in page content). */
  label?: string;
}

export default function CollectionHeader({ label = "Collection" }: CollectionHeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.backBtn} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
      <h1 className={styles.title}>{label}</h1>
    </header>
  );
}
