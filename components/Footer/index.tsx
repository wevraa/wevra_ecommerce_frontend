import Link from "next/link";
import Accordion from "@/components/Accordion";
import {
  footerShortDesc,
  footerBullets,
  footerAccordionItems,
  footerLongDesc,
  socialLinks,
} from "@/data/dummy";
import styles from "./Footer.module.scss";

const LEGAL_LINKS = [
  { href: "/contact",  label: "Contact Us" },
  { href: "/privacy",  label: "Privacy Policy" },
  { href: "/terms",    label: "Terms & Conditions" },
  { href: "/refund",   label: "Refund & Cancellation" },
  { href: "/shipping", label: "Shipping & Delivery" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.leftCol}>
            <p className={styles.shortDesc}>{footerShortDesc}</p>
            <ul className={styles.bullets}>
              {footerBullets.map((text, i) => (
                <li key={i} className={styles.bullet}>
                  {text}
                </li>
              ))}
            </ul>
            {/* <div className={styles.social}>
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className={styles.socialLink}
                  aria-label={link.label}
                >
                  {link.icon.toUpperCase()}
                </a>
              ))}
            </div> */}
          </div>
          <div className={styles.accordionWrap}>
            <Accordion items={footerAccordionItems} />
          </div>
        </div>

        {/* ── Legal links ── */}
        <nav className={styles.legalNav} aria-label="Legal">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={styles.legalLink}>
              {l.label}
            </Link>
          ))}
        </nav>

        <p className={styles.longDesc}>{footerLongDesc}</p>

        <p className={styles.copyright}>
          Copyright &copy; 2026 Wevraa. All rights reserved. A{" "}
          <span className={styles.printeasy}>Printeasy</span> Company.
        </p>
      </div>
    </footer>
  );
}
