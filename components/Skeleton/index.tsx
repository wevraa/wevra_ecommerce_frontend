import styles from "./Skeleton.module.scss";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

/** Generic shimmer block. Width/height default to 100%. */
export function SkeletonBox({
  width = "100%",
  height = 16,
  borderRadius = 6,
  className = "",
}: SkeletonProps) {
  return (
    <span
      className={`shimmer ${styles.box} ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden
    />
  );
}

/** Shimmer circle (avatars, icons). */
export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return (
    <span
      className={`shimmer ${styles.circle}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

/** One or more shimmer text lines. */
export function SkeletonText({
  lines = 1,
  widths,
  gap = 8,
}: {
  lines?: number;
  widths?: (string | number)[];
  gap?: number;
}) {
  return (
    <span className={styles.textGroup} style={{ gap }} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          height={14}
          width={widths?.[i] ?? (i === lines - 1 && lines > 1 ? "65%" : "100%")}
        />
      ))}
    </span>
  );
}

/** Full skeleton product card matching ProductCard layout. */
export function SkeletonProductCard() {
  return (
    <div className={styles.productCard} aria-hidden>
      <SkeletonBox height={200} borderRadius={8} />
      <div className={styles.productCardBody}>
        <SkeletonText lines={2} widths={["90%", "60%"]} />
        <div className={styles.productCardFooter}>
          <SkeletonBox width={80} height={18} />
          <SkeletonCircle size={32} />
        </div>
      </div>
    </div>
  );
}

/** Full skeleton tailor / boutique card. */
export function SkeletonTailorCard() {
  return (
    <div className={styles.tailorCard} aria-hidden>
      <div className={styles.tailorCardHeader}>
        <SkeletonCircle size={48} />
        <div className={styles.tailorCardHeaderText}>
          <SkeletonBox width="60%" height={16} />
          <SkeletonBox width="40%" height={12} />
        </div>
        <SkeletonBox width={60} height={22} borderRadius={6} />
      </div>
      <div className={styles.tailorCardTags}>
        {[80, 60, 90, 55].map((w, i) => (
          <SkeletonBox key={i} width={w} height={22} borderRadius={999} />
        ))}
      </div>
      <SkeletonBox height={12} width="75%" />
      <SkeletonBox height={12} width="45%" />
      <div className={styles.tailorCardFooter}>
        <SkeletonBox width={100} height={14} />
        <div className={styles.tailorCardBtns}>
          <SkeletonBox width={70} height={32} borderRadius={8} />
          <SkeletonBox width={60} height={32} borderRadius={8} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for boutique card (image + info strip). */
export function SkeletonBoutiqueCard() {
  return (
    <div className={styles.boutiqueCard} aria-hidden>
      <SkeletonBox height={140} borderRadius={0} />
      <div className={styles.boutiqueCardInfo}>
        <div className={styles.boutiqueCardLeft}>
          <SkeletonBox width="55%" height={16} />
          <SkeletonBox width="70%" height={12} />
          <SkeletonBox width="50%" height={12} />
        </div>
        <div className={styles.boutiqueCardRight}>
          <SkeletonBox width={80} height={12} />
          <SkeletonBox width={60} height={12} />
          <SkeletonBox width={80} height={28} borderRadius={4} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton hero carousel. */
export function SkeletonHero() {
  return <SkeletonBox height={220} borderRadius={0} />;
}

/** A single skeleton category pill. */
export function SkeletonCategoryPill() {
  return <SkeletonBox width={80} height={32} borderRadius={999} />;
}

/** Skeleton cart item row. */
export function SkeletonCartItem() {
  return (
    <div className={styles.cartItem} aria-hidden>
      <SkeletonBox width={80} height={90} borderRadius={8} />
      <div className={styles.cartItemInfo}>
        <SkeletonBox width="70%" height={14} />
        <SkeletonBox width="45%" height={12} />
        <SkeletonBox width="30%" height={16} />
        <div className={styles.cartItemFooter}>
          <SkeletonBox width={90} height={28} borderRadius={20} />
          <SkeletonBox width={28} height={28} borderRadius={6} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton order card. */
export function SkeletonOrderCard() {
  return (
    <div className={styles.orderCard} aria-hidden>
      <div className={styles.orderCardHeader}>
        <SkeletonBox width={80} height={80} borderRadius={8} />
        <div className={styles.orderCardInfo}>
          <SkeletonBox width="65%" height={14} />
          <SkeletonBox width="40%" height={12} />
          <SkeletonBox width="50%" height={12} />
          <SkeletonBox width={80} height={22} borderRadius={6} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton page header bar. */
export function SkeletonHeader() {
  return (
    <div className={styles.header} aria-hidden>
      <SkeletonBox width={40} height={40} borderRadius={8} />
      <SkeletonBox width={120} height={20} />
      <SkeletonBox width={40} height={40} borderRadius={8} />
    </div>
  );
}

/** Skeleton search header. */
export function SkeletonSearchHeader() {
  return (
    <div className={styles.searchHeader} aria-hidden>
      <SkeletonBox width={40} height={40} borderRadius={8} />
      <SkeletonBox height={40} borderRadius={20} />
      <SkeletonBox width={40} height={40} borderRadius={8} />
    </div>
  );
}

/** Skeleton profile avatar + name row. */
export function SkeletonProfileBlock() {
  return (
    <div className={styles.profileBlock} aria-hidden>
      <SkeletonCircle size={56} />
      <div className={styles.profileBlockText}>
        <SkeletonBox width={160} height={16} />
        <SkeletonBox width={120} height={12} />
      </div>
    </div>
  );
}

/** Skeleton 2-image row (SelectedImages). */
export function SkeletonSelectedImages() {
  return (
    <div className={styles.selectedImages} aria-hidden>
      <SkeletonBox height={120} borderRadius={8} />
      <SkeletonBox height={120} borderRadius={8} />
    </div>
  );
}
