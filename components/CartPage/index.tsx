"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem as CartItemType, Product, FooterAccordionItem } from "@/data/dummy";
import { frequentlyBroughtTogetherProducts, ourPoliciesItems } from "@/data/dummy";
import CartHeader from "@/components/CartHeader";
import CartItem from "@/components/CartItem";
import CartCheckout from "@/components/CartCheckout";
import FrequentlyBroughtTogether from "@/components/FrequentlyBroughtTogether";
import OurPolicies from "@/components/OurPolicies";
import BottomNav from "@/components/BottomNav";
import { getCartItems, removeCartItem, updateCartItemQuantity } from "@/lib/cartStorage";
import styles from "./CartPage.module.scss";

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[]>([]);

  const frequentlyBroughtTogether: Product[] = frequentlyBroughtTogetherProducts;
  const policiesItems: FooterAccordionItem[] = ourPoliciesItems;

  useEffect(() => {
    getCartItems().then((loaded) => setItems(loaded));
  }, []);

  const { total, count } = useMemo(() => {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    return { total, count };
  }, [items]);

  const handleRemove = async (id: string) => {
    await removeCartItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleQuantityChange = async (id: string, quantity: number) => {
    await updateCartItemQuantity(id, quantity);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  return (
    <>
      <CartHeader itemCount={count} />
      <main className={styles.main}>
        <div className={styles.items}>
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>
        <CartCheckout total={total} />
        <FrequentlyBroughtTogether products={frequentlyBroughtTogether} />
        <OurPolicies items={policiesItems} />
      </main>
      <BottomNav />
    </>
  );
}
