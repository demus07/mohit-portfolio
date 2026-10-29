"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { platforms, type Project } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Led } from "../kit";
import { platformAnchor, platformNumber } from "./shared";

/*
 * The black LED indicator board that hangs over every Mumbai platform.
 * Column labels and statuses are short board furniture (like a scoreboard's
 * printed headings), not copy, so they live here rather than in content.ts.
 */
const STATUS_LIVE = "LIVE";
const STATUS_ON_TIME = "ON TIME";

// The grid is shared by the header row and every data row so columns line up.
// Phones keep PF, destination (with the train name tucked under it) and status;
// the year and the separate train column only appear once there is room.
const GRID =
  "grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 md:grid-cols-[3.5rem_4.5rem_minmax(0,1.15fr)_minmax(0,1fr)_7rem] md:gap-x-6";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

// opacity keyframes with a dip read as an LED row stuttering on, not a fade
const row: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: [0, 1, 0.3, 1], transition: { duration: 0.55, times: [0, 0.3, 0.55, 1], ease: "linear" } },
};

// the destination flips down like a split-flap card as its row lights
const flap: Variants = {
  hidden: { rotateX: -85, opacity: 0 },
  show: { rotateX: 0, opacity: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export function DepartureBoard({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[6px] border border-rail bg-[#04060c]",
        // a faint amber spill from the LEDs onto the casing, static so it costs nothing
        "shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9),inset_0_0_60px_-20px_rgb(244_166_64/0.08)]",
      )}
    >
      {/* casing rail with the maroon Western Railway stripe */}
      <div className="flex items-center justify-between gap-4 border-b border-rail px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <span className="h-3 w-1 rounded-full bg-wr" aria-hidden />
          <Led text="Departures" className="text-[11px] md:text-xs" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-haze">WR · Up</span>
      </div>

      {/* column heads */}
      <div className={cn(GRID, "border-b border-rail px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-haze md:px-6")}>
        <span>PF</span>
        <span className="hidden md:block">Year</span>
        <span>Destination</span>
        <span className="hidden md:block">Train</span>
        <span className="text-right">Status</span>
      </div>

      <motion.ol
        variants={list}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once: true, amount: 0.3 }}
        // dot-matrix texture: a static dotted overlay sells "LED panel" without per-frame cost
        className="relative bg-[radial-gradient(rgb(239_232_216/0.035)_1px,transparent_1px)] bg-[length:4px_4px]"
      >
        {projects.map((p, i) => {
          const pf = platformNumber(i);
          const live = Boolean(p.live);
          return (
            <motion.li key={p.id} variants={row} className="border-b border-rail/60 last:border-b-0">
              <a
                href={`#${platformAnchor(i)}`}
                className={cn(
                  GRID,
                  "group px-4 py-3.5 outline-none transition-colors duration-300 md:px-6 md:py-4",
                  "hover:bg-sodium/[0.04] focus-visible:bg-sodium/[0.06]",
                )}
              >
                <Led text={pf} className="text-sm md:text-base" />
                <span className="hidden font-mono text-xs tracking-[0.12em] text-chalk/70 md:block">{p.period}</span>

                <span className="min-w-0 [perspective:600px]">
                  <motion.span variants={flap} className="block origin-top truncate">
                    <Led text={platforms.board[p.id] ?? p.title} className="text-[13px] md:text-base" />
                  </motion.span>
                  {/* phones have no train column, so the name rides under the destination */}
                  <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-haze md:hidden">
                    {p.title}
                  </span>
                </span>

                <span className="hidden truncate font-mono text-xs uppercase tracking-[0.12em] text-chalk/80 transition-colors group-hover:text-chalk md:block">
                  {p.title}
                </span>

                <span className="flex items-center justify-end gap-2">
                  {live && (
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-sodium shadow-[0_0_8px_rgb(244_166_64/0.9)] motion-safe:animate-pulse"
                    />
                  )}
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.16em] md:text-[11px]",
                      live ? "text-sodium" : "text-chalk/55",
                    )}
                  >
                    {live ? STATUS_LIVE : STATUS_ON_TIME}
                  </span>
                </span>
              </a>
            </motion.li>
          );
        })}
      </motion.ol>
    </div>
  );
}
