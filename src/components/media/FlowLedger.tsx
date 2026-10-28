"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/hooks";
import s from "./FlowLedger.module.css";

const BLUE = "#5B7CFA";
const GREEN = "#3CCF91";
const RED = "#F97066";
const TEXT = "#E6E8EB";
const MUTED = "#9BA1A6";
const LINE = "#2D333B";
const CARD = "#1C2128";

// Step n starts at STEPS[n] ms; the whole loop restarts every 12.4s.
// 0 dashboard · 1 tap scan · 2 sheet up, scanning · 3 OCR highlights · 4 scanned
// 5 tap "Use This Data" · 6 sheet down, entry lands · 7 insights · 8 screen fades · 9 back to start
const STEPS = [0, 1600, 2000, 3900, 4700, 5700, 6100, 8400, 11000, 11400];
const LOOP = 12400;

const PATH = {
  cam: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  food: "M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3m0 0v7",
  train: "M4 11V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm0 0h16M8 22l2-4m6 4-2-4",
  up: "M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
  check: "M20 6 9 17l-5-5",
};

const CAPTIONS: [string, string, string][] = [
  ["01", "Dashboard", "Income, spend and health at a glance."],
  ["02", "Receipt scan", "On-device OCR reads the receipt."],
  ["03", "Auto-fill", "The total lands in the ledger by itself."],
  ["04", "Money leaks", "Insights flag spending that creeps up."],
];

// [label, amount, highlight order]
const RECEIPT: [string, string, number?][] = [
  ["BEAN CAFE", "", 0],
  ["Cappuccino", "240"],
  ["Croissant", "246"],
  ["TOTAL", "486", 1],
];

const tr = (ms = 500, delay = 0): CSSProperties => ({
  transition: `transform ${ms}ms cubic-bezier(.2,.8,.2,1) ${delay}ms, opacity ${ms}ms ease ${delay}ms`,
});

