"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IllustrationTag } from "./tag";

// Port of the auction-xi.com hero (BroadcastStory, projector variant): same acts,
// timings, easing and sample data. Sized in cqw; width/height tweens -> scale.

type Act = "bidding" | "podium" | "finances" | "mentions" | "closer";
const ACTS: Act[] = ["bidding", "podium", "finances", "mentions", "closer"];
const ACT_MS: Record<Act, number> = { bidding: 7200, podium: 5000, finances: 5000, mentions: 4500, closer: 3500 };
const EASE = [0.22, 1, 0.36, 1] as const;
const GOLD = "#eab308";
const CSS =
  '@layer components{.axi-d{font-family:Anton,Impact,Haettenschweiler,"Arial Narrow Bold","Roboto Condensed",sans-serif-condensed,sans-serif;text-transform:uppercase;line-height:.95;letter-spacing:.01em}}@keyframes axi-live{50%{opacity:.25}}.axi-live{animation:axi-live 1.4s ease-in-out infinite}';

const TEAMS = [
  { s: "SHK", name: "Stormhawks", c: "#5B2C8A" },
  { s: "TBK", name: "Tidebreakers", c: "#0A4E8B" },
  { s: "FKG", name: "Firekings", c: "#C7401C" },
  { s: "SKR", name: "Skyriders", c: "#1C6FB0" },
];
// [amount, leading team index]: an uneven climb, teams outbidding each other
const BID_STEPS: [string, number][] = [["0.30", -1], ["0.55", 0], ["0.95", 1], ["1.40", 2], ["1.85", 1], ["2.30", 3], ["2.75", 2]];
const BURST = [[-9, -7], [9, -8], [-12, 2], [12, 3], [-5, 9], [6, 8]];

const fade = (delay = 0) => ({ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay } });
const rise = (y: string, duration: number, delay = 0) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration, ease: EASE },
});

