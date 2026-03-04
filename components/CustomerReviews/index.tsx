"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./CustomerReviews.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const REVIEWS_LIMIT = 10;

interface ApiReview {
  id: string;
  reviewText: string;
  customerImageUrl: string | null;
  customer: { name: string };
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<ApiReview[]>([]);

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/v1/reviews?limit=${REVIEWS_LIMIT}`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json: { data?: ApiReview[] }) => {
        const list = Array.isArray(json?.data) ? json.data : [];
        setReviews(list.slice(0, REVIEWS_LIMIT));
      })
      .catch(() => setReviews([]));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="reviews-title">
      <h2 id="reviews-title" className={styles.title}>
        Customer Reviews
      </h2>
      <div className={styles.scroll}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.card}>
            {review.customerImageUrl && (
              <div className={styles.avatarWrap}>
                <Image
                  src={review.customerImageUrl}
                  alt=""
                  fill
                  className={styles.avatar}
                  sizes="48px"
                />
              </div>
            )}
            <p className={styles.quote}>{review.reviewText}</p>
            <p className={styles.author}>— {review.customer?.name ?? "Customer"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
