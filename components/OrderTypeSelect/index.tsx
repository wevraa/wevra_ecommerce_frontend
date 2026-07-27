"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ApiTailorCategory,
  ApiTailorCategoryTreeNode,
} from "@/lib/api";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import styles from "./OrderTypeSelect.module.scss";

interface OrderTypeSelectProps {
  categories: ApiTailorCategory[];
  tree: ApiTailorCategoryTreeNode[];
}

export default function OrderTypeSelect({
  categories,
  tree,
}: OrderTypeSelectProps) {
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);
  const orderContext = useBoutiquesSelectionStore((s) => s.orderContext);

  const activeCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    return tree.map((n) => ({
      id: n.id,
      name: n.name,
      description: n.description,
      status: n.status,
      sortOrder: n.sortOrder,
      parentId: n.parentId,
    }));
  }, [categories, tree]);

  const [categoryId, setCategoryId] = useState<string>(() => {
    if (
      orderContext.tailorCategoryId &&
      activeCategories.some((c) => c.id === orderContext.tailorCategoryId)
    ) {
      return orderContext.tailorCategoryId;
    }
    return activeCategories[0]?.id ?? "";
  });

  const orderTypes = useMemo(() => {
    const node = tree.find((n) => n.id === categoryId);
    return (node?.children ?? []).map((child) => ({
      id: child.id,
      label: child.name.trim(),
    }));
  }, [tree, categoryId]);

  const [orderTypeId, setOrderTypeId] = useState<string>(() => {
    if (
      orderContext.orderTypeId &&
      orderTypes.some((t) => t.id === orderContext.orderTypeId)
    ) {
      return orderContext.orderTypeId;
    }
    return orderTypes[0]?.id ?? "";
  });

  // Keep category in sync when API data arrives
  useEffect(() => {
    if (!activeCategories.length) return;
    const stillValid = activeCategories.some((c) => c.id === categoryId);
    if (!stillValid) {
      const preferred =
        orderContext.tailorCategoryId &&
        activeCategories.some((c) => c.id === orderContext.tailorCategoryId)
          ? orderContext.tailorCategoryId
          : activeCategories[0].id;
      setCategoryId(preferred);
    }
  }, [activeCategories, categoryId, orderContext.tailorCategoryId]);

  // Keep order type in sync when category / children change
  useEffect(() => {
    if (!orderTypes.length) {
      setOrderTypeId("");
      return;
    }
    const stillValid = orderTypes.some((t) => t.id === orderTypeId);
    if (!stillValid) {
      const preferred =
        orderContext.orderTypeId &&
        orderTypes.some((t) => t.id === orderContext.orderTypeId)
          ? orderContext.orderTypeId
          : orderTypes[0].id;
      setOrderTypeId(preferred);
    }
  }, [orderTypes, orderTypeId, orderContext.orderTypeId]);

  // Persist selection into local order context
  useEffect(() => {
    const category = activeCategories.find((c) => c.id === categoryId);
    const orderType = orderTypes.find((t) => t.id === orderTypeId);
    if (!category && !orderType) return;

    setOrderContext({
      tailorCategoryId: category?.id,
      category: category?.name,
      orderTypeId: orderType?.id,
      orderTypes: orderType ? [orderType.label] : [],
    });
  }, [
    categoryId,
    orderTypeId,
    activeCategories,
    orderTypes,
    setOrderContext,
  ]);

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
  };

  const handleOrderTypeSelect = (id: string) => {
    setOrderTypeId(id);
  };

  if (activeCategories.length === 0 && orderTypes.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Select Order Type</h2>
        <p className={styles.empty}>No order types available.</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Select Category</h2>
      <div className={styles.chips} role="list">
        {activeCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="listitem"
            className={`${styles.chip} ${categoryId === c.id ? styles.selected : ""}`}
            onClick={() => handleCategorySelect(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <h2 className={`${styles.title} ${styles.titleSpaced}`}>Select Order Type</h2>
      <div className={styles.chips} role="list">
        {orderTypes.length === 0 ? (
          <p className={styles.empty}>No types for this category.</p>
        ) : (
          orderTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              role="listitem"
              className={`${styles.chip} ${orderTypeId === t.id ? styles.selected : ""}`}
              onClick={() => handleOrderTypeSelect(t.id)}
            >
              {t.label}
            </button>
          ))
        )}
      </div>
    </section>
  );
}
