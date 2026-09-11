"use client";

import { useState } from "react";
import styles from "./YoutubePlayer.module.css";

export default function YoutubePlayer({ videoId, title }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={styles.frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.thumb}
      onClick={() => setPlaying(true)}
      aria-label={`${title}を再生`}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        className={styles.image}
      />
      <span className={styles.playIcon} aria-hidden="true">
        ▶
      </span>
    </button>
  );
}
