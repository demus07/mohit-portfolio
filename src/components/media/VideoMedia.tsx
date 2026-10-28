"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import s from "./VideoMedia.module.css";

export function VideoMedia({
  src,
  poster,
  alt,
  active,
}: {
  src: string;
  poster: string;
  alt: string;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const play = active && !reduced;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (play) {
      // Autoplay can be refused (low-power mode, data saver); the poster stays up then.
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [play]);

  return (
    <div className={s.root} role="img" aria-label={alt}>
      <video
        ref={ref}
        className={s.video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
      />
    </div>
  );
}
