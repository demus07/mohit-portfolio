"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { offTheClock } from "@/lib/content";
import { TapriScene } from "./scenes/tapri";
import { BseScene } from "./scenes/bse";
import { MonsoonScene } from "./scenes/monsoon";

/*
 * Off the clock, after Mohit's own mumbai-local branch: his scenes, unchanged, on a strip that slides
 * sideways as you scroll, like the city going past a train window. Wankhede follows as its own pinned
 * scene, so it is not repeated here. Phones and reduced motion get a plain vertical stack, because
 * sideways pinning on touch fights the thumb.
 */
type SceneKey = "tapri" | "bse" | "monsoon";
const SCENES: { key: SceneKey; Scene: ComponentType<{ active: boolean }> }[] = [
  { key: "tapri", Scene: TapriScene },
  { key: "bse", Scene: BseScene },
  { key: "monsoon", Scene: MonsoonScene },
];

export function OffTheClock() {
  const wide = useWide();
  const reduce = useReducedMotion();
  return (
    <section className="otc" id="off-the-clock" aria-label={offTheClock.label}>
      {wide && !reduce ? <Pinned /> : <Stacked />}
    </section>
  );
}

function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // slide exactly the overflow, measured, so the last card lands flush whatever the viewport
  const [travel, setTravel] = useState(0);
  useEffect(() => {
    const measure = () => track.current && setTravel(Math.max(0, track.current.scrollWidth - window.innerWidth));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);
  const [active, setActive] = useState(0);
  useEffect(
    () => scrollYProgress.on("change", (v) => setActive(Math.min(SCENES.length - 1, Math.floor(v * SCENES.length)))),
    [scrollYProgress],
  );

  return (
    <div ref={ref} style={{ height: `${(SCENES.length + 1) * 100}vh` }}>
      <div className="otc-stage">
        <motion.div ref={track} style={{ x }} className="otc-track">
          <div className="otc-head">
            <h2>{offTheClock.title}</h2>
          </div>
          {SCENES.map(({ key, Scene }, i) => (
            <Card key={key} k={key} active={i === active}>
              <Scene active={i === active} />
            </Card>
          ))}
          <div className="otc-tail" />
        </motion.div>
      </div>
    </div>
  );
}

function Stacked() {
  return (
    <div className="otc-stack">
      <div className="otc-head">
        <h2>{offTheClock.title}</h2>
      </div>
      {SCENES.map(({ key, Scene }) => (
        <StackedCard key={key} k={key} Scene={Scene} />
      ))}
    </div>
  );
}

function StackedCard({ k, Scene }: { k: SceneKey; Scene: ComponentType<{ active: boolean }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref}>
      <Card k={k} active stacked>
        <Scene active={active} />
      </Card>
    </div>
  );
}

function Card({ k, active, stacked, children }: { k: SceneKey; active: boolean; stacked?: boolean; children: React.ReactNode }) {
  const s = offTheClock.scenes[k];
  return (
    <figure className={stacked ? "otc-card is-stacked" : "otc-card"} data-on={active ? "" : undefined}>
      <div className="otc-frame">{children}</div>
      <figcaption>
        <span className="t">{s.title}</span>
        <span className="b">{s.body}</span>
      </figcaption>
    </figure>
  );
}

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const set = () => setWide(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return wide;
}
