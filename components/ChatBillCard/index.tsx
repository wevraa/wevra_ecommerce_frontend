import Image from "next/image";
import { formatBillAmount, formatRequiredBy } from "@/lib/chat/format";
import type { ChatBill, ChatMessage } from "@/lib/chat/types";
import styles from "./ChatBillCard.module.scss";

interface ChatBillCardProps {
  msg: ChatMessage;
  bill: ChatBill;
  timeLabel: string;
}

export default function ChatBillCard({ msg, bill, timeLabel }: ChatBillCardProps) {
  const tailor = bill.tailorDetails;
  const boutiqueName = tailor?.boutiqueName ?? "Boutique";

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        {tailor?.logoUrl ? (
          <div className={styles.logoWrap}>
            <Image src={tailor.logoUrl} alt="" fill className={styles.logo} sizes="40px" />
          </div>
        ) : (
          <div className={styles.logoPlaceholder} aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}
        <div className={styles.headerText}>
          <p className={styles.boutiqueName}>{boutiqueName}</p>
          <p className={styles.billNo}>Bill #{bill.billNo}</p>
        </div>
      </header>

      {msg.body ? <p className={styles.intro}>{msg.body}</p> : null}

      <p className={styles.delivery}>
        Delivery date: <strong>{formatRequiredBy(bill.deliveryDate)}</strong>
      </p>

      {bill.items.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={styles.itemTitle}>{item.description}</span>
                    {item.orderType ? (
                      <span className={styles.itemType}>{item.orderType}</span>
                    ) : null}
                  </td>
                  <td>{item.qty}</td>
                  <td>{formatBillAmount(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <dl className={styles.totals}>
        <div className={styles.totalRow}>
          <dt>Subtotal</dt>
          <dd>{formatBillAmount(bill.subtotal)}</dd>
        </div>
        <div className={styles.totalRow}>
          <dt>Advance paid</dt>
          <dd>{formatBillAmount(bill.advancePaid)}</dd>
        </div>
        <div className={`${styles.totalRow} ${styles.balanceRow}`}>
          <dt>Balance</dt>
          <dd>{formatBillAmount(bill.balance)}</dd>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotalRow}`}>
          <dt>Total</dt>
          <dd>{formatBillAmount(bill.total)}</dd>
        </div>
      </dl>

      {tailor?.address ? <p className={styles.address}>{tailor.address}</p> : null}

      {msg.orderId ? (
        <p className={styles.orderRef}>Order ref: {msg.orderId.slice(0, 8)}…</p>
      ) : null}

      <p className={styles.time}>{timeLabel}</p>
    </article>
  );
}
