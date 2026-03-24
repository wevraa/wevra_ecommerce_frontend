import { SkeletonBox, SkeletonCategoryPill } from "@/components/Skeleton";
import styles from "./loading.module.scss";

export default function SelectSleeveDesignLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading sleeve designs">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.topRow}>
          <SkeletonBox width={40} height={40} borderRadius={8} />
          <div className={styles.titleBlock}>
            <SkeletonBox width={160} height={20} />
            <SkeletonBox width={200} height={13} />
          </div>
        </div>
        {/* Search bar */}
        <div className={styles.search}>
          <SkeletonBox height={40} borderRadius={20} />
        </div>
        {/* Category tabs */}
        <div className={styles.tabs}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCategoryPill key={i} />
          ))}
        </div>
      </div>

      {/* Design grid */}
      <div className={styles.grid}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <SkeletonBox height={160} borderRadius={0} />
            <SkeletonBox width="80%" height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}
