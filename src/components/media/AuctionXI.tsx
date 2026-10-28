"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/hooks";
import s from "./AuctionXI.module.css";

// Faithful port of the original AuctionXIIllustration: a five-scene loop of the
// auction-night broadcast (bidding -> podium -> finances -> mentions -> closer).

const SCENES = ["bidding", "podium", "finances", "mentions", "closer"] as const;
type Scene = (typeof SCENES)[number];

const DURATION: Record<Scene, number> = {
  bidding: 7200,
  podium: 5000,
  finances: 5000,
  mentions: 4500,
  closer: 3500,
};

const EASE = [0.22, 1, 0.36, 1] as const;
const GOLD = "#eab308";

const TEAMS = [
  { s: "SHK", name: "Stormhawks", c: "#5B2C8A" },
  { s: "TBK", name: "Tidebreakers", c: "#0A4E8B" },
  { s: "FKG", name: "Firekings", c: "#C7401C" },
  { s: "SKR", name: "Skyriders", c: "#1C6FB0" },
] as const;

// [amount, leading team index (-1 = opening base price)]
const BIDS: [string, number][] = [
  ["0.30", -1],
  ["0.55", 0],
  ["0.95", 1],
  ["1.40", 2],
  ["1.85", 1],
  ["2.30", 3],
  ["2.75", 2],
];

const PURSES = ["45.5", "32.2", "58.7", "21.0"];

const CONFETTI: [number, number][] = [
  [-9, -7],
  [9, -8],
  [-12, 2],
  [12, 3],
  [-5, 9],
  [6, 8],
];

const PODIUM = [
  { rank: 2, name: "Ishan Vellutro", amt: "13.00", h: 52, delay: 0.15 },
  { rank: 1, name: "Ravel Donmarsh", amt: "14.50", h: 74, delay: 0.5 },
  { rank: 3, name: "Tarun Bexley", amt: "11.25", h: 42, delay: 0.85 },
];

// [bar width %, purse left]
const FINANCES: [number, string][] = [
  [78, "45.50"],
  [55, "32.25"],
  [88, "58.75"],
  [40, "21.00"],
];

const MENTIONS: [string, string][] = [
  ["Host", "Arjun Malhotra"],
  ["Guest", "Priya Nair"],
  ["Organiser", "Rohan Sethi"],
];

const fade = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay },
});

const rise = (y: string, duration: number, delay = 0) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration, ease: EASE },
});

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

function Silhouette({ o = 0.8 }: { o?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/work/auctionxi/silhouette.webp"
      alt=""
      draggable={false}
      className={s.silhouette}
      style={{ opacity: o }}
    />
  );
}

function Heading({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className={s.heading}>
      <div className={cx(s.d, s.headingTitle)}>{children}</div>
      {sub && <div className={s.headingSub}>{sub}</div>}
    </div>
  );
}

