import { SkeletonBox, SkeletonCartItem } from "@/components/Skeleton";
import styles from "./loading.module.scss";

export default function CartLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading cart">
      {/* Cart header */}
      <div className={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={8} />
        <SkeletonBox width={80} height={20} />
        <SkeletonBox width={36} height={36} borderRadius={8} />
      </div>

      {/* Cart items */}
      <div className={styles.items}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCartItem key={i} />
        ))}
      </div>

      {/* Checkout summary */}
      <div className={styles.checkout}>
        <div className={styles.checkoutRow}>
          <SkeletonBox width={100} height={14} />
          <SkeletonBox width={70} height={14} />
        </div>
        <div className={styles.checkoutRow}>
          <SkeletonBox width={80} height={14} />
          <SkeletonBox width={60} height={14} />
        </div>
        <div className={styles.checkoutRow}>
          <SkeletonBox width={120} height={18} />
          <SkeletonBox width={80} height={18} />
        </div>
        <SkeletonBox height={52} borderRadius={26} />
      </div>
    </div>
  );
}
