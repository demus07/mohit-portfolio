"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { belief } from "@/lib/content";
import { BeliefScene } from "./belief/scene";
import { Garland } from "./belief/garland";

/*
 * Belief, after Mohit's own mumbai-local branch: Siddhivinayak at first light, his scene and garland
 * unchanged. The one quiet stop on the walk, so the motion is slow and small: the sky warms as you
 * pass through, the quote arrives a sentence at a time, the diyas flicker.
 */

// one sentence per line gives the quote its natural pause between belief and work
const lines = belief.quote.split(/(?<=[.!?])\s+/);

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.45, delayChildren: 0.1 } },
};
const line: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

export function Belief() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // warm through the middle of the pass, so the dawn peaks while the quote is centred
  const warm = useTransform(scrollYProgress, [0.18, 0.6], [0, 1]);
  const gold = useTransform(scrollYProgress, [0.18, 0.6], [0.4, 1]);
  const onScreen = useInView(ref, { margin: "120px 0px" });

  return (
    <section ref={ref} className="belief" id="belief" aria-label={belief.label}>
      <BeliefScene warm={reduce ? 1 : warm} gold={reduce ? 1 : gold} running={onScreen && !reduce} />
      <Garland className="belief-garland" />
      {/* keeps the quote at full contrast even once the sky turns warm */}
      <div aria-hidden className="belief-scrim" />
      <div className="belief-copy">
        <motion.blockquote variants={container} initial={reduce ? false : "hidden"} whileInView="show" viewport={{ once: true, amount: 0.6 }}>
          {lines.map((l) => (
            <motion.span key={l} variants={line}>
              {l}
            </motion.span>
          ))}
        </motion.blockquote>
        <p>{belief.note}</p>
      </div>
    </section>
  );
}
