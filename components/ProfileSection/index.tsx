"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccessToken, clearAuthSession } from "@/lib/auth";
import { getProfile, type ApiProfile } from "@/lib/profile";
import styles from "./ProfileSection.module.scss";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function ProfileSection() {
  const router = useRouter();
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }
    setLoggedIn(true);
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch {
      setProfile(null);
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
    return () => window.removeEventListener("auth-changed", onAuth);
  }, [load]);

  const handleLogout = () => {
    clearAuthSession();
    setProfile(null);
    setLoggedIn(false);
    router.push("/");
  };

  /* ── Shimmer skeleton ── */
  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.inner}>
          <span className={`${styles.avatarSkeleton} shimmer`} aria-hidden />
          <div className={styles.info}>
            <span className={`${styles.skelName} shimmer`} aria-hidden />
            <span className={`${styles.skelMobile} shimmer`} aria-hidden />
            <span className={`${styles.skelBtn} shimmer`} aria-hidden />
          </div>
        </div>
        <nav className={styles.links} aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`${styles.skelLink} shimmer`} />
          ))}
        </nav>
      </section>
    );
  }

  /* ── Not logged in ── */
  if (!loggedIn || !profile) {
    return (
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={`${styles.avatarWrap} ${styles.avatarGuest}`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className={styles.info}>
            <h1 className={styles.name}>Guest</h1>
            <p className={styles.mobile}>Sign in to view your profile</p>
          </div>
        </div>
        <nav className={styles.links} aria-label="Profile options">
          <Link href="/chat" className={styles.linkRow}><span>Messages</span></Link>
          <Link href="/orders" className={styles.linkRow}><span>Orders</span></Link>
          <Link href="/measurement" className={styles.linkRow}><span>Measurement</span></Link>
          <Link href="/help" className={styles.linkRow}><span>Help and Support</span></Link>
        </nav>
      </section>
    );
  }

  /* ── Logged in ── */
  const initials = getInitials(profile.name || profile.phone || "U");
  const displayAddress = profile.address
    ? [profile.address.line, profile.address.city, profile.address.state, profile.address.pincode]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={`${styles.avatarWrap} ${styles.avatarInitials}`} aria-hidden>
          <span>{initials}</span>
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{profile.name || "—"}</h1>
          <p className={styles.mobile}>{profile.phone}</p>
          {profile.email && <p className={styles.email}>{profile.email}</p>}
          <Link href="/profile/edit" className={styles.editBtn}>
            Edit Profile
          </Link>
        </div>
      </div>

      {displayAddress && (
        <div className={styles.addressBlock}>
          <p className={styles.addressLabel}>Address</p>
          <p className={styles.addressText}>{displayAddress}</p>
        </div>
      )}

      <nav className={styles.links} aria-label="Profile options">
        <Link href="/chat" className={styles.linkRow}><span>Messages</span></Link>
        <Link href="/orders" className={styles.linkRow}><span>Orders</span></Link>
        <Link href="/measurement" className={styles.linkRow}><span>Measurement</span></Link>
        <Link href="/help" className={styles.linkRow}><span>Help and Support</span></Link>
        <button type="button" className={styles.linkRow} onClick={handleLogout}>
          <span>Logout</span>
        </button>
      </nav>
    </section>
  );
}
