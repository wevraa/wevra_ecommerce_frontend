import PolicyPage from "@/components/PolicyPage";
import styles from "@/components/PolicyPage/PolicyPage.module.scss";

export const metadata = { title: "Shipping & Delivery Policy – Wevraa" };

export default function ShippingPage() {
  return (
    <PolicyPage title="Shipping & Delivery">
      <h2>Shipping &amp; Delivery Policy</h2>
      <p className={styles.meta}>Effective Date: May 17, 2026</p>

      <p>
        Wevraa provides shipping services for products purchased through our platform.
      </p>

      <hr className={styles.divider} />

      <h3>Delivery Locations</h3>
      <p>We currently deliver to selected locations across India.</p>

      <h3>Shipping Timelines</h3>
      <p>Estimated delivery times:</p>
      <ul>
        <li><strong>Metro cities:</strong> 2–5 business days</li>
        <li><strong>Other locations:</strong> 5–10 business days</li>
      </ul>
      <p>
        Delivery timelines may vary depending on product availability and customer location.
      </p>

      <h3>Shipping Charges</h3>
      <p>
        Shipping charges, if applicable, will be shown during checkout before payment.
      </p>

      <h3>Order Tracking</h3>
      <p>
        Customers may receive tracking details through SMS, email, WhatsApp, or app notifications.
      </p>

      <h3>Delivery Delays</h3>
      <p>Delivery delays may occur due to:</p>
      <ul>
        <li>Weather conditions</li>
        <li>Courier partner issues</li>
        <li>Public holidays</li>
        <li>Incorrect address details</li>
      </ul>

      <h3>Failed Deliveries</h3>
      <p>
        If delivery fails due to incorrect information provided by the customer, additional
        shipping charges may apply for re-delivery.
      </p>

      <hr className={styles.divider} />

      <h3>Contact</h3>
      <div className={styles.infoBox}>
        <p><a href="mailto:support@wevraa.in">support@wevraa.in</a></p>
      </div>
    </PolicyPage>
  );
}
