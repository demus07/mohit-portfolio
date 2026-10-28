"use client";

import type { CSSProperties } from "react";
import { useTimeline } from "./useTimeline";
import s from "./AuctionXI.module.css";

// Money is kept in hundredths of a crore so the purses always add up exactly.
const TEAMS = [
  { s: "SHK", name: "Stormhawks", c: "#5B2C8A" },
  { s: "TBK", name: "Tidebreakers", c: "#0A4E8B" },
  { s: "FKG", name: "Firekings", c: "#C7401C" },
  { s: "SKR", name: "Skyriders", c: "#1C6FB0" },
] as const;

const START_PURSE = [4550, 3225, 5875, 2100];
const PURSE_CAP = 6000;

type Player = { name: string; role: string; base: number; bids: [amount: number, team: number][] };

const PLAYERS: Player[] = [
  {
    name: "Daryl Renwick",
    role: "Batter",
    base: 30,
    bids: [[55, 0], [95, 1], [140, 2], [185, 1], [230, 3], [275, 2]],
  },
  {
    name: "Ishan Vellutro",
    role: "Fast bowler",
    base: 50,
    bids: [[75, 3], [110, 0], [160, 3], [205, 0]],
  },
  {
    name: "Ravel Donmarsh",
    role: "All-rounder",
    base: 100,
    bids: [[125, 1], [175, 2], [240, 1], [310, 3], [360, 1]],
  },
  {
    name: "Tarun Bexley",
    role: "Wicketkeeper",
    base: 40,
    bids: [[60, 0], [90, 3], [115, 0], [135, 3]],
  },
];

type Phase = "in" | "bid" | "sold" | "out";
type Frame = { p: number; bid: number; phase: Phase; veil?: boolean; ms: number };

const FRAMES: Frame[] = [{ p: 0, bid: -1, phase: "in", veil: true, ms: 650 }];
PLAYERS.forEach((pl, p) => {
  const last = pl.bids.length - 1;
  FRAMES.push({ p, bid: -1, phase: "in", ms: 1400 });
  pl.bids.forEach((_, bid) => FRAMES.push({ p, bid, phase: "bid", ms: 760 }));
  FRAMES.push({ p, bid: last, phase: "sold", ms: 2700 });
  if (p < PLAYERS.length - 1) FRAMES.push({ p, bid: last, phase: "out", ms: 700 });
});
{
  const p = PLAYERS.length - 1;
  FRAMES.push({ p, bid: PLAYERS[p].bids.length - 1, phase: "sold", veil: true, ms: 750 });
}

const DURATIONS = FRAMES.map((f) => f.ms);
const STILL = FRAMES.findIndex((f) => f.phase === "sold");

const cr = (n: number) => (n / 100).toFixed(2);

function pursesAt(f: Frame) {
  const purse = [...START_PURSE];
  PLAYERS.forEach((pl, i) => {
    const done = i < f.p || (i === f.p && (f.phase === "sold" || f.phase === "out"));
    if (!done) return;
    const [amount, team] = pl.bids[pl.bids.length - 1];
    purse[team] -= amount;
  });
  return purse;
}

const teamVar = (c: string) => ({ "--team": c }) as CSSProperties;

export function AuctionXIMedia({ active }: { active: boolean }) {
  const { step } = useTimeline(DURATIONS, active, STILL);
  const f = FRAMES[step];
  const player = PLAYERS[f.p];
  const [amount, leaderIdx] = f.bid >= 0 ? player.bids[f.bid] : [player.base, -1];
  const leader = leaderIdx >= 0 ? TEAMS[leaderIdx] : null;
  const sold = f.phase === "sold" || f.phase === "out";
  const purses = pursesAt(f);

  return (
    <div
      className={s.root}
      role="img"
      aria-label="AuctionXI broadcast graphics: bids climb on a player until he is sold to a team, and that team's purse updates"
    >
      <div className={`${s.stage} ${f.veil ? s.veiled : ""}`} aria-hidden="true">
        <div className={s.glow} />

        <header className={s.top}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.logo} src="/work/auctionxi/logo.webp" alt="" draggable={false} />
          <span className={s.league}>Demo League · Live Auction</span>
          <span className={s.live}>
            <i />
            Live
          </span>
        </header>

        <div className={`${s.main} ${f.phase === "out" ? s.leaving : ""}`}>
          <div className={s.card}>
            <div className={s.portrait}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/work/auctionxi/silhouette.webp" alt="" draggable={false} />
            </div>
            <div className={s.nameBar}>
              <span className={s.name}>{player.name}</span>
              <span className={s.role}>
                {player.role} · Base ₹{cr(player.base)} Cr
              </span>
            </div>
          </div>

          <div className={s.bidPanel}>
            <span className={s.label}>{sold ? "Final bid" : "Current bid"}</span>
            <span className={`${s.amount} ${sold ? s.amountSold : ""}`}>
              <span key={`${f.p}-${amount}`} className={s.tick}>
                ₹{cr(amount)}
              </span>
              <small>Cr</small>
            </span>

            <div className={s.status}>
              <span
                className={`${s.leader} ${!sold ? s.show : ""}`}
                style={teamVar(leader ? leader.c : "#2a3550")}
              >
                {leader ? `${leader.name} leading` : "Opening at base price"}
              </span>
              <span className={`${s.soldBox} ${sold ? s.show : ""}`}>
                <span className={s.stamp}>Sold</span>
                <span className={s.soldTo}>Sold to {leader?.name}</span>
              </span>
            </div>
          </div>
        </div>

        <div className={s.teams}>
          {TEAMS.map((t, i) => {
            const won = sold && leaderIdx === i;
            const bidding = f.phase === "bid" && leaderIdx === i;
            return (
              <div
                key={t.s}
                className={`${s.team} ${won ? s.won : ""} ${bidding ? s.bidding : ""}`}
                style={teamVar(t.c)}
              >
                <span className={s.badge}>{t.s}</span>
                <span className={s.teamText}>
                  <span className={s.teamName}>{t.name}</span>
                  <span className={s.purse}>
                    <span key={purses[i]} className={s.tick}>
                      ₹{cr(purses[i])} Cr
                    </span>
                    <em>left</em>
                  </span>
                </span>
                <span className={s.bar}>
                  <i style={{ transform: `scaleX(${purses[i] / PURSE_CAP})` }} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
