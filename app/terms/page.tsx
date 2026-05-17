import PolicyPage from "@/components/PolicyPage";
import styles from "@/components/PolicyPage/PolicyPage.module.scss";

export const metadata = { title: "Terms & Conditions – Wevraa" };

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions">
      <h2>Terms and Conditions</h2>
      <p className={styles.meta}>Effective Date: May 17, 2026</p>

      <p>
        Welcome to Wevraa. By accessing or using our website or mobile application, you agree to
        comply with these Terms and Conditions.
      </p>

      <hr className={styles.divider} />

      <h3>Services</h3>
      <p>
        Wevraa is an e-commerce platform that allows customers to browse and purchase
        fashion-related products, clothing, fabrics, and accessories.
      </p>

      <h3>User Responsibilities</h3>
      <p>Users agree:</p>
      <ul>
        <li>To provide accurate information</li>
        <li>Not to misuse the platform</li>
        <li>Not to engage in fraudulent activities</li>
        <li>Not to upload harmful or illegal content</li>
      </ul>

      <h3>Orders &amp; Payments</h3>
      <ul>
        <li>Orders are confirmed only after successful payment.</li>
        <li>Prices and availability may change without prior notice.</li>
        <li>Payments are processed through third-party payment gateways.</li>
      </ul>

      <h3>Product Information</h3>
      <p>
        We attempt to provide accurate product descriptions and images. Minor variations in color
        or appearance may occur due to screen settings or photography.
      </p>

      <h3>Shipping &amp; Delivery</h3>
      <p>
        Delivery timelines are estimates and may vary depending on location, courier services, or
        unforeseen circumstances.
      </p>

      <h3>Intellectual Property</h3>
      <p>
        All logos, content, images, designs, and platform materials are owned by Wevraa and
        protected under applicable intellectual property laws.
      </p>

      <h3>Account Suspension</h3>
      <p>Wevraa reserves the right to suspend or terminate accounts involved in:</p>
      <ul>
        <li>Fraudulent activities</li>
        <li>Abuse of platform services</li>
        <li>Violation of these terms</li>
      </ul>

      <h3>Limitation of Liability</h3>
      <p>Wevraa shall not be liable for:</p>
      <ul>
        <li>Delivery delays caused by logistics providers</li>
        <li>Indirect or incidental damages</li>
        <li>Service interruptions beyond our control</li>
      </ul>

      <h3>Changes to Terms</h3>
      <p>
        Wevraa may update these Terms &amp; Conditions at any time. Continued use of the platform
        indicates acceptance of updated terms.
      </p>

      <hr className={styles.divider} />

      <h3>Contact</h3>
      <div className={styles.infoBox}>
        <p><a href="mailto:support@wevraa.in">support@wevraa.in</a></p>
      </div>
    </PolicyPage>
  );
}
