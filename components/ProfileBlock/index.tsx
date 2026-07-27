import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/data/dummy";
import styles from "./ProfileBlock.module.scss";

interface ProfileBlockProps {
  profile: UserProfile;
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

export default function ProfileBlock({ profile }: ProfileBlockProps) {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatarFrame}>
            <Image
              src={profile.avatar}
              alt=""
              fill
              className={styles.avatar}
              sizes="64px"
            />
          </div>
          <span className={styles.checkBadge} aria-hidden>
            <CheckIcon />
          </span>
        </div>
        <div className={styles.info}>
          <h2 className={styles.name}>{profile.name}</h2>
          <p className={styles.mobile}>Mobile: {profile.mobile}</p>
          <Link href="/edit-profile" className={styles.editLink}>
            Edit Profile
          </Link>
        </div>
      </div>
    </section>
  );
}
