import styles from "./ChatInbox.module.scss";

export default function ChatInboxLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading messages">
      <header className={styles.header}>
        <span className={`${styles.skelBack} shimmer`} aria-hidden />
        <h1 className={styles.title}>Messages</h1>
        <div className={styles.spacer} />
      </header>
      <main className={styles.main}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={`${styles.skelRow} shimmer`} aria-hidden />
        ))}
      </main>
    </div>
  );
}
