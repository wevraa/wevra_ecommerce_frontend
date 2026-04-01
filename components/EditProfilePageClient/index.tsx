"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserProfile } from "@/data/dummy";
import styles from "./EditProfilePageClient.module.scss";

interface EditProfilePageClientProps {
  initialProfile: UserProfile;
}

export default function EditProfilePageClient({
  initialProfile,
}: EditProfilePageClientProps) {
  const router = useRouter();
  const [mobile, setMobile] = useState(initialProfile.mobile);
  const [name, setName] = useState(initialProfile.name);
  const [addressLine1, setAddressLine1] = useState(
    initialProfile.addressLine1 ?? ""
  );
  const [addressLine2, setAddressLine2] = useState(
    initialProfile.addressLine2 ?? ""
  );
  const [state, setState] = useState(initialProfile.state ?? "");
  const [city, setCity] = useState(initialProfile.city ?? "");
  const [pincode, setPincode] = useState(initialProfile.pincode ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/select-boutiques");
  };

  return (
    <main className={styles.main}>
      <header className={styles.headerBar}>
        <Link
          href="/select-boutiques"
          className={styles.backBtn}
          aria-label="Back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className={styles.headerTitle}>Edit Profile</h1>
        <span className={styles.headerSpacer} aria-hidden />
      </header>

      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-mobile">
              Mobile number
            </label>
            <input
              id="edit-mobile"
              className={styles.input}
              type="tel"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-name">
              Name
            </label>
            <input
              id="edit-name"
              className={styles.input}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-address1">
              Address 1
            </label>
            <input
              id="edit-address1"
              className={styles.input}
              type="text"
              autoComplete="address-line1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-address2">
              Address 2
            </label>
            <input
              id="edit-address2"
              className={styles.input}
              type="text"
              autoComplete="address-line2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-state">
              State
            </label>
            <input
              id="edit-state"
              className={styles.input}
              type="text"
              autoComplete="address-level1"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-city">
              City
            </label>
            <input
              id="edit-city"
              className={styles.input}
              type="text"
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-pincode">
              Pincode
            </label>
            <input
              id="edit-pincode"
              className={styles.input}
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.saveBtn}>
            Save
          </button>
        </form>
      </div>
    </main>
  );
}
