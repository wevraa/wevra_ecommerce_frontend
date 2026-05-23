import styles from "@/components/ChatPageClient/ChatPageClient.module.scss";

export default function ChatLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading chat">
      <header className={styles.header}>
        <span className={`${styles.skelBack} shimmer`} />
        <span className={`${styles.skelTitle} shimmer`} />
        <span className={styles.headerSpacer} />
      </header>
      <div className={styles.messages}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.rowOut}>
            <span className={`${styles.skelBubble} shimmer`} />
          </div>
        ))}
      </div>
    </div>
  );
}
