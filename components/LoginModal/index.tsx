"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  normalizePhoneForApi,
  requestEcomOtp,
  ecomLogin,
  persistAuthSession,
} from "@/lib/auth";
import styles from "./LoginModal.module.scss";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneApi, setPhoneApi] = useState("");
  const [otp, setOtp] = useState("");
  const [dummyOtpHint, setDummyOtpHint] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const reset = () => {
    setStep("phone");
    setPhoneInput("");
    setPhoneApi("");
    setOtp("");
    setDummyOtpHint(null);
    setExpiresIn(null);
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const phone = normalizePhoneForApi(phoneInput);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await requestEcomOtp(phone);
      setPhoneApi(res.phone || phone);
      if (res.otp) setDummyOtpHint(res.otp);
      setExpiresIn(typeof res.expiresIn === "number" ? res.expiresIn : null);
      setStep("otp");
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.replace(/\D/g, "");
    if (code.length < 4) {
      setError("Enter the OTP sent to your phone.");
      return;
    }
    setLoading(true);
    try {
      const res = await ecomLogin(phoneApi, otp.trim());
      persistAuthSession(res);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={handleClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          ×
        </button>

        {step === "phone" ? (
          <>
            <p id="login-modal-title" className={styles.welcome}>
              Glad to have you at WEVRAA. Stay tuned for exclusive offers &amp; updates!
            </p>

            <div className={styles.dividerWrap}>
              <div className={styles.dividerLine} aria-hidden />
              <span className={styles.dividerLabel}>Login or Signup</span>
            </div>

            <p className={styles.hint}>
              Use your mobile number to continue — signing up is free!
            </p>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleRequestOtp}>
              <input
                type="tel"
                className={styles.input}
                placeholder="Enter Mobile Number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                autoComplete="tel"
                inputMode="numeric"
              />
              <button type="submit" className={styles.continueBtn} disabled={loading}>
                {loading ? "Please wait…" : "Continue"}
              </button>
            </form>

            <p className={styles.legal}>
              By signing in you agree to our{" "}
              <a href="/help" className={styles.link}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/help" className={styles.link}>
                Privacy Policy
              </a>
            </p>
          </>
        ) : (
          <>
            <p id="login-modal-title" className={styles.welcome}>
              Enter OTP
            </p>
            <p className={styles.otpHint}>
              We sent a code to <strong>{phoneApi}</strong>
            </p>
            {dummyOtpHint && (
              <p className={styles.otpMeta}>
                For testing, use OTP: <strong>{dummyOtpHint}</strong>
                {expiresIn != null ? ` (expires in ${expiresIn}s)` : null}
              </p>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleLogin}>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              <button type="submit" className={styles.continueBtn} disabled={loading}>
                {loading ? "Verifying…" : "Verify & continue"}
              </button>
            </form>

            <button type="button" className={styles.backLink} onClick={() => { setStep("phone"); setError(null); setOtp(""); }}>
              Change mobile number
            </button>

            <p className={styles.legal}>
              By signing in you agree to our{" "}
              <a href="/help" className={styles.link}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/help" className={styles.link}>
                Privacy Policy
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
