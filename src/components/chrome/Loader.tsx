"use client";

import { useEffect, useState } from "react";
import { WESTERN_LINE } from "@/lib/content";
import s from "./Loader.module.css";

/*
 * The way home, drawn as the counter runs to 100: the Western line from Churchgate to Bhayandar,
 * each station lighting as the line reaches it, the name settling underneath. Then the curtain lifts
 * onto the platform. Once a visit; a reload in the same tab goes straight in.
 */

const NAME = "Mohit Bagri";
const DURATION = 2200;
const W = 1000;
const STOPS = WESTERN_LINE.map((name, i) => ({ name, x: Math.round((i / (WESTERN_LINE.length - 1)) * W) }));

export function Loader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"count" | "lift" | "gone">("count");

  useEffect(() => {
    const html = document.documentElement;
    const finish = () => {
      try {
        sessionStorage.setItem("loader", "1");
      } catch {}
      html.classList.remove("is-loading");
      html.classList.add("is-loaded");
      window.dispatchEvent(new Event("loader:done"));
    };
    let seen = false;
    try {
      seen = sessionStorage.getItem("loader") === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || seen) {
      const id = requestAnimationFrame(() => {
        setPhase("gone");
        finish();
      });
      return () => cancelAnimationFrame(id);
    }

    let raf = 0;
    let t1 = 0;
    let t2 = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / DURATION);
      const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setProgress(Math.round(eased * 100));
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        t1 = window.setTimeout(() => {
          setPhase("lift");
          finish();
        }, 320);
        t2 = window.setTimeout(() => setPhase("gone"), 1400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;
  const at = (progress / 100) * W;

  return (
    <div className={`${s.loader}${phase === "lift" ? ` ${s.lifting}` : ""}`} aria-hidden="true">
      <div className={s.center}>
        <svg className={s.line} viewBox="-40 -60 1080 140">
          <line x1={0} y1={0} x2={W} y2={0} className={s.track} />
          <line x1={0} y1={0} x2={at} y2={0} className={s.run} />
          {STOPS.map((st, i) => {
            const end = i === 0 || i === STOPS.length - 1;
            return (
              <g key={st.name}>
                <circle cx={st.x} cy={0} r={end ? 7 : 3.6} className={`${s.stop}${at >= st.x ? ` ${s.on}` : ""}`} />
                {end && (
                  <text x={st.x} y={i === 0 ? -22 : 38} textAnchor={i === 0 ? "start" : "end"} className={s.label}>
                    {st.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <p className={s.name}>
          {[...NAME].map((ch, i) => (
            <span key={i} className={progress >= 30 + (i / NAME.length) * 60 ? s.in : undefined}>
              {ch}
            </span>
          ))}
        </p>
      </div>
      <p className={s.count}>{progress}</p>
    </div>
  );
}
