"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNavItems } from "@/data/dummy";
import type { BottomNavItem as BottomNavItemType } from "@/data/dummy";
import styles from "./BottomNav.module.scss";

import homeIcon    from "../../app/assests/icons/home.svg";
import searchIcon  from "../../app/assests/icons/search.svg";
import measureIcon from "../../app/assests/icons/scalehome.svg";
import profileIcon from "../../app/assests/icons/person.svg";
import cartIcon    from "../../app/assests/icons/bag.svg";

const iconMap: Record<BottomNavItemType["icon"], string> = {
  home:    homeIcon,
  search:  searchIcon,
  measure: measureIcon,
  profile: profileIcon,
  cart:    cartIcon,
};

const navPaths: Record<string, string> = {
  home:    "/",
  search:  "/search",
  measure: "/select-boutiques",
  profile: "/profile",
  cart:    "/cart",
};

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {bottomNavItems.map((item) => {
        const href = navPaths[item.id] ?? "/";
        const isActive = pathname === href;
        return (
          <Link
            key={item.id}
            href={href}
            className={`${styles.item} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
          >
            <Image
              src={iconMap[item.icon]}
              alt={item.label}
              width={24}
              height={24}
              className={styles.icon}
            />
          </Link>
        );
      })}
    </nav>
  );
}
