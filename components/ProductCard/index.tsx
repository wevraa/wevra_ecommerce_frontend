import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/dummy";
import styles from "./ProductCard.module.scss";
import measure from "../../app/assests/icons/measure.svg"

interface ProductCardProps {
  product: Product;
  showShortDescription?: boolean;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product, showShortDescription }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <Link href={`/product/${product.id}`} className={styles.imageWrap}>
        <Image
          src={product.image}
          alt={product.alt}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <span className={styles.overlayIcon} aria-hidden>
         <Image src={measure} alt="measure"/>
        </span>
      </Link>

      <section className={styles.product_info}>
        <div className={styles.body}>
        
          <p className={styles.shortDescription}>{product.shortDescription}</p>
        
        <div className={styles.brand}>
          <span>{product.brand}</span>
        </div>
        <p className={styles.price}>{formatPrice(product.price)}</p>
      </div>
        <div>
          <Link href={`/product/${product.id}`} className={styles.addBtn} aria-label="View product">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        </div>
      </section>
      
    </article>
  );
}