function Sil({ o = 0.8 }: { o?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/work/auctionxi/silhouette.webp" alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain object-bottom" style={{ opacity: o }} />;
}

function Title({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="shrink-0 text-center">
      <div className="axi-d text-[4.4cqw] tracking-wide text-white">{children}</div>
      {sub && <div className="mt-[0.6cqw] text-[2.25cqw] uppercase tracking-[0.3em] text-white/45">{sub}</div>}
    </div>
  );
}

/* act 1: bid war, then SOLD (UNSOLD on odd rounds). `still`: static frame, no timers */
function ActBidding({ round, still = false }: { round: number; still?: boolean }) {
  const [step, setStep] = useState(still ? 4 : 0);
  const [done, setDone] = useState(false);
  const unsold = round % 2 === 1;

  useEffect(() => {
    if (still) return;
    const timers = BID_STEPS.slice(1).map((_, i) => setTimeout(() => setStep(i + 1), 500 + (i + 1) * 640));
    timers.push(setTimeout(() => setDone(true), 5300));
    return () => timers.forEach(clearTimeout);
  }, [still]);

  const [amt, ti] = BID_STEPS[unsold ? Math.min(step, 2) : step];
  const team = ti >= 0 ? TEAMS[ti] : null;
  const m = (v: object) => (still ? {} : v);

  return (
    <div className="flex h-full w-full flex-col gap-[1.6cqw]">
      <div className="flex shrink-0 items-center justify-between text-[2.25cqw] uppercase">
        <span className="font-semibold tracking-[0.24em] text-[#eab308]/80">Demo League · Live Auction</span>
        <span className="flex items-center gap-[0.8cqw] font-bold tracking-[0.2em] text-red-400">
          <span className={`h-[1.2cqw] w-[1.2cqw] rounded-full bg-red-500 ${still ? "" : "axi-live"}`} /> Live
        </span>
      </div>

      <div className="flex min-h-0 flex-1 items-stretch gap-[3.4cqw]">
        <motion.div
          {...m({ initial: { x: "-14cqw", opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.55, ease: EASE } })}
          className="relative flex w-[35%] flex-col overflow-hidden rounded-[1.4cqw] border border-[#eab308]/25 bg-white/[0.03]"
        >
          <div className="relative min-h-0 flex-1 bg-[radial-gradient(ellipse_at_bottom,rgba(234,179,8,0.10),transparent_65%)]">
            <Sil />
            <AnimatePresence>
              {done && unsold && <motion.div {...fade()} transition={{ duration: 0.4 }} className="absolute inset-0 bg-red-950/50" />}
            </AnimatePresence>
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ scale: 2.4, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 380, damping: 16 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span
                    className={`axi-d rounded-[0.8cqw] border-[0.6cqw] px-[1.8cqw] py-[0.4cqw] text-[5.6cqw] ${unsold ? "border-red-500 text-red-400" : "border-emerald-400 text-emerald-300"}`}
                    style={{ textShadow: `0 0 2cqw ${unsold ? "rgba(239,68,68,0.6)" : "rgba(52,211,153,0.6)"}` }}
                  >
                    {unsold ? "Unsold" : "Sold"}
                  </span>
                  {!unsold &&
                    BURST.map(([x, y], k) => (
                      <motion.span
                        key={k}
                        className="absolute h-[1cqw] w-[1cqw] rounded-full bg-[#eab308]"
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: `${x}cqw`, y: `${y}cqw`, opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="shrink-0 border-t border-white/10 bg-black/40 p-[1cqw] text-center">
            <div className="axi-d text-[3.3cqw] text-white">Daryl Renwick</div>
            <div className="mt-[0.4cqw] text-[2.25cqw] uppercase leading-tight tracking-[0.04em] text-white/50">Batter · Base ₹0.30 Cr</div>
          </div>
        </motion.div>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[1.6cqw]">
          <span className="text-[2.4cqw] uppercase tracking-[0.3em] text-white/45">Current bid</span>
          <motion.span
            key={amt}
            {...m(rise("2.2cqw", 0.26))}
            className="axi-d whitespace-nowrap text-[10cqw] text-[#eab308] tabular-nums"
            style={{ textShadow: "0 0 3cqw rgba(234,179,8,0.35)" }}
          >
            ₹ {amt} Cr
          </motion.span>
          <div className="flex h-[4.6cqw] items-center">
            {team && !done && (
              <motion.span
                key={team.s}
                {...m({ initial: { scale: 0.75, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: "spring", stiffness: 340, damping: 20 } })}
                className="rounded-[0.7cqw] px-[1.6cqw] py-[0.6cqw] text-[2.4cqw] font-bold text-white/95"
                style={{ backgroundColor: team.c }}
              >
                {team.name} leading
              </motion.span>
            )}
            {done && (
              <motion.span {...fade(0.35)} className={`text-[2.5cqw] font-semibold uppercase tracking-[0.2em] ${unsold ? "text-red-400" : "text-emerald-300"}`}>
                {unsold ? "Back in the pool" : team ? `Sold to ${team.name}` : "Sold"}
              </motion.span>
            )}
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-4 gap-[1.4cqw]">
        {TEAMS.map((t, k) => (
          <motion.div
            key={t.s}
            {...m(rise("1.5cqw", 0.4, 0.4 + k * 0.12))}
            className="flex items-center justify-between rounded-[0.8cqw] border border-white/10 bg-white/[0.04] px-[1.3cqw] py-[1cqw]"
          >
            <span className="axi-d flex items-center gap-[0.8cqw] text-[2.4cqw] text-white/85">
              <span className="h-[1.2cqw] w-[1.2cqw] rounded-full" style={{ backgroundColor: t.c }} />
              {t.s}
            </span>
            <span className="text-[2.25cqw] font-semibold tabular-nums text-[#eab308]/90">₹{["45.5", "32.2", "58.7", "21.0"][k]} Cr</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* act 2: top 3 podium (plinth height tween -> scaleY) */
const PODIUM = [
  { rank: 2, name: "Ishan Vellutro", amt: "13.00", h: 52, delay: 0.15 },
  { rank: 1, name: "Ravel Donmarsh", amt: "14.50", h: 74, delay: 0.5 },
  { rank: 3, name: "Tarun Bexley", amt: "11.25", h: 42, delay: 0.85 },
];

function ActPodium() {
  return (
    <div className="flex h-full w-full flex-col">
      <Title>Top 3 players</Title>
      <div className="flex min-h-0 flex-1 items-end justify-center gap-[3cqw] pt-[1cqw]">
        {PODIUM.map((p) => {
          const first = p.rank === 1;
          return (
            <div key={p.rank} className="flex h-full w-[19cqw] flex-col items-center justify-end">
              <motion.div {...rise("2cqw", 0.4, p.delay + 0.35)} className="relative mb-[0.6cqw] h-[8cqw] w-[8cqw] shrink-0">
                <Sil />
              </motion.div>
              <div className="relative w-full" style={{ height: `${p.h * 0.68}%` }}>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: p.delay, type: "spring", stiffness: 160, damping: 20 }}
                  className={`absolute inset-0 origin-bottom rounded-t-[1cqw] border border-b-0 ${first ? "border-[#eab308]/50 bg-[#eab308]/15" : "border-white/15 bg-white/[0.05]"}`}
                />
                <motion.span {...fade(p.delay + 0.3)} className={`axi-d absolute inset-x-0 top-[1cqw] text-center text-[3.6cqw] ${first ? "text-[#eab308]" : "text-white/70"}`}>
                  {p.rank}
                </motion.span>
              </div>
              <motion.div {...fade(p.delay + 0.55)} className="mt-[0.8cqw] shrink-0 text-center">
                <div className="axi-d whitespace-nowrap text-[2.4cqw] text-white/90">{p.name}</div>
                <div className="text-[2.25cqw] font-semibold tabular-nums text-[#eab308]">₹{p.amt} Cr</div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* act 3: team finances (bar width tween -> scaleX from the left) */
const PURSES: [number, string][] = [[78, "45.50"], [55, "32.25"], [88, "58.75"], [40, "21.00"]];

function ActFinances() {
  return (
    <div className="flex h-full w-full flex-col">
      <Title sub="Purse left">Team finances</Title>
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-[2.6cqw] px-[2cqw]">
        {PURSES.map(([w, amt], k) => {
          const t = TEAMS[k];
          return (
            <div key={t.s} className="flex items-center gap-[1.8cqw]">
              <span className="h-[1.8cqw] w-[1.8cqw] shrink-0 rounded-full" style={{ backgroundColor: t.c }} />
              <span className="axi-d w-[6cqw] shrink-0 text-[2.8cqw] text-white/85">{t.s}</span>
              <div className="h-[2.6cqw] min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3 + k * 0.22, duration: 0.9, ease: EASE }}
                  className="h-full origin-left rounded-full"
                  style={{ width: `${w}%`, background: `linear-gradient(90deg, ${t.c}, ${GOLD})` }}
                />
              </div>
              <motion.span {...fade(1.1 + k * 0.22)} className="w-[13cqw] shrink-0 whitespace-nowrap text-right text-[2.6cqw] font-semibold tabular-nums text-[#eab308]">
                ₹{amt} Cr
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* act 4: special mentions, one in the spotlight at a time */
const MENTIONS = [
  ["Host", "Arjun Malhotra"],
  ["Guest", "Priya Nair"],
  ["Organiser", "Rohan Sethi"],
];

function ActMentions() {
  const [k, setK] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setK((p) => (p + 1) % MENTIONS.length), 1450);
    return () => clearInterval(t);
  }, []);
  const [role, name] = MENTIONS[k];

  return (
    <div className="flex h-full w-full flex-col">
      <Title>Special mentions</Title>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={name}
            initial={{ opacity: 0, y: "2.5cqw" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-2cqw" }}
            transition={{ duration: 0.32, ease: EASE }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-[1.4cqw] h-[11cqw] w-[11cqw] overflow-hidden rounded-full border border-[#eab308]/30 bg-[radial-gradient(ellipse_at_bottom,rgba(234,179,8,0.14),transparent_70%)]">
              <Sil o={0.85} />
            </div>
            <div className="text-[2.3cqw] uppercase tracking-[0.35em] text-[#eab308]">{role}</div>
            <div className="axi-d mt-[0.8cqw] whitespace-nowrap text-[5.6cqw] text-white">{name}</div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
              className="mt-[1.4cqw] h-[0.45cqw] w-[18cqw] rounded-full bg-gradient-to-r from-[#eab308]/10 via-[#eab308] to-[#eab308]/10"
            />
          </motion.div>
        </AnimatePresence>
        <div className="mt-[2.4cqw] flex items-center gap-[1cqw]">
          {MENTIONS.map((x, d) => (
            <span key={x[1]} className={`h-[1cqw] w-[1cqw] rounded-full ${d === k ? "bg-[#eab308]" : "bg-white/20"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* act 5: the closer */
function ActCloser() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[2cqw]">
      <motion.div {...rise("2.5cqw", 0.5)} className="axi-d text-center text-[7.2cqw] leading-[1.1]">
        <span className="block text-white">Twenty scenes.</span>
        <span className="block text-[#eab308]">One link.</span>
      </motion.div>
      <motion.span {...fade(1.1)} className="text-[2.3cqw] uppercase tracking-[0.5em] text-white/40">
        AuctionXI
      </motion.span>
    </div>
  );
}

const VIEWS: Record<Act, (p: { round: number }) => ReactNode> = { bidding: ActBidding, podium: ActPodium, finances: ActFinances, mentions: ActMentions, closer: ActCloser };

/* the engine: acts in sequence with cross-fades, looping forever */
function Story() {
  const [i, setI] = useState(0);
  const act = ACTS[i % ACTS.length];

  useEffect(() => {
    const t = setTimeout(() => setI((p) => p + 1), ACT_MS[act]);
    return () => clearTimeout(t);
  }, [i, act]);

  const View = VIEWS[act];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.01 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="absolute inset-0 p-[3cqw]"
      >
        <View round={Math.floor(i / ACTS.length)} />
      </motion.div>
    </AnimatePresence>
  );
}

export function AuctionXIIllustration({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0e1a] text-[#e5e2e1]" style={{ containerType: "inline-size" }}>
      <style>{CSS}</style>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(234,179,8,0.16),transparent_55%)]" />

      {/* the site's wordmark, top-left as in its header */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/work/auctionxi/logo.webp" alt="AuctionXI" width={174} height={64} draggable={false} className="absolute left-[3.4cqw] top-[1.7cqw] h-[6cqw] w-auto" />

      {/* projector frame */}
      <div className="absolute bottom-[3cqw] left-[3cqw] right-[3cqw] top-[9.6cqw] overflow-hidden rounded-[1.8cqw] border border-[#eab308]/20 bg-[#0a0e1a] shadow-[0_3cqw_9cqw_rgba(0,0,0,0.6)]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_20%,rgba(234,179,8,0.08),transparent_70%)]" />
        {active ? (
          <Story />
        ) : (
          <div className="absolute inset-0 p-[3cqw]">
            <ActBidding round={0} still />
          </div>
        )}
      </div>

      <IllustrationTag />
    </div>
  );
}
