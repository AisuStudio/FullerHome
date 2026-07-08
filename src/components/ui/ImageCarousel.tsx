"use client";

import { useState } from "react";
import type { StaticImageData } from "next/image";
import styles from "./ImageCarousel.module.css";

interface ImageCarouselProps {
  images: StaticImageData[];
  alts: string[];
  caption: string;
}

/** Simple prev/next + dots image carousel — no external deps, matches the
 * site's existing tab-button pattern (DeliverySection's takt tabs). */
export default function ImageCarousel({ images, alts, caption }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        <img
          src={images[index].src}
          alt={alts[index]}
          loading="lazy"
          className={styles.img}
        />
        <button
          type="button"
          className={`${styles.nav} ${styles.prev}`}
          onClick={prev}
          aria-label="Previous image"
        >
          ‹
        </button>
        <button
          type="button"
          className={`${styles.nav} ${styles.next}`}
          onClick={next}
          aria-label="Next image"
        >
          ›
        </button>
        <div className={styles.dots}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Image ${i + 1} / ${images.length}`}
              aria-current={i === index}
            />
          ))}
        </div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
