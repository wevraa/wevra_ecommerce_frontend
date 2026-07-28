"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import styles from "./Sidebar.module.scss";

import homeIcon    from "../../app/assests/icons/home.svg";
import searchIcon  from "../../app/assests/icons/search.svg";
import measureIcon from "../../app/assests/icons/measure.svg";
import profileIcon from "../../app/assests/icons/person.svg";
import cartIcon    from "../../app/assests/icons/bag.svg";

const NAV_ITEMS = [
  { label: "Home",        href: "/",           icon: homeIcon },
  { label: "Search",      href: "/search",      icon: searchIcon },
  { label: "Measurement", href: "/measurement", icon: measureIcon },
  { label: "Profile",     href: "/profile",     icon: profileIcon },
  { label: "Cart",        href: "/cart",        icon: cartIcon },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-label="Navigation menu"
        aria-hidden={!open}
      >
        {/* Drawer header */}
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.logo} onClick={onClose}>
            WEVRAA
          </Link>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <span className={styles.navIcon}>
                  <Image src={item.icon} alt="" width={22} height={22} />
                </span>
                <span className={styles.navLabel}>{item.label}</span>
                {isActive && <span className={styles.activeBar} aria-hidden />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.drawerFooter}>
          <p className={styles.footerText}>© 2025 WEVRAA</p>
        </div>
      </aside>
    </>
  );
}
