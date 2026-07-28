"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getAccessToken } from "@/lib/auth";
import { getProfile, type ApiProfile } from "@/lib/profile";
import styles from "./ProfileBlock.module.scss";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function ProfileBlock() {
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setLoggedIn(false);
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoggedIn(true);
    setLoading(true);
    try {
      setProfile(await getProfile());
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

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.card}>
          <div className={`${styles.avatarWrap} ${styles.avatarSkeleton}`} aria-hidden />
          <div className={styles.info}>
            <span className={`${styles.skelLine} ${styles.skelName}`} aria-hidden />
            <span className={`${styles.skelLine} ${styles.skelMobile}`} aria-hidden />
          </div>
        </div>
      </section>
    );
  }

  if (!loggedIn || !profile) {
    return (
      <section className={styles.section}>
        <div className={styles.card}>
          <div className={`${styles.avatarWrap} ${styles.avatarGuest}`} aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className={styles.info}>
            <h2 className={styles.name}>Guest</h2>
            <p className={styles.mobile}>Sign in to continue</p>
            <Link href="/profile" className={styles.editLink}>
              Sign In
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const initials = getInitials(profile.name || profile.phone || "U");
  const phone = profile.phone?.trim() || "—";

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <div className={`${styles.avatarFrame} ${styles.avatarInitials}`} aria-hidden>
            <span>{initials}</span>
          </div>
          <span className={styles.checkBadge} aria-hidden>
            <CheckIcon />
          </span>
        </div>
        <div className={styles.info}>
          <h2 className={styles.name}>{profile.name || "—"}</h2>
          <p className={styles.mobile}>Mobile: {phone}</p>
          <Link href="/edit-profile" className={styles.editLink}>
            Edit Profile
          </Link>
        </div>
      </div>
    </section>
  );
}
