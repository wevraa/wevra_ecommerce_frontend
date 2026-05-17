import PolicyPage from "@/components/PolicyPage";
import styles from "@/components/PolicyPage/PolicyPage.module.scss";

export const metadata = { title: "Privacy Policy – Wevraa" };

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <h2>Privacy Policy</h2>
      <p className={styles.meta}>Effective Date: May 17, 2026</p>

      <p>
        Welcome to Wevraa. Your privacy is important to us. This Privacy Policy explains how we
        collect, use, and protect your information when you use our website or mobile application.
      </p>
      <p>By using Wevraa, you agree to this Privacy Policy.</p>

      <hr className={styles.divider} />

      <h3>Information We Collect</h3>

      <p><strong>Personal Information</strong></p>
      <ul>
        <li>Name</li>
        <li>Phone number</li>
        <li>Email address</li>
        <li>Shipping and billing address</li>
      </ul>

      <p><strong>Order Information</strong></p>
      <ul>
        <li>Products purchased</li>
        <li>Order history</li>
        <li>Payment details</li>
        <li>Delivery preferences</li>
      </ul>

      <p><strong>Payment Information</strong></p>
      <p>
        Payments are securely processed through trusted third-party payment gateways. Wevraa does
        not store complete debit/credit card or banking information on its servers.
      </p>

      <p><strong>Device &amp; Usage Information</strong></p>
      <ul>
        <li>Device type</li>
        <li>Browser information</li>
        <li>IP address</li>
        <li>App activity and usage logs</li>
      </ul>

      <hr className={styles.divider} />

      <h3>How We Use Information</h3>
      <ul>
        <li>Process and deliver orders</li>
        <li>Provide customer support</li>
        <li>Send order updates and notifications</li>
        <li>Improve our services and user experience</li>
        <li>Prevent fraud and unauthorized activities</li>
      </ul>

      <h3>Data Sharing</h3>
      <p>We may share information with:</p>
      <ul>
        <li>Payment gateway providers</li>
        <li>Delivery and logistics partners</li>
        <li>Technology service providers</li>
        <li>Legal authorities if required by law</li>
      </ul>
      <p>We do not sell customer personal information.</p>

      <h3>Data Security</h3>
      <p>
        We use reasonable security measures to protect customer data against unauthorized access,
        loss, or misuse.
      </p>

      <h3>Cookies</h3>
      <p>
        Wevraa may use cookies and similar technologies to improve user experience and website
        performance.
      </p>

      <h3>User Rights</h3>
      <p>Users may request:</p>
      <ul>
        <li>Access to personal information</li>
        <li>Correction of inaccurate data</li>
        <li>Account deletion</li>
      </ul>

      <h3>Changes to This Policy</h3>
      <p>
        We may update this Privacy Policy from time to time. Continued use of the platform
        indicates acceptance of updated policies.
      </p>

      <hr className={styles.divider} />

      <h3>Contact</h3>
      <div className={styles.infoBox}>
        <p>For privacy-related questions:</p>
        <p><a href="mailto:support@wevraa.in">support@wevraa.in</a></p>
      </div>
    </PolicyPage>
  );
}
