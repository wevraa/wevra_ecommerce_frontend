import PolicyPage from "@/components/PolicyPage";
import styles from "@/components/PolicyPage/PolicyPage.module.scss";

export const metadata = { title: "Refund & Cancellation Policy – Wevraa" };

export default function RefundPage() {
  return (
    <PolicyPage title="Refund & Cancellation">
      <h2>Refund &amp; Cancellation Policy</h2>
      <p className={styles.meta}>Effective Date: May 17, 2026</p>

      <p>At Wevraa, customer satisfaction is important to us.</p>

      <hr className={styles.divider} />

      <h3>Order Cancellation</h3>
      <p>
        Customers may cancel orders before they are shipped. Once shipped, cancellation requests
        may not be accepted.
      </p>

      <h3>Returns &amp; Replacements</h3>
      <p>Customers may request returns or replacements for:</p>
      <ul>
        <li>Damaged products</li>
        <li>Defective items</li>
        <li>Incorrect products received</li>
      </ul>
      <p>Return requests should be raised within <strong>7 days</strong> of delivery.</p>

      <h3>Non-Returnable Items</h3>
      <p>Returns may not be accepted for:</p>
      <ul>
        <li>Used products</li>
        <li>Damaged items due to customer misuse</li>
        <li>Customized or personalized products</li>
        <li>Products without original packaging</li>
      </ul>

      <h3>Refund Processing</h3>
      <p>
        Approved refunds are generally processed within <strong>5–10 business days</strong> to
        the original payment method.
      </p>

      <h3>Refund Rejection</h3>
      <p>Refunds may be rejected if returned products fail quality inspection.</p>

      <hr className={styles.divider} />

      <h3>Contact</h3>
      <div className={styles.infoBox}>
        <p>For refund or cancellation support:</p>
        <p><a href="mailto:support@wevraa.in">support@wevraa.in</a></p>
      </div>
    </PolicyPage>
  );
}
