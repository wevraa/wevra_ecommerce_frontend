import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/data/dummy";
import styles from "./ProfileBlock.module.scss";

interface ProfileBlockProps {
  profile: UserProfile;
}

export default function ProfileBlock({ profile }: ProfileBlockProps) {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <Image
            src={profile.avatar}
            alt=""
            fill
            className={styles.avatar}
            sizes="72px"
          />
          <span className={styles.checkBadge} aria-hidden>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
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
