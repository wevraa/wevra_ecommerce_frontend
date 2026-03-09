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
      <div className={styles.inner}>
        <div className={styles.avatarWrap}>
          <Image src={profile.avatar} alt="" fill className={styles.avatar} sizes="72px" />
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.mobile}>Mobile : {profile.mobile}</p>
          <Link href="/profile" className={styles.editBtn}>
            Edit Profile
          </Link>
        </div>
      </div>

    </section>
  );
}
