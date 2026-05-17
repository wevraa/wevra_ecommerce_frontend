import PolicyPage from "@/components/PolicyPage";
import styles from "@/components/PolicyPage/PolicyPage.module.scss";

export const metadata = { title: "Contact Us – Wevraa" };

export default function ContactPage() {
  return (
    <PolicyPage title="Contact Us">
      <h2>Welcome to Wevraa Support</h2>
      <p>We are committed to providing a smooth shopping experience for our customers.</p>

      <hr className={styles.divider} />

      <h3>Business Information</h3>
      <div className={styles.infoBox}>
        <p><strong>Wevraa</strong></p>
        <p>Bengaluru, Karnataka, India</p>
      </div>

      <h3>Customer Support</h3>
      <div className={styles.infoBox}>
        <p>Email: <a href="mailto:support@wevraa.in">support@wevraa.in</a></p>
      </div>

      <h3>Business Enquiries</h3>
      <div className={styles.infoBox}>
        <p>Email: <a href="mailto:contact@wevraa.in">contact@wevraa.in</a></p>
      </div>

      <h3>Phone Support</h3>
      <div className={styles.infoBox}>
        <p><a href="tel:+916361559704">+91 6361559704</a></p>
      </div>

      <h3>Working Hours</h3>
      <div className={styles.infoBox}>
        <span className={styles.badge}>Monday – Saturday</span>
        <p>10:00 AM – 7:00 PM IST</p>
      </div>

      <hr className={styles.divider} />

      <p>
        For any questions related to orders, payments, shipping, returns, or support,
        please contact us through email or phone.
      </p>
    </PolicyPage>
  );
}
