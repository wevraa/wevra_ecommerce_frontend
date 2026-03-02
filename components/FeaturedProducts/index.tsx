import { getProducts } from "@/lib/api";
import styles from "./FeaturedProducts.module.scss";
import ProductCard from "@/components/ProductCard";


export default async function FeaturedProducts() {
  const products = await getProducts();

  const formattedProducts = products.map((item:any) => ({
    id: item.id,
    image: item.media?.[0]?.url || "/placeholder.png",
    alt: item.title,
    brand: item.category?.name || "Brand",
    price: Number(item.finalPrice) || 0,
    shortDescription: item.productDescription,
  }));

  return (
    <section
      className={styles.section}
      aria-labelledby="featured-products-title"
    >
      <h2 id="featured-products-title" className={styles.title}>
        Featured
      </h2>

      <div className={styles.grid}>
        {formattedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}