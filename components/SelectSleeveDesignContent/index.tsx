"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./SelectSleeveDesignContent.module.scss";

const CATEGORY_TABS = ["Boat Neck", "High Neck", "U Neck", "Collar", "V Neck", "Square Neck"];

interface DesignCard {
  id: string;
  type: "upload" | "image";
  label: string;
  labelVariant: "primary" | "secondary";
  image?: string;
  alt?: string;
}

const DESIGN_CARDS: DesignCard[] = [
  {
    id: "1",
    type: "upload",
    label: "Front Design",
    labelVariant: "primary",
  },
  {
    id: "2",
    type: "image",
    label: "Sleeve Design",
    labelVariant: "primary",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=533&fit=crop",
    alt: "Yellow top with bell sleeves",
  },
  {
    id: "3",
    type: "image",
    label: "Back Design",
    labelVariant: "primary",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=533&fit=crop",
    alt: "Blouse back design",
  },
  {
    id: "4",
    type: "image",
    label: "Scrlet Blouse Design",
    labelVariant: "secondary",
    image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=533&fit=crop",
    alt: "Embroidered neck design",
  },
  {
    id: "5",
    type: "image",
    label: "Scrlet Blouse Design",
    labelVariant: "secondary",
    image: "https://images.unsplash.com/photo-1595776613215-fe04b96de91d?w=400&h=533&fit=crop",
    alt: "Sleeve design",
  },
  {
    id: "6",
    type: "image",
    label: "Buy Premium Design Catalogue",
    labelVariant: "secondary",
    image: "https://images.unsplash.com/photo-1583391736752-1a1d2c9aafe2?w=400&h=533&fit=crop",
    alt: "Premium design",
  },
  {
    id: "7",
    type: "image",
    label: "Scrlet Blouse Design",
    labelVariant: "secondary",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=533&fit=crop",
    alt: "Blouse neckline",
  },
  {
    id: "8",
    type: "image",
    label: "Scrlet Blouse Design",
    labelVariant: "secondary",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=533&fit=crop",
    alt: "Blouse design",
  },
  {
    id: "9",
    type: "image",
    label: "Scrlet Blouse Design",
    labelVariant: "secondary",
    image: "",
    alt: "",
  },
  {
    id: "10",
    type: "image",
    label: "Scrlet Blouse Design",
    labelVariant: "secondary",
    image: "",
    alt: "",
  },
];

export default function SelectSleeveDesignContent() {
  const [activeTab, setActiveTab] = useState(CATEGORY_TABS[0]);

  return (
    <div className={styles.wrap}>
      

      <div className={styles.grid}>
        {DESIGN_CARDS.map((card) => (
          <article key={card.id} className={`${styles.card} ${!card.image && card.type !== "upload" ? styles.placeholderCard : ""}`}>
            <div className={styles.cardImage}>
              {card.type === "upload" ? (
                <div className={styles.uploadPlaceholder}>
                  <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Upload photo
                </div>
              ) : card.image ? (
                <Image
                  src={card.image}
                  alt={card.alt ?? card.label}
                  fill
                  className={styles.cardImageContent}
                  sizes="(max-width: 768px) 50vw, 200px"
                />
              ) : null}
             
            </div>
            <div
              className={`${styles.cardLabel} ${
                card.labelVariant === "primary" ? styles.cardLabelPrimary : styles.cardLabelSecondary
              }`}
            >
              {card.label}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
