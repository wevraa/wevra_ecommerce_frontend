import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/data/dummy";
import styles from "./ProfileSection.module.scss";

interface ProfileSectionProps {
  profile: UserProfile;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.avatarWrap}>
          <Image src={profile.avatar} alt="" fill className={styles.avatar} sizes="72px" />
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.mobile}>Mobile : {profile.mobile}</p>
          <div>
          <button type="button" className={styles.editBtn}>
            Edit Profile
          </button>
        </div>
        </div>
        
      </div>

      <nav className={styles.links} aria-label="Profile options">
        <Link href="/orders" className={styles.linkRow}>
          <span>Orders</span>
          
        </Link>
        <Link href="/measurement" className={styles.linkRow}>
          <span>Measurement</span>
         
        </Link>
        {/* <Link href="/addons" className={styles.linkRow}>
          <span>Add ons</span>
          <span className={styles.linkArrow} aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </Link> */}
        {/* <Link href="/select-boutiques" className={styles.linkRow}>
          <span>Boutiques / Order Quote</span>
          <span className={styles.linkArrow} aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </Link> */}
        <Link href="/help" className={styles.linkRow}>
          <span>Help and Support</span>
         
        </Link>
         <Link href="/help" className={styles.linkRow}>
          <span>Logout</span>
          
        </Link>
      </nav>
    </section>
  );
}
