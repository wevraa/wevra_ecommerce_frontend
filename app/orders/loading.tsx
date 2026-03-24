import { SkeletonBox, SkeletonOrderCard } from "@/components/Skeleton";
import styles from "./loading.module.scss";

export default function OrdersLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading orders">
      {/* Header */}
      <div className={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={8} />
        <SkeletonBox width={80} height={20} />
        <SkeletonBox width={36} height={36} borderRadius={8} />
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox key={i} height={40} borderRadius={0} />
        ))}
      </div>

      {/* Order cards */}
      <div className={styles.cards}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonOrderCard key={i} />
        ))}
      </div>
    </div>
  );
}
