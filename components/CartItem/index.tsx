"use client";

import Image from "next/image";
import type { CartItem as CartItemType } from "@/data/dummy";
import styles from "./CartItem.module.scss";
import deleteIcon from "../../app/assests/icons/delete.svg"
import add from "../../app/assests/icons/add.svg"


function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

interface CartItemProps {
  item: CartItemType;
  onRemove?: (id: string) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
}

export default function CartItem({
  item,
  onRemove,
  onQuantityChange,
}: CartItemProps) {
  const handleIncrement = () => {
    onQuantityChange?.(item.id, item.quantity + 1);
  };

  return (
    <div className={styles.row}>
      <div className={styles.imageWrap}>
        <Image
          src={item.image}
          alt={item.brand}
          fill
          className={styles.image}
          sizes="100px"
        />
      </div>

      <div className={styles.details}>
        <p className={styles.brand}>{item.brand}</p>

        <p className={styles.description}>{item.description}</p>

        <p className={styles.price}>{formatPrice(item.price)}</p>

        <div className={styles.sizeRemove}>
          <span className={styles.size}>Size {item.size}</span>

          <button
            type="button"
            className={styles.remove}
            onClick={() => onRemove?.(item.id)}
          >
            Remove
          </button>
        </div>

        <div className={styles.quantityWrap}>
          <button
            type="button"
            className={styles.deleteBtn}
            aria-label="Delete item"
            onClick={() => onRemove?.(item.id)}
          >
             <Image src={deleteIcon} alt="deleteIcon"/>
          </button>

          <input
            type="number"
            className={styles.qtyInput}
            value={item.quantity}
            readOnly
          />

          <button
            type="button"
            className={styles.qtyBtn}
            onClick={handleIncrement}
          >
            <Image src={add} alt="add"/>
          </button>
        </div>
      </div>
    </div>
  );
}