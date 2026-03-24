import {
  SkeletonBox,
  SkeletonCategoryPill,
  SkeletonHero,
  SkeletonProductCard,
  SkeletonText,
} from "@/components/Skeleton";
import styles from "./loading.module.scss";

export default function HomeLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading page">
      {/* Header */}
      <div className={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={8} />
        <SkeletonBox width={100} height={22} />
        <div className={styles.headerIcons}>
          <SkeletonBox width={36} height={36} borderRadius={8} />
          <SkeletonBox width={36} height={36} borderRadius={8} />
        </div>
      </div>

      {/* Category nav pills */}
      <div className={styles.categoryNav}>
        {[90, 80, 70, 85, 75, 65].map((w, i) => (
          <SkeletonCategoryPill key={i} />
        ))}
      </div>

      {/* Hero carousel */}
      <SkeletonHero />

      {/* Section: Good Deals */}
      <div className={styles.section}>
        <SkeletonText lines={1} widths={[120]} />
        <div className={styles.dealsGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.dealCard}>
              <SkeletonBox height={90} borderRadius={8} />
              <SkeletonBox width="70%" height={12} />
            </div>
          ))}
        </div>
      </div>

      {/* Section: Featured Products */}
      <div className={styles.section}>
        <SkeletonText lines={1} widths={[160]} />
        <div className={styles.productsGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </div>

      {/* Reviews strip */}
      <div className={styles.section}>
        <SkeletonText lines={1} widths={[140]} />
        <div className={styles.reviewsGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.reviewCard}>
              <SkeletonText lines={3} widths={["100%", "90%", "50%"]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
