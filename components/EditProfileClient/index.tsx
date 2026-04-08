"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { getProfile, updateProfile, type ApiProfile } from "@/lib/profile";
import styles from "./EditProfileClient.module.scss";

interface FormState {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function profileToForm(p: ApiProfile): FormState {
  return {
    name: p.name ?? "",
    phone: p.phone ?? "",
    address: p.address?.line ?? "",
    city: p.address?.city ?? "",
    state: p.address?.state ?? "",
    pincode: p.address?.pincode ?? "",
  };
}

export default function EditProfileClient() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      router.replace("/profile");
      return;
    }
    setLoading(true);
    try {
      const p = await getProfile();
      setForm(profileToForm(p));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: Record<string, string> = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.city.trim()) payload.city = form.city.trim();
      if (form.state.trim()) payload.state = form.state.trim();
      if (form.pincode.trim()) payload.pincode = form.pincode.trim();

      await updateProfile(payload);
      setSuccess(true);
      // Briefly show success then go back to profile
      setTimeout(() => router.push("/profile"), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Skeleton ── */
  if (loading) {
    return (
      <>
        <header className={styles.header}>
          <span className={`${styles.skelIcon} shimmer`} aria-hidden />
          <span className={`${styles.skelTitle} shimmer`} aria-hidden />
          <span className={styles.headerSpacer} />
        </header>
        <main className={`${styles.main} main-with-bottom-nav`}>
          <div className={styles.card}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.fieldGroup}>
                <span className={`${styles.skelLabel} shimmer`} aria-hidden />
                <span className={`${styles.skelInput} shimmer`} aria-hidden />
              </div>
            ))}
            <span className={`${styles.skelSaveBtn} shimmer`} aria-hidden />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>Edit Profile</h1>
        <div className={styles.headerSpacer} />
      </header>

      <main className={`${styles.main} main-with-bottom-nav`}>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>

          {/* Personal info */}
          <p className={styles.sectionLabel}>Personal Info</p>

          <div className={styles.fieldGroup}>
            <label htmlFor="ep-name" className={styles.label}>Full Name</label>
            <input
              id="ep-name"
              name="name"
              type="text"
              className={styles.input}
              placeholder="e.g. Rajesh Kumar"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="ep-phone" className={styles.label}>Phone</label>
            <input
              id="ep-phone"
              name="phone"
              type="tel"
              className={styles.input}
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          {/* Address */}
          <p className={styles.sectionLabel} style={{ marginTop: 24 }}>Address</p>

          <div className={styles.fieldGroup}>
            <label htmlFor="ep-address" className={styles.label}>Address Line</label>
            <input
              id="ep-address"
              name="address"
              type="text"
              className={styles.input}
              placeholder="e.g. 123 Main Street, Apt 4B"
              value={form.address}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.fieldGroup}>
              <label htmlFor="ep-city" className={styles.label}>City</label>
              <input
                id="ep-city"
                name="city"
                type="text"
                className={styles.input}
                placeholder="Mumbai"
                value={form.city}
                onChange={handleChange}
                autoComplete="address-level2"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="ep-state" className={styles.label}>State</label>
              <input
                id="ep-state"
                name="state"
                type="text"
                className={styles.input}
                placeholder="Maharashtra"
                value={form.state}
                onChange={handleChange}
                autoComplete="address-level1"
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="ep-pincode" className={styles.label}>Pincode</label>
            <input
              id="ep-pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              className={styles.input}
              placeholder="400001"
              value={form.pincode}
              onChange={handleChange}
              autoComplete="postal-code"
              maxLength={6}
            />
          </div>

          {/* Feedback */}
          {error && <p className={styles.errorMsg} role="alert">{error}</p>}
          {success && <p className={styles.successMsg} role="status">Profile updated!</p>}

          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </main>
    </>
  );
}