function Bidding({ round, still = false }: { round: number; still?: boolean }) {
  const [step, setStep] = useState(still ? 4 : 0);
  const [done, setDone] = useState(false);
  // Every second time round the hammer falls early and the lot goes unsold.
  const unsold = round % 2 === 1;

  useEffect(() => {
    if (still) return;
    const timers = BIDS.slice(1).map((_, i) => setTimeout(() => setStep(i + 1), 500 + (i + 1) * 640));
    timers.push(setTimeout(() => setDone(true), 5300));
    return () => timers.forEach(clearTimeout);
  }, [still]);

  const [amount, teamIdx] = BIDS[unsold ? Math.min(step, 2) : step];
  const leader = teamIdx >= 0 ? TEAMS[teamIdx] : null;
  const anim = <T extends object>(props: T) => (still ? {} : props);

  return (
    <div className={s.bidding}>
      <div className={s.bidTop}>
        <span className={s.league}>Demo League · Live Auction</span>
        <span className={s.live}>
          <span className={cx(s.liveDot, !still && s.blink)} /> Live
        </span>
      </div>

      <div className={s.bidMain}>
        <motion.div
          {...anim({
            initial: { x: "-14cqw", opacity: 0 },
            animate: { x: 0, opacity: 1 },
            transition: { duration: 0.55, ease: EASE },
          })}
          className={s.playerCard}
        >
          <div className={s.playerArt}>
            <Silhouette />
            <AnimatePresence>
              {done && unsold && (
                <motion.div {...fade()} transition={{ duration: 0.4 }} className={s.unsoldVeil} />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ scale: 2.4, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 380, damping: 16 }}
                  className={s.stampWrap}
                >
                  <span
                    className={cx(s.d, s.stamp, unsold ? s.stampUnsold : s.stampSold)}
                    style={{
                      textShadow: `0 0 2cqw ${unsold ? "rgba(239,68,68,0.6)" : "rgba(52,211,153,0.6)"}`,
                    }}
                  >
                    {unsold ? "Unsold" : "Sold"}
                  </span>
                  {!unsold &&
                    CONFETTI.map(([x, y], i) => (
                      <motion.span
                        key={i}
                        className={s.confetti}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: `${x}cqw`, y: `${y}cqw`, opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className={s.playerInfo}>
            <div className={cx(s.d, s.playerName)}>Daryl Renwick</div>
            <div className={s.playerRole}>Batter · Base ₹0.30 Cr</div>
          </div>
        </motion.div>

        <div className={s.bidCol}>
          <span className={s.bidLabel}>Current bid</span>
          <motion.span
            key={amount}
            {...anim(rise("2.2cqw", 0.26))}
            className={cx(s.d, s.bidAmount)}
            style={{ textShadow: "0 0 3cqw rgba(234,179,8,0.35)" }}
          >
            ₹ {amount} Cr
          </motion.span>
          <div className={s.bidStatus}>
            {leader && !done && (
              <motion.span
                key={leader.s}
                {...anim({
                  initial: { scale: 0.75, opacity: 0 },
                  animate: { scale: 1, opacity: 1 },
                  transition: { type: "spring", stiffness: 340, damping: 20 },
                })}
                className={s.leader}
                style={{ backgroundColor: leader.c }}
              >
                {leader.name} leading
              </motion.span>
            )}
            {done && (
              <motion.span {...fade(0.35)} className={cx(s.result, unsold ? s.resultUnsold : s.resultSold)}>
                {unsold ? "Back in the pool" : leader ? `Sold to ${leader.name}` : "Sold"}
              </motion.span>
            )}
          </div>
        </div>
      </div>

      <div className={s.teams}>
        {TEAMS.map((t, i) => (
          <motion.div key={t.s} {...anim(rise("1.5cqw", 0.4, 0.4 + 0.12 * i))} className={s.team}>
            <span className={cx(s.d, s.teamCode)}>
              <span className={s.teamDot} style={{ backgroundColor: t.c }} />
              {t.s}
            </span>
            <span className={s.teamPurse}>₹{PURSES[i]} Cr</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Podium() {
  return (
    <div className={s.scene}>
      <Heading>Top 3 players</Heading>
      <div className={s.podium}>
        {PODIUM.map((p) => {
          const first = p.rank === 1;
          return (
            <div key={p.rank} className={s.podiumCol}>
              <motion.div {...rise("2cqw", 0.4, p.delay + 0.35)} className={s.podiumAvatar}>
                <Silhouette />
              </motion.div>
              <div className={s.podiumStep} style={{ height: `${0.68 * p.h}%` }}>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: p.delay, type: "spring", stiffness: 160, damping: 20 }}
                  className={cx(s.podiumBlock, first && s.podiumBlockFirst)}
                />
                <motion.span
                  {...fade(p.delay + 0.3)}
                  className={cx(s.d, s.podiumRank, first && s.podiumRankFirst)}
                >
                  {p.rank}
                </motion.span>
              </div>
              <motion.div {...fade(p.delay + 0.55)} className={s.podiumMeta}>
                <div className={cx(s.d, s.podiumName)}>{p.name}</div>
                <div className={s.podiumAmt}>₹{p.amt} Cr</div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Finances() {
  return (
    <div className={s.scene}>
      <Heading sub="Purse left">Team finances</Heading>
      <div className={s.finances}>
        {FINANCES.map(([width, purse], i) => {
          const t = TEAMS[i];
          return (
            <div key={t.s} className={s.finRow}>
              <span className={s.finDot} style={{ backgroundColor: t.c }} />
              <span className={cx(s.d, s.finCode)}>{t.s}</span>
              <div className={s.finTrack}>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3 + 0.22 * i, duration: 0.9, ease: EASE }}
                  className={s.finFill}
                  style={{ width: `${width}%`, background: `linear-gradient(90deg, ${t.c}, ${GOLD})` }}
                />
              </div>
              <motion.span {...fade(1.1 + 0.22 * i)} className={s.finAmt}>
                ₹{purse} Cr
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Mentions() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % MENTIONS.length), 1450);
    return () => clearInterval(id);
  }, []);
  const [role, name] = MENTIONS[idx];

  return (
    <div className={s.scene}>
      <Heading>Special mentions</Heading>
      <div className={s.mentions}>
        <AnimatePresence mode="wait">
          <motion.div
            key={name}
            initial={{ opacity: 0, y: "2.5cqw" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-2cqw" }}
            transition={{ duration: 0.32, ease: EASE }}
            className={s.mention}
          >
            <div className={s.mentionAvatar}>
              <Silhouette o={0.85} />
            </div>
            <div className={s.mentionRole}>{role}</div>
            <div className={cx(s.d, s.mentionName)}>{name}</div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
              className={s.mentionRule}
            />
          </motion.div>
        </AnimatePresence>
        <div className={s.dots}>
          {MENTIONS.map((m, i) => (
            <span key={m[1]} className={cx(s.dot, i === idx && s.dotOn)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Closer() {
  return (
    <div className={s.closer}>
      <motion.div {...rise("2.5cqw", 0.5)} className={cx(s.d, s.closerTitle)}>
        <span className={s.closerA}>Twenty scenes.</span>
        <span className={s.closerB}>One link.</span>
      </motion.div>
      <motion.span {...fade(1.1)} className={s.closerBrand}>
        AuctionXI
      </motion.span>
    </div>
  );
}

const VIEWS: Record<Scene, (p: { round: number }) => ReactNode> = {
  bidding: Bidding,
  podium: Podium,
  finances: Finances,
  mentions: Mentions,
  closer: Closer,
};

function Loop() {
  const [n, setN] = useState(0);
  const scene = SCENES[n % SCENES.length];

  useEffect(() => {
    const id = setTimeout(() => setN((v) => v + 1), DURATION[scene]);
    return () => clearTimeout(id);
  }, [n, scene]);

  const View = VIEWS[scene];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={n}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.01 }}
        transition={{ duration: 0.4, ease: EASE }}
        className={s.sceneWrap}
      >
        <View round={Math.floor(n / SCENES.length)} />
      </motion.div>
    </AnimatePresence>
  );
}

export function AuctionXIMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();

  return (
    <div className={s.root}>
      <div aria-hidden className={s.glow} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/work/auctionxi/logo.webp"
        alt="AuctionXI"
        width={174}
        height={64}
        draggable={false}
        className={s.logo}
      />
      <div className={s.frame}>
        <div aria-hidden className={s.frameGlow} />
        {active && !reduced ? (
          <Loop />
        ) : (
          <div className={s.sceneWrap}>
            <Bidding round={0} still />
          </div>
        )}
      </div>
    </div>
  );
}
