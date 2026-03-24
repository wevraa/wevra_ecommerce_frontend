import { SkeletonBox, SkeletonText } from "@/components/Skeleton";
import styles from "./loading.module.scss";

export default function BoutiquesSelectionLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading boutique selection">
      {/* Back header */}
      <div className={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={8} />
      </div>

      {/* Selection header (collapsed) */}
      <div className={styles.selectionHeader}>
        <div className={styles.iconStack}>
          <SkeletonBox width={56} height={56} borderRadius={999} />
        </div>
        <div className={styles.headerText}>
          <SkeletonBox width={120} height={20} />
          <SkeletonBox width={160} height={13} />
          <SkeletonBox width={200} height={12} />
        </div>
        <SkeletonBox width={40} height={40} borderRadius={8} />
      </div>

      {/* Boutique list rows */}
      <div className={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.listRow}>
            <SkeletonBox width={40} height={40} borderRadius={999} />
            <SkeletonText lines={1} widths={["50%"]} />
            <SkeletonBox width={20} height={20} borderRadius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
