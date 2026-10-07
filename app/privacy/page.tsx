import PolicyPage from "@/components/PolicyPage";
import styles from "@/components/PolicyPage/PolicyPage.module.scss";

export const metadata = { title: "Privacy Policy – Wevraa" };

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <h2>Privacy Policy</h2>
      <p className={styles.meta}>Effective Date: October 7, 2026</p>

      <p>
        This Privacy Policy describes how Wevraa (&quot;we&quot;, &quot;our&quot;, or
        &quot;us&quot;) collects, uses, and protects your personal data in compliance with the
        Digital Personal Data Protection Act, 2023 (DPDPA) and the Information Technology Act,
        2000.
      </p>

      <hr className={styles.divider} />

      <h3>1. Data Fiduciary Identity</h3>
      <p>
        Wevraa, registered in Karnataka, India, acts as the Data Fiduciary determining the purpose
        and means of processing your personal data.
      </p>

      <h3>2. Categories of Personal Data Collected</h3>
      <p>
        We collect the following types of information to provide our tailored e-commerce and SaaS
        billing services:
      </p>
      <ul>
        <li>
          <strong>Identity &amp; Contact Data:</strong> Name, mobile number, email address, and
          billing/shipping address.
        </li>
        <li>
          <strong>Tailoring &amp; Measurement Data:</strong> Specific bodily measurements, fit
          preferences, and images of handwritten measurement notebooks uploaded for digital
          extraction.
        </li>
        <li>
          <strong>Financial Data:</strong> Payment transaction details. We utilize Razorpay as our
          certified payment processor; we do not store your complete credit card or UPI PIN data on
          our servers.
        </li>
        <li>
          <strong>Technical Data:</strong> Device information, IP address, and application usage
          logs for platform security and debugging.
        </li>
      </ul>

      <h3>3. Purpose and Legal Basis of Processing</h3>
      <p>
        We process your personal data based on your explicit consent and for the legitimate use of
        fulfilling our service obligations. Your data is used exclusively to:
      </p>
      <ul>
        <li>Digitize boutique measurement records and generate customer invoices.</li>
        <li>Process e-commerce orders, tailor custom garments, and deliver products.</li>
        <li>Communicate order updates and billing receipts via WhatsApp or email.</li>
        <li>Ensure platform security and prevent fraudulent transactions.</li>
      </ul>

      <h3>4. Data Sharing and Third-Party Processors</h3>
      <p>
        We do not sell your personal data to data brokers or third-party advertisers. We share
        required data only with vetted service providers bound by strict data processing
        agreements, including:
      </p>
      <ul>
        <li>
          <strong>Cloud &amp; AI Infrastructure:</strong> Secure processing of measurement images
          using enterprise cloud providers to power our automated extraction tools.
        </li>
        <li>
          <strong>Payment Gateways:</strong> Razorpay for secure processing of your checkout
          transactions.
        </li>
        <li>
          <strong>Logistics Partners:</strong> Courier services for fulfilling e-commerce and
          physical garment deliveries.
        </li>
      </ul>

      <h3>5. Data Retention and Security</h3>
      <p>
        We implement reasonable technical and organizational security safeguards, including
        encryption and access controls, to protect your data. Personal data is retained only for as
        long as necessary to fulfill the stated purposes or to comply with Indian tax and legal
        obligations (such as GST record-keeping).
      </p>

      <h3>6. Rights of Data Principals</h3>
      <p>Under the DPDPA, you have the following statutory rights regarding your personal data:</p>
      <ul>
        <li>
          <strong>Right to Access:</strong> Request a summary of the personal data we hold about
          you.
        </li>
        <li>
          <strong>Right to Correction &amp; Erasure:</strong> Request the update of inaccurate data
          or deletion of your data when it is no longer required.
        </li>
        <li>
          <strong>Right to Withdraw Consent:</strong> You may withdraw your previously granted
          consent at any time, subject to legal limitations regarding active transactions.
        </li>
        <li>
          <strong>Right to Nominate:</strong> Nominate another individual to exercise your rights in
          the event of your death or incapacity.
        </li>
        <li>
          <strong>Right to Grievance Redressal:</strong> Escalate privacy concerns to our designated
          Grievance Officer.
        </li>
      </ul>

      <hr className={styles.divider} />

      <h3>7. Grievance Officer</h3>
      <div className={styles.infoBox}>
        <p>
          To exercise your rights or report a privacy concern, please contact our Data
          Protection/Grievance Officer:
        </p>
        <ul>
          <li>
            Email: <a href="mailto:info@wevraa.in">info@wevraa.in</a>
          </li>
          <li>Address: Wevraa, Bengaluru, Karnataka, India.</li>
        </ul>
      </div>
    </PolicyPage>
  );
}
