import Image from "next/image";
import Link from "next/link";
import type { Boutique } from "@/data/dummy";
import type { ApiTailor } from "@/lib/api";
import BoutiqueCard from "@/components/BoutiqueCard";
import TailorCard from "@/components/TailorCard";
import styles from "./AllBoutiques.module.scss";

const bannerImage = "/images/placeholder-rect.svg";
const selectedCount = 5;

interface AllBoutiquesProps {
  /** Legacy dummy boutiques (used when tailors not provided) */
  boutiques?: Boutique[];
  /** Tailors from API – when provided, these are shown instead of boutiques */
  tailors?: ApiTailor[];
  /** When true, hides the top banner and uses a light summary bar with maroon Next button */
  compact?: boolean;
}

export default function AllBoutiques({
  boutiques = [],
  tailors = [],
  compact,
}: AllBoutiquesProps) {
  const useTailors = tailors.length > 0;
  const list = useTailors ? tailors : boutiques;
  const count = useTailors ? tailors.length : selectedCount;

  return (
    <section className={styles.section}>
      <div className={styles.divider}>
        <span className={styles.dividerText}>All Boutiques</span>
      </div>
      {!compact && (
        <div className={styles.bannerWrap}>
          <Image src={bannerImage} alt="" fill className={styles.bannerImage} sizes="100vw" />
          <span className={styles.checkBadge} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </div>
      )}
      <div className={compact ? styles.barCompact : styles.bar}>
        <span className={styles.barText}>
          {useTailors ? `${list.length} Boutiques` : `${count} Boutiques Selected`}
        </span>
        <Link href="/order-quote" className={styles.nextBtn}>
          Next
        </Link>
      </div>
      <div className={styles.list}>
        {useTailors ? (
          tailors.length > 0 ? (
            tailors.map((t) => <TailorCard key={t.id} tailor={t} />)
          ) : (
            <p className={styles.empty}>No boutiques found. Try again later.</p>
          )
        ) : (
          boutiques.map((b) => <BoutiqueCard key={b.id} boutique={b} />)
        )}
      </div>
    </section>
  );
}
