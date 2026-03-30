"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import PromoBanner from "@/components/PromoBanner";
import Sidebar from "@/components/Sidebar";
import LoginModal from "@/components/LoginModal";
import { getCartItems } from "@/lib/cartStorage";
import {
  AUTH_ACCESS_TOKEN_KEY,
  clearAuthSession,
} from "@/lib/auth";
import styles from "./Header.module.scss";

import cartIcon from "../../app/assests/icons/bag.svg";
import heartIcon from "../../app/assests/icons/heart.svg";

interface HeaderProps {
  /** Show search bar (default true for home). */
  showSearch?: boolean;
  /** Show promo strip, e.g. “Discounts, Gifts…” (default true for home). */
  showPromo?: boolean;
}

export default function Header({ showSearch = true, showPromo = true }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () =>
      setLoggedIn(typeof window !== "undefined" && !!localStorage.getItem(AUTH_ACCESS_TOKEN_KEY));
    sync();
    window.addEventListener("auth-changed", sync);
    return () => window.removeEventListener("auth-changed", sync);
  }, []);

  const refreshCartCount = () => {
    getCartItems().then((items) => {
      const total = items.reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(total);
    });
  };

  useEffect(() => {
    refreshCartCount();
    window.addEventListener("cart-updated", refreshCartCount);
    return () => window.removeEventListener("cart-updated", refreshCartCount);
  }, []);

  useEffect(() => {
    const open = () => setLoginOpen(true);
    window.addEventListener("open-login", open);
    return () => window.removeEventListener("open-login", open);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.left}>
            {/* Hamburger — opens sidebar on mobile */}
            <button
              type="button"
              className={styles.menuButton}
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className={styles.logo}>WEVRAA</span>
          </div>

          <div className={styles.actions}>
            {loggedIn ? (
              <button
                type="button"
                className={styles.loginBtn}
                onClick={() => {
                  clearAuthSession();
                }}
              >
                Log out
              </button>
            ) : (
              <button type="button" className={styles.loginBtn} onClick={() => setLoginOpen(true)}>
                Login
              </button>
            )}
            {/* Wishlist */}
            <Link href="/wishlist" className={styles.iconButton} aria-label="Wishlist">
              <Image src={heartIcon} alt="Wishlist" width={22} height={22} />
            </Link>
            {/* Cart with count badge */}
            <Link href="/cart" className={styles.iconButton} aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}>
              <Image src={cartIcon} alt="Cart" width={22} height={22} />
              {cartCount > 0 && (
                <span className={styles.cartBadge} aria-hidden>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {(showSearch || showPromo) && (
          <div className={styles.searchPromoWrap}>
            {showSearch && (
              <div className={styles.searchWrap}>
                <SearchBar />
              </div>
            )}
            {showPromo && <PromoBanner />}
          </div>
        )}
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
