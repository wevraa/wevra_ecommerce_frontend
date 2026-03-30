"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import LoginModal from "@/components/LoginModal";
import { getAccessToken } from "@/lib/auth";
import {
  getWishlist,
  removeFromWishlist,
  type WishlistItem,
} from "@/lib/wishlist";
import heartIcon from "../../app/assests/icons/heart.svg";
import styles from "./WishlistPageClient.module.scss";

function formatPrice(value: string | null | undefined): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function WishlistPageClient() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setLoggedIn(false);
      setItems([]);
      setLoading(false);
      return;
    }
    setLoggedIn(true);
    setLoading(true);
    try {
      const list = await getWishlist();
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onAuth = () => load();
    window.addEventListener("auth-changed", onAuth);
    window.addEventListener("wishlist-changed", onAuth);
    return () => {
      window.removeEventListener("auth-changed", onAuth);
      window.removeEventListener("wishlist-changed", onAuth);
    };
  }, [load]);

  const openLogin = () => setLoginOpen(true);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((row) => (row.product?.id ?? row.productId) !== productId));
    } catch {
      /* ignore */
    } finally {
      setRemovingId(null);
    }
  };

  const renderEmptyLoggedIn = () => (
    <div className={styles.emptyState}>
      <div className={styles.iconWrap}>
        <div className={styles.iconCircle}>
          <Image src={heartIcon} alt="" width={56} height={56} className={styles.heartIcon} />
        </div>
        <span className={`${styles.dot} ${styles.dot1}`} aria-hidden />
        <span className={`${styles.dot} ${styles.dot2}`} aria-hidden />
        <span className={`${styles.dot} ${styles.dot3}`} aria-hidden />
      </div>
      <h2 className={styles.heading}>Your Wishlist is Empty</h2>
      <p className={styles.subtext}>Save your favourite items here and come back to them anytime.</p>
      <Link href="/" className={styles.exploreBtn}>
        Explore Products
      </Link>
    </div>
  );

  const renderNotLoggedIn = () => (
    <div className={styles.emptyState}>
      <div className={styles.iconWrap}>
        <div className={styles.iconCircle}>
          <Image src={heartIcon} alt="" width={56} height={56} className={styles.heartIcon} />
        </div>
      </div>
      <h2 className={styles.heading}>Sign in to see your wishlist</h2>
      <p className={styles.subtext}>Log in with your mobile number to save and view products.</p>
      <button type="button" className={styles.exploreBtn} onClick={openLogin}>
        Sign in
      </button>
    </div>
  );

  return (
    <>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>My Wishlist</h1>
        <div className={styles.placeholder} />
      </header>

      <main className={`${styles.main} main-with-bottom-nav`}>
        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : !loggedIn ? (
          renderNotLoggedIn()
        ) : items.length === 0 ? (
          renderEmptyLoggedIn()
        ) : (
          <ul className={styles.list}>
            {items.map((row) => {
              const p = row.product;
              if (!p?.id) return null;
              const image = p.media?.[0]?.url ?? "/images/placeholder-rect.svg";
              const price = formatPrice(p.finalPrice ?? p.mrp);
              return (
                <li key={p.id} className={styles.row}>
                  <Link href={`/product/${p.id}`} className={styles.thumbWrap}>
                    <Image src={image} alt={p.title} fill className={styles.thumb} sizes="88px" />
                  </Link>
                  <div className={styles.rowBody}>
                    <Link href={`/product/${p.id}`} className={styles.rowTitle}>
                      {p.title}
                    </Link>
                    <p className={styles.rowPrice}>{price}</p>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      disabled={removingId === p.id}
                      onClick={() => handleRemove(p.id)}
                    >
                      {removingId === p.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <BottomNav />

      <LoginModal open={loginOpen} onClose={() => { setLoginOpen(false); load(); }} />
    </>
  );
}