function Icon({ d, c, size = "60%" }: { d: string; c: string; size?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={c}
      strokeWidth={2.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

// Rolls one figure out and the next in, like an odometer.
function Flip({ from, to, on }: { from: string; to: string; on: boolean }) {
  const face = (shown: boolean, dir: number): CSSProperties => ({
    ...tr(450, 300),
    opacity: shown ? 1 : 0,
    transform: `translateY(${shown ? 0 : 70 * dir}%)`,
  });
  return (
    <span className={s.flip}>
      <span className={s.face} style={face(!on, -1)}>
        {from}
      </span>
      <span className={s.face} style={face(on, 1)}>
        {to}
      </span>
    </span>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={s.stat}>
      <span className={s.statLabel}>{label}</span>
      <span className={s.statValue}>{children}</span>
    </div>
  );
}

function Txn({
  name,
  when,
  amount,
  d,
  c,
  style,
}: {
  name: string;
  when: string;
  amount: string;
  d: string;
  c: string;
  style?: CSSProperties;
}) {
  return (
    <div className={s.txn} style={style}>
      <div className={s.txnIcon} style={{ background: `${c}22` }}>
        <Icon d={d} c={c} />
      </div>
      <div className={s.txnText}>
        <div className={s.txnName} style={{ color: TEXT }}>
          {name}
        </div>
        <div className={s.txnWhen}>{when}</div>
      </div>
      <span className={s.txnAmount} style={{ color: TEXT }}>
        -{amount}
      </span>
    </div>
  );
}

export function FlowLedgerMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const run = active && !reduced;
  const [step, setStep] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- rewind to the dashboard
    setStep(0);
    if (!run) return;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const cycle = () => {
      timers = STEPS.map((at, i) => setTimeout(() => setStep(i), at));
      timers.push(setTimeout(cycle, LOOP));
    };
    cycle();
    return () => timers.forEach(clearTimeout);
  }, [run]);

  const sheet = step >= 2 && step <= 5;
  const added = step >= 6 && step < 9;
  const insights = step >= 7 && step < 9;
  const caption = step >= 9 ? 0 : step >= 7 ? 3 : step >= 6 ? 2 : step >= 2 ? 1 : 0;
  const highlight = step >= 3 && step <= 5;
  const scanning = step === 2;
  const tap = (on: boolean): CSSProperties => ({
    ...tr(260),
    opacity: on ? 1 : 0,
    transform: `scale(${on ? 1 : 1.6})`,
  });

  return (
    <div className={s.root}>
      <div className={s.glow} style={{ background: `radial-gradient(45% 70% at 24% 50%, ${BLUE}24, transparent 70%)` }} />

      <div className={s.phone}>
        <div className={s.screen} style={{ ...tr(400), opacity: step < 8 ? 1 : 0 }}>
          {/* Dashboard */}
          <div
            className={s.page}
            style={{ ...tr(700), transform: `translateX(${insights ? -30 : 0}%)`, opacity: insights ? 0 : 1 }}
          >
            <div className={s.title} style={{ color: TEXT }}>
              Good Evening
            </div>
            <div className={s.summary} style={{ background: `linear-gradient(135deg, ${BLUE}, #8B5CF6)` }}>
              <div className={s.summaryTitle}>Quick Summary</div>
              <div className={s.statRow}>
                <Stat label="Income">₹85,000</Stat>
                <Stat label="Expenses">
                  <Flip from="₹42,380" to="₹42,866" on={added} />
                </Stat>
              </div>
              <div className={s.rule} />
              <div className={s.statRowFlat}>
                <Stat label="Balance">
                  <Flip from="₹42,620" to="₹42,134" on={added} />
                </Stat>
                <Stat label="Health">
                  78<span className={s.outOf}>/100</span>
                </Stat>
              </div>
            </div>

            <div className={s.scanBtn} style={{ borderColor: `${BLUE}55`, background: `${BLUE}1f`, color: TEXT }}>
              <span className={s.scanIcon}>
                <Icon d={PATH.cam} c={BLUE} size="100%" />
              </span>
              Scan Receipt
              <span className={s.tap} style={tap(step === 1)} />
            </div>

            <div className={s.recentHead}>
              <span className={s.recentTitle} style={{ color: TEXT }}>
                Recent
              </span>
              <span style={{ color: BLUE }}>See All</span>
            </div>
            <div className={s.recent}>
              <div style={{ ...tr(700, 200), transform: `translateY(${added ? 0 : -6.2}cqw)` }}>
                <Txn
                  name="Bean Cafe"
                  when="Just now"
                  amount="₹486"
                  d={PATH.food}
                  c="#F97316"
                  style={{ ...tr(600, 400), opacity: added ? 1 : 0, background: `${BLUE}1f`, marginBottom: "0.6cqw" }}
                />
                <Txn name="Metro" when="Today" amount="₹500" d={PATH.train} c="#3B82F6" style={{ background: CARD }} />
              </div>
            </div>
          </div>

          {/* Insights */}
          <div
            className={s.page}
            style={{ ...tr(700), transform: `translateX(${insights ? 0 : 40}%)`, opacity: insights ? 1 : 0 }}
          >
            <div className={s.title} style={{ color: TEXT }}>
              Insights
            </div>
            <div className={s.small} style={{ color: MUTED }}>
              September 2026
            </div>
            <div className={s.insight} style={{ background: CARD, borderColor: `${RED}55` }}>
              <div className={s.insightIcon} style={{ background: `${RED}22` }}>
                <Icon d={PATH.up} c={RED} />
              </div>
              <div className={s.insightTitle} style={{ color: TEXT }}>
                Food &amp; Dining Up 42%
              </div>
              <div className={s.insightBody} style={{ color: MUTED }}>
                Spending increased significantly vs last month.
              </div>
            </div>
          </div>

          <div className={s.dim} style={{ ...tr(400), opacity: sheet ? 1 : 0 }} />

          {/* Scan sheet */}
          <div className={s.sheet} style={{ ...tr(550), transform: `translateY(${sheet ? 0 : 105}%)` }}>
            <div className={s.handle} style={{ background: LINE }} />
            <div className={s.sheetTitle} style={{ color: TEXT }}>
              Scan Receipt
            </div>
            <div className={s.viewfinder} style={{ borderColor: LINE }}>
              <div className={s.receipt}>
                {RECEIPT.map(([label, amount, order], i) => (
                  <div
                    key={label}
                    className={`${s.line} ${i % 3 ? "" : s.bold} ${i === 3 ? s.totalLine : ""}`}
                  >
                    <span>{label}</span>
                    <span>{amount}</span>
                    {order !== undefined && (
                      <span
                        className={s.ocr}
                        style={{
                          borderColor: BLUE,
                          background: `${BLUE}22`,
                          ...tr(350, 180 * order),
                          opacity: highlight ? 1 : 0,
                          transform: `scale(${highlight ? 1 : 1.08})`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div
                className={s.beam}
                style={{
                  background: `linear-gradient(to bottom, transparent 75%, ${BLUE}33 97%, ${BLUE} 100%)`,
                  transition: `transform ${scanning ? 1800 : 0}ms linear, opacity 300ms`,
                  opacity: scanning ? 1 : 0,
                  transform: `translateY(${scanning ? 0 : -100}%)`,
                }}
              />
            </div>
            <div className={s.status}>
              <div className={s.statusLine} style={{ ...tr(300), opacity: step < 4 ? 1 : 0, color: MUTED }}>
                Scanning...
              </div>
              <div
                className={`${s.statusLine} ${s.statusDone}`}
                style={{ ...tr(300, 100), opacity: step >= 4 ? 1 : 0, color: GREEN }}
              >
                <span className={s.checkIcon}>
                  <Icon d={PATH.check} c={GREEN} size="100%" />
                </span>
                Scanned · ₹486
              </div>
            </div>
            <div className={s.useBtn} style={{ background: BLUE, ...tr(300), opacity: step >= 4 ? 1 : 0.35 }}>
              Use This Data
              <span className={s.tap} style={tap(step === 5)} />
            </div>
          </div>
        </div>
        <div className={s.notch} />
      </div>

      <div className={s.side}>
        <div className={s.brand}>
          <svg viewBox="0 0 40 30" className={s.logo} fill="#ebe7dc">
            <rect x="14" y="0" width="26" height="7" rx="3.5" />
            <rect x="7" y="11" width="26" height="7" rx="3.5" />
            <rect x="0" y="22" width="26" height="7" rx="3.5" />
          </svg>
          <span className={s.brandName}>FlowLedger</span>
        </div>
        <div className={s.captions}>
          {CAPTIONS.map(([n, name, line], i) => (
            <div
              key={n}
              className={s.caption}
              style={{
                ...tr(500, i === caption ? 150 : 0),
                opacity: i === caption ? 1 : 0,
                transform: `translateY(${i === caption ? 0 : i < caption ? -1.2 : 1.2}cqw)`,
              }}
            >
              <div className={s.captionKicker}>
                {n} · {name}
              </div>
              <div className={s.captionLine}>{line}</div>
            </div>
          ))}
        </div>
        <div className={s.progress}>
          {CAPTIONS.map(([n], i) => (
            <span key={n} className={s.bar} style={{ ...tr(400), opacity: i === caption ? 0.8 : 0.18 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
