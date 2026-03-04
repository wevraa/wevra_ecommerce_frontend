"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { heroSlides } from "@/data/dummy";
import styles from "./HeroCarousel.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const AUTOPLAY_MS = 4000;

interface BannerSlide {
  id: string;
  image: string;
  alt: string;
}

export default function HeroCarousel() {
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!API_BASE) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/v1/banners`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        const raw = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];
        const slides: BannerSlide[] = list
          .map((b: Record<string, unknown>) => {
            const id = typeof b.id === "string" ? b.id : String(b.id ?? "");
            const image =
              typeof b.image === "string"
                ? b.image
                : typeof b.imageUrl === "string"
                  ? b.imageUrl
                  : typeof b.url === "string"
                    ? b.url
                    : typeof b.bannerImage === "string"
                      ? b.bannerImage
                      : typeof b.src === "string"
                        ? b.src
                        : "";
            const alt =
              typeof b.alt === "string"
                ? b.alt
                : typeof b.title === "string"
                  ? b.title
                  : "Banner";
            return { id, image, alt };
          })
          .filter((s) => s.image);
        setBanners(slides);
      })
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  const slides = banners.length > 0 ? banners : heroSlides;
  const slide = slides[activeIndex];

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i === slides.length - 1 ? 0 : i + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slide) return null;

  return (
    <section className={styles.wrap} aria-label="Hero carousel">
      <div className={styles.slideWrap}>
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          className={styles.slide}
          sizes="100vw"
          priority
        />
      </div>
      <div className={styles.dots} role="tablist">
        {slides.map((_, i) => (
          <button
            key={slides[i].id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            className={`${styles.dot} ${i === activeIndex ? styles.active : ""}`}
            onClick={() => setActiveIndex(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
