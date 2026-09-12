"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { playWarningBeeps } from "@/utils/alertSound";
import styles from "./DozeExplosion.module.css";

const SHARDS = [
  { clip: "polygon(0 0, 36% 0, 28% 32%, 0 24%)", x: -220, y: -160, r: -22 },
  { clip: "polygon(36% 0, 68% 0, 62% 22%, 28% 32%)", x: 30, y: -240, r: 14 },
  { clip: "polygon(68% 0, 100% 0, 100% 26%, 62% 22%)", x: 260, y: -150, r: 20 },
  { clip: "polygon(0 24%, 28% 32%, 22% 62%, 0 70%)", x: -280, y: 40, r: -16 },
  { clip: "polygon(28% 32%, 62% 22%, 58% 58%, 22% 62%)", x: -40, y: 20, r: 8 },
  { clip: "polygon(62% 22%, 100% 26%, 100% 64%, 58% 58%)", x: 300, y: 30, r: 18 },
  { clip: "polygon(0 70%, 22% 62%, 34% 100%, 0 100%)", x: -200, y: 220, r: -12 },
  { clip: "polygon(22% 62%, 58% 58%, 70% 100%, 34% 100%)", x: 10, y: 260, r: 10 },
  { clip: "polygon(58% 58%, 100% 64%, 100% 100%, 70% 100%)", x: 240, y: 210, r: 16 },
];

export default function DozeExplosion() {
  useEffect(() => {
    const stopBeeps = playWarningBeeps();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return stopBeeps;
    }

    const motion = document.documentElement.animate(
      [
        { transform: "translate(0, 0)" },
        { transform: "translate(-10px, 6px)" },
        { transform: "translate(12px, -8px)" },
        { transform: "translate(-8px, -4px)" },
        { transform: "translate(7px, 5px)" },
        { transform: "translate(0, 0)" },
      ],
      { duration: 500, easing: "ease-out" },
    );

    return () => {
      stopBeeps();
      motion.cancel();
      document.documentElement.style.transform = "";
    };
  }, []);

  return createPortal(
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.flash} />
      <svg
        className={styles.cracks}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M50 50 L12 8 M50 50 L88 10 M50 50 L96 46 M50 50 L82 92 M50 50 L48 98 M50 50 L8 78 M50 50 L4 42 M50 50 L38 6 M50 50 L70 4 M50 50 L18 56" />
        <path d="M28 32 L18 20 M62 22 L78 16 M58 58 L72 70 M22 62 L14 74" />
      </svg>
      <div className={styles.shards}>
        {SHARDS.map((shard, index) => (
          <div
            key={index}
            className={styles.shard}
            style={{
              clipPath: shard.clip,
              "--dx": `${shard.x}px`,
              "--dy": `${shard.y}px`,
              "--rot": `${shard.r}deg`,
              "--delay": `${index * 18}ms`,
            }}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
}
