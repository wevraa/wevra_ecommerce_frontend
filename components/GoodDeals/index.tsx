import Image from "next/image";
import styles from "./GoodDeals.module.scss";
import { getCollections } from "@/lib/api";


export default async function GoodDeals() {
  const collections = await getCollections();

  return (
    <section className={styles.section} aria-labelledby="good-deals-title">
      <h2 id="good-deals-title" className={styles.title}>
        GOOD DEALS
      </h2>

      <div className={styles.grid}>
        {collections?.map((item:any) => (
          <button key={item.id} type="button" className={styles.tile}>
            {item.image && (
              <span className={styles.tileImageWrap}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className={styles.tileImage}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </span>
            )}

            <span className={styles.tileTitle}>{item.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}