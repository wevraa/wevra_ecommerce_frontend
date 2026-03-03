import Link from "next/link";
import styles from "./CollectionHeader.module.scss";

export default function CollectionHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.backBtn} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
      <h1 className={styles.title}>Collection</h1>
    </header>
  );
}
