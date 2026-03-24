import { SkeletonBox, SkeletonCircle, SkeletonText } from "@/components/Skeleton";
import styles from "./loading.module.scss";

export default function ProfileLoading() {
  return (
    <div className={styles.page} aria-busy aria-label="Loading profile">
      {/* Header */}
      <div className={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={8} />
        <SkeletonBox width={80} height={20} />
        <SkeletonBox width={36} height={36} borderRadius={8} />
      </div>

      {/* Profile hero */}
      <div className={styles.hero}>
        <SkeletonCircle size={72} />
        <div className={styles.heroText}>
          <SkeletonBox width={180} height={18} />
          <SkeletonBox width={130} height={14} />
        </div>
      </div>

      {/* Section rows */}
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className={styles.section}>
          <SkeletonBox width={100} height={14} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.row}>
              <SkeletonBox width={36} height={36} borderRadius={8} />
              <div className={styles.rowText}>
                <SkeletonBox width="55%" height={14} />
                <SkeletonBox width="35%" height={12} />
              </div>
              <SkeletonBox width={20} height={20} borderRadius={4} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
