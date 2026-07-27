"use client";

import { useEffect, useState } from "react";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import styles from "./OrderTypeSelect.module.scss";

interface OrderType {
  id: string;
  label: string;
  selected: boolean;
}

interface OrderTypeSelectProps {
  types: OrderType[];
}

export default function OrderTypeSelect({ types: initialTypes }: OrderTypeSelectProps) {
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);
  const storedOrderTypes = useBoutiquesSelectionStore((s) => s.orderContext.orderTypes);
  const [types, setTypes] = useState(initialTypes);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    if (storedOrderTypes?.length) {
      setTypes(
        initialTypes.map((t) => ({
          ...t,
          selected: storedOrderTypes.includes(t.label),
        }))
      );
    }
    setHydrated(true);
  }, [storedOrderTypes, initialTypes, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const selected = types.filter((t) => t.selected).map((t) => t.label);
    setOrderContext({ orderTypes: selected });
  }, [types, setOrderContext, hydrated]);

  const handleSelect = (id: string) => {
    setTypes((prev) => prev.map((t) => ({ ...t, selected: t.id === id })));
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Select Order Type</h2>
      <div className={styles.chips}>
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.chip} ${t.selected ? styles.selected : ""}`}
            onClick={() => handleSelect(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </section>
  );
}
