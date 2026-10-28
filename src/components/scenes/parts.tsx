"use client";

import { forwardRef, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import s from "./parts.module.css";

// A seeded random source, so every painting is the same on the server, the client and every visit.
export function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Rounded to hundredths, so the server and the browser print the same numbers.
export const q = (n: number) => Math.round(n * 100) / 100;

/*
 * A cumulus, built from overlapping lobes over a flat base. The lit colour comes from the side the
 * light is on, the shade sits underneath. Drawn around (0,0), about 300 wide.
 */
export function Cloud({ id, lit, shade, seed = 1 }: { id: string; lit: string; shade: string; seed?: number }) {
  const r = rng(seed);
  const lobes = Array.from({ length: 6 }, (_, i) => {
    const x = -120 + i * 48 + (r() - 0.5) * 20;
    const rad = 34 + r() * 30 + (i > 1 && i < 4 ? 22 : 0);
    return { x, y: -rad * 0.55, rad };
  });
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="-95" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0.25" stopColor={lit} />
          <stop offset="1" stopColor={shade} />
        </linearGradient>
        <clipPath id={`${id}-base`}>
          <rect x={-220} y={-200} width={440} height={200} />
        </clipPath>
      </defs>
      <g fill={`url(#${id})`} clipPath={`url(#${id}-base)`}>
        {lobes.map((l, i) => (
          <circle key={i} cx={q(l.x)} cy={q(l.y + 14)} r={q(l.rad)} />
        ))}
        <ellipse cx={0} cy={0} rx={150} ry={26} />
      </g>
    </g>
  );
}

/*
 * Something that drifts slowly across part of the frame, forever. It enters from outside the frame
 * and fades out at the far end, so the loop wraps where nobody is looking.
 */
export function Drift({
  from,
  to,
  y,
  dur,
  delay = 0,
  scale = 1,
  children,
}: {
  from: number;
  to: number;
  y: number;
  dur: number;
  delay?: number;
  scale?: number;
  children: ReactNode;
}) {
  return (
    <g
      className={s.drift}
      style={
        {
          "--from": `${from}px`,
          "--to": `${to}px`,
          "--dur": `${dur}s`,
          "--delay": `${-delay}s`,
        } as CSSProperties
      }
    >
      <g transform={`translate(0 ${y}) scale(${scale})`}>{children}</g>
    </g>
  );
}

// A gull, two strokes and a slow beat.
export function Gull({ x, y, size = 1, color, beat = 1.6 }: { x: number; y: number; size?: number; color: string; beat?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path
        className={s.gull}
        style={{ "--beat": `${beat}s` } as CSSProperties}
        d="M-11 0 Q-5 -6 0 0 Q5 -6 11 0"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </g>
  );
}

/*
 * The wrapper every painted scene sits in: marks itself data-still while off screen so its
 * ambient loops pause, and tells children whether it is live.
 */

export function useLive<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setLive(e.isIntersecting);
        el.toggleAttribute("data-still", !e.isIntersecting);
      },
      { rootMargin: "80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, live] as const;
}

export const Paint = forwardRef<SVGSVGElement, { viewBox: string; className?: string; label?: string; children: ReactNode }>(
  function Paint({ viewBox, className, label, children }, ref) {
    return (
      <svg
        ref={ref}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        className={className}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        {children}
      </svg>
    );
  },
);
