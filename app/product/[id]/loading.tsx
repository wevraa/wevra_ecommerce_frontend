import {
  SkeletonBox,
  SkeletonText,
  SkeletonProductCard,
} from "@/components/Skeleton";
import styles from "./loading.module.scss";

export default function ProductDetailLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading product">
      {/* Back header */}
      <div className={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={8} />
        <SkeletonBox width={80} height={20} />
        <SkeletonBox width={36} height={36} borderRadius={8} />
      </div>

      {/* Image carousel */}
      <SkeletonBox height={320} borderRadius={0} />

      {/* Product info */}
      <div className={styles.info}>
        <SkeletonText lines={2} widths={["80%", "55%"]} />
        <SkeletonBox width={100} height={24} borderRadius={4} />
        <SkeletonText lines={3} widths={["100%", "95%", "70%"]} />
      </div>

      {/* Size selector */}
      <div className={styles.sizeSection}>
        <SkeletonBox width={80} height={14} />
        <div className={styles.sizeRow}>
          {["XS", "S", "M", "L", "XL", "2XL"].map((_, i) => (
            <SkeletonBox key={i} width={44} height={44} borderRadius={8} />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <SkeletonBox height={48} borderRadius={24} />
        <SkeletonBox height={48} borderRadius={24} />
      </div>

      {/* Tabs (details, fit, shipping) */}
      <div className={styles.tabSection}>
        <div className={styles.tabRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBox key={i} height={36} borderRadius={0} />
          ))}
        </div>
        <div className={styles.tabContent}>
          <SkeletonText lines={5} widths={["100%", "95%", "88%", "100%", "60%"]} />
        </div>
      </div>

      {/* Recommendations */}
      <div className={styles.recommendSection}>
        <SkeletonBox width={180} height={18} />
        <div className={styles.recommendGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
