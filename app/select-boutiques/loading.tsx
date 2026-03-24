import {
  SkeletonBox,
  SkeletonSearchHeader,
  SkeletonProfileBlock,
  SkeletonSelectedImages,
  SkeletonTailorCard,
  SkeletonText,
} from "@/components/Skeleton";
import styles from "./loading.module.scss";

export default function SelectBoutiquesLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading boutiques">
      {/* Search header */}
      <SkeletonSearchHeader />

      <main className={styles.main}>
        {/* Profile block */}
        <SkeletonProfileBlock />

        {/* Order type pills */}
        <div className={styles.orderTypes}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBox key={i} width={130} height={36} borderRadius={20} />
          ))}
        </div>

        {/* Selected images */}
        <div className={styles.section}>
          <SkeletonText lines={1} widths={[120]} />
          <SkeletonSelectedImages />
        </div>

        {/* Measurement addons */}
        <div className={styles.section}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.addonRow}>
              <SkeletonBox width={40} height={40} borderRadius={8} />
              <div className={styles.addonText}>
                <SkeletonBox width="60%" height={14} />
                <SkeletonBox width="40%" height={12} />
              </div>
            </div>
          ))}
        </div>

        {/* Boutiques divider + summary bar */}
        <div className={styles.divider}>
          <SkeletonBox width={100} height={14} />
        </div>
        <div className={styles.summaryBar}>
          <SkeletonBox width={120} height={16} />
          <SkeletonBox width={70} height={36} borderRadius={8} />
        </div>

        {/* Boutique cards */}
        <div className={styles.cards}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonTailorCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
