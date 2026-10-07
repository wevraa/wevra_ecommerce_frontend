import PolicyPage from "@/components/PolicyPage";
import styles from "@/components/PolicyPage/PolicyPage.module.scss";

export const metadata = { title: "Terms & Conditions – Wevraa" };

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions">
      <h2>Terms and Conditions</h2>
      <p className={styles.meta}>Effective Date: October 7, 2026</p>

      <p>
        These Terms and Conditions govern your access to and use of the Wevraa application,
        website, and services, including our tailor billing software and e-commerce platform. By
        using Wevraa, you agree to be bound by these terms.
      </p>

      <hr className={styles.divider} />

      <h3>1. Account Registration and Security</h3>
      <ul>
        <li>Users must provide accurate, current, and complete information during registration.</li>
        <li>
          Boutique owners utilizing the SaaS billing platform are responsible for maintaining the
          confidentiality of their account credentials and for all activities that occur under
          their account.
        </li>
        <li>You agree to notify us immediately of any unauthorized access to your account.</li>
      </ul>

      <h3>2. Services and Usage Rules</h3>
      <ul>
        <li>
          <strong>SaaS Application:</strong> Wevraa grants registered boutiques a non-exclusive,
          non-transferable license to use the billing and measurement digitization software. You
          agree not to reverse-engineer, misuse the AI measurement scanning APIs, or upload
          prohibited content.
        </li>
        <li>
          <strong>E-Commerce:</strong> All physical product orders (such as custom apparel and kids
          wear) are subject to availability. We reserve the right to modify the catalog, limit
          quantities, or discontinue products without prior notice.
        </li>
      </ul>

      <h3>3. Pricing and Payments</h3>
      <ul>
        <li>
          All prices are listed in Indian Rupees (₹) and are inclusive of applicable GST unless
          stated otherwise.
        </li>
        <li>
          Payments for software subscriptions and e-commerce purchases are processed securely via
          Razorpay.
        </li>
        <li>
          We reserve the right to update software subscription tiers and e-commerce product
          pricing. Continued use of the platform after a price update constitutes agreement to the
          new pricing.
        </li>
      </ul>

      <h3>4. Shipping and Delivery Policy</h3>
      <ul>
        <li>Wevraa ships e-commerce products pan-India.</li>
        <li>
          Estimated delivery timelines will be provided at checkout. Delays caused by logistics
          partners, public holidays, or unforeseen weather conditions are beyond our direct
          control.
        </li>
        <li>
          Tracking information will be shared via email or WhatsApp once the order is dispatched.
        </li>
      </ul>

      <h3>5. Return, Refund, and Cancellation Policy</h3>
      <ul>
        <li>
          <strong>E-Commerce Cancellations:</strong> Orders can be canceled before they are
          dispatched for a full refund. Once shipped, cancellations are not permitted.
        </li>
        <li>
          <strong>Custom Tailoring:</strong> Due to the bespoke nature of customized garments
          stitched to specific body measurements, custom orders are non-refundable and cannot be
          returned once the fabric has been cut. We will accommodate alterations per our internal
          sizing guarantee policy.
        </li>
        <li>
          <strong>SaaS Subscriptions:</strong> Software subscription fees are strictly
          non-refundable. You may cancel your subscription at any time to prevent future billing
          cycles.
        </li>
        <li>
          <strong>Refund Processing:</strong> Approved refunds will be credited back to the original
          payment method via Razorpay within 5 to 7 business days.
        </li>
      </ul>

      <h3>6. User-Generated Content</h3>
      <p>
        Boutique owners uploading customer measurement details or fabric images represent that they
        have obtained the necessary consent from their respective clients to digitize and store
        this information on the Wevraa platform.
      </p>

      <h3>7. Limitation of Liability</h3>
      <p>
        Wevraa provides its software and AI extraction tools on an &quot;as-is&quot; basis. While
        we strive for absolute accuracy in the multimodal measurement scanner, boutique owners are
        solely responsible for verifying the extracted numerical values before cutting fabric.
        Wevraa shall not be held liable for fabric loss, tailoring errors, or indirect damages
        resulting from the use of our software.
      </p>

      <h3>8. Governing Law and Jurisdiction</h3>
      <p>
        These Terms and Conditions shall be governed by and construed in accordance with the laws
        of India. Any disputes arising out of or in connection with these terms, the platform, or
        our services shall be subject to the exclusive jurisdiction of the competent courts in
        Bengaluru, Karnataka.
      </p>

      <h3>9. Modifications to Terms</h3>
      <p>
        We reserve the right to modify these Terms and Conditions at any time. Changes will be
        effective immediately upon posting to the website. Your continued use of the platform
        constitutes acceptance of the revised terms.
      </p>
    </PolicyPage>
  );
}
