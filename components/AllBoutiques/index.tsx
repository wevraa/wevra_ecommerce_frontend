"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Boutique } from "@/data/dummy";
import type { ApiTailor } from "@/lib/api";
import BoutiqueCard from "@/components/BoutiqueCard";
import TailorCard from "@/components/TailorCard";
import {
  useBoutiquesSelectionStore,
  MAX_BOUTIQUE_SELECTION,
} from "@/lib/stores/boutiquesSelectionStore";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import styles from "./AllBoutiques.module.scss";

const bannerImage = "/images/placeholder-rect.svg";

interface AllBoutiquesProps {
  boutiques?: Boutique[];
  tailors?: ApiTailor[];
  compact?: boolean;
  productId?: string;
  productImage?: string;
}

export default function AllBoutiques({
  boutiques = [],
  tailors = [],
  compact,
  productId,
  productImage,
}: AllBoutiquesProps) {
  const router = useRouter();
  const { selectedBoutiques, toggleBoutique, setOrderContext } =
    useBoutiquesSelectionStore();
  const sleeveDesigns = useBoutiqueOrderStore((s) => s.sleeveDesigns);

  const useTailors = tailors.length > 0;
  const selectedCount = selectedBoutiques.length;

  useEffect(() => {
    if (!productId && !productImage) return;
    const sleeveDesignImage = productId ? sleeveDesigns[productId] : undefined;
    setOrderContext({ productId, productImage, sleeveDesignImage });
  }, [productId, productImage, sleeveDesigns, setOrderContext]);

  const handleNext = () => {
    const sleeveDesignImage = productId ? sleeveDesigns[productId] : undefined;
    setOrderContext({ productId, productImage, sleeveDesignImage });
    router.push("/order-quote");
  };

  return (
    <section className={styles.section}>
      <div className={styles.divider}>
        <span className={styles.dividerText}>All Boutiques</span>
      </div>

      {!compact && (
        <div className={styles.bannerWrap}>
          <Image
            src={bannerImage}
            alt=""
            fill
            className={styles.bannerImage}
            sizes="100vw"
          />
          <span className={styles.checkBadge} aria-hidden>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </div>
      )}

      <div className={compact ? styles.barCompact : styles.bar}>
        <span className={styles.barText}>
          {selectedCount > 0
            ? `${selectedCount}/${MAX_BOUTIQUE_SELECTION} Boutiques Selected`
            : useTailors
              ? `${tailors.length} Boutiques`
              : "Select Boutiques"}
        </span>
        <button
          type="button"
          className={styles.nextBtn}
          onClick={handleNext}
          disabled={selectedCount === 0}
        >
          Next
        </button>
      </div>

      <div className={styles.list}>
        {useTailors ? (
          tailors.length > 0 ? (
            tailors.map((t) => (
              <TailorCard
                key={t.id}
                tailor={t}
                isSelected={selectedBoutiques.some((b) => b.id === t.id)}
                onToggleSelect={() =>
                  toggleBoutique({
                    id: t.id,
                    name: t.name,
                    phone: t.phone,
                    address: t.addressLine1,
                  })
                }
                selectionDisabled={
                  selectedCount >= MAX_BOUTIQUE_SELECTION &&
                  !selectedBoutiques.some((b) => b.id === t.id)
                }
              />
            ))
          ) : (
            <p className={styles.empty}>No boutiques found. Try again later.</p>
          )
        ) : (
          boutiques.map((b) => (
            <BoutiqueCard
              key={b.id}
              boutique={b}
              isSelected={selectedBoutiques.some((sel) => sel.id === b.id)}
              onToggleSelect={() =>
                toggleBoutique({ id: b.id, name: b.name })
              }
              selectionDisabled={
                selectedCount >= MAX_BOUTIQUE_SELECTION &&
                !selectedBoutiques.some((sel) => sel.id === b.id)
              }
            />
          ))
        )}
      </div>
    </section>
  );
}
