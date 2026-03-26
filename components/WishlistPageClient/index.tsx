"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import heartIcon from "../../app/assests/icons/heart.svg";
import styles from "./WishlistPageClient.module.scss";

export default function WishlistPageClient() {
  const router = useRouter();

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>My Wishlist</h1>
        <div className={styles.placeholder} />
      </header>

      {/* Empty state */}
      <main className={`${styles.main} main-with-bottom-nav`}>
        <div className={styles.emptyState}>

          {/* Illustration */}
          <div className={styles.iconWrap}>
            <div className={styles.iconCircle}>
              <Image
                src={heartIcon}
                alt="Empty wishlist"
                width={56}
                height={56}
                className={styles.heartIcon}
              />
            </div>
            {/* Decorative dots */}
            <span className={`${styles.dot} ${styles.dot1}`} aria-hidden />
            <span className={`${styles.dot} ${styles.dot2}`} aria-hidden />
            <span className={`${styles.dot} ${styles.dot3}`} aria-hidden />
          </div>

          <h2 className={styles.heading}>Your Wishlist is Empty</h2>
          <p className={styles.subtext}>
            Save your favourite items here and come back to them anytime.
          </p>

          <Link href="/" className={styles.exploreBtn}>
            Explore Products
          </Link>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
