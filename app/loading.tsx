import styles from "./loading.module.scss";

export default function GlobalLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading page">
      <div className={styles.spinner} />
    </div>
  );
}
