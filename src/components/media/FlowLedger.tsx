"use client";

import { useTimeline } from "./useTimeline";
import s from "./FlowLedger.module.css";

// Frame indexes of the loop.
const RESET = 0;
// 1: dashboard at rest
const PRESS = 2;
const SHEET = 3;
const SCAN = 4;
const FOUND = 5;
const FILL = 6;
const ADDED = 7;
const INSIGHT = 8;
const VEIL = 9;

const DURATIONS = [650, 2300, 450, 900, 1700, 1300, 450, 2300, 3200, 700];

const CAPTIONS = [
  { label: "Dashboard", line: "Income, spend and health at a glance." },
  { label: "Receipt scan", line: "On-device OCR reads the receipt." },
  { label: "Auto-fill", line: "The total lands in the ledger by itself." },
  { label: "Money leaks", line: "Insights flag spending that creeps up." },
];

const captionFor = (step: number) => (step <= PRESS ? 0 : step <= FOUND ? 1 : step <= ADDED ? 2 : 3);

const RECEIPT: [string, string][] = [
  ["Cappuccino", "240"],
  ["Croissant", "246"],
];

const ICON = {
  food: "M7 3v8a3 3 0 0 0 3 3v7M10 3v6M13 3v8a3 3 0 0 1-3 3M18 3c-1.5 1-2.5 3-2.5 6s1 4 2.5 4v8",
  train: "M7 3h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM5 10h14M8 21l2-4M16 21l-2-4",
  cart: "M3 4h2l2.4 11h10.2L20 7H6.2M9 20h.01M17 20h.01",
  up: "M4 17l6-6 4 4 7-8M15 7h6v6",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4Z",
  chart: "M5 20V10M12 20V4M19 20v-7",
  goal: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  cam: "M4 8h3l2-3h6l2 3h3v11H4ZM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  check: "M5 12.5 10 17l9-10",
};

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

function Tx({
  name,
  when,
  amount,
  icon,
  color,
  className,
  pos,
}: {
  name: string;
  when: string;
  amount: string;
  icon: string;
  color: string;
  className?: string;
  pos: number;
}) {
  return (
    <div className={`${s.tx} ${className ?? ""}`} style={{ transform: `translateY(${pos * 100}%)` }}>
      <div className={s.txInner}>
        <span className={s.txIcon} style={{ color, background: `${color}22` }}>
          <Icon d={icon} />
        </span>
        <span className={s.txText}>
          <b>{name}</b>
          <span>{when}</span>
        </span>
        <b className={s.txAmt}>−{amount}</b>
      </div>
    </div>
  );
}

export function FlowLedgerMedia({ active }: { active: boolean }) {
  const { step } = useTimeline(DURATIONS, active, INSIGHT);

  const veil = step === RESET || step === VEIL;
  const sheet = step >= SHEET && step <= FILL;
  const scanning = step === SCAN;
  const found = step === FOUND || step === FILL;
  const added = step >= ADDED;
  const insight = step >= INSIGHT;
  const caption = captionFor(step);

  return (
    <div
      className={s.root}
      role="img"
      aria-label="FlowLedger, a personal finance app: a café receipt is scanned, its total fills into the ledger, and an insight flags rising food spending"
    >
      <div className={`${s.stage} ${veil ? s.veiled : ""}`} aria-hidden="true">
        <div className={s.captions}>
          {CAPTIONS.map((c, i) => (
            <div key={c.label} className={`${s.caption} ${i === caption ? s.captionOn : ""}`}>
              <span className={s.capLabel}>{c.label}</span>
              <span className={s.capLine}>{c.line}</span>
            </div>
          ))}
        </div>

        <div className={s.steps}>
          {CAPTIONS.map((c, i) => (
            <span key={c.label} className={`${s.stepDot} ${i === caption ? s.stepOn : ""}`}>
              <i />
              {c.label}
            </span>
          ))}
        </div>

        <div className={s.phone}>
          <div className={s.screen}>
            <div className={s.status}>
              <span>9:41</span>
              <span className={s.island} />
              <span className={s.bars}>
                <i />
                <i />
                <i />
              </span>
            </div>

            <div className={s.dash}>
              <div className={s.greet}>
                <div>
                  <div className={s.hello}>Good Evening</div>
                  <div className={s.sub}>Here’s your month so far</div>
                </div>
                <span className={s.avatar}>M</span>
              </div>

              <div className={s.summary}>
                <div className={s.sumRow}>
                  <div className={s.sumCell}>
                    <span>Income</span>
                    <b>₹85,000</b>
                  </div>
                  <div className={s.sumCell}>
                    <span>Expenses</span>
                    <b key={added ? "a" : "b"} className={s.rise}>
                      {added ? "₹42,866" : "₹42,380"}
                    </b>
                  </div>
                </div>
                <div className={s.sumRule} />
                <div className={s.sumRow}>
                  <div className={s.sumCell}>
                    <span>Balance</span>
                    <b key={added ? "a" : "b"} className={s.rise}>
                      {added ? "₹42,134" : "₹42,620"}
                    </b>
                  </div>
                  <div className={s.sumCell}>
                    <span>Health</span>
                    <b>
                      78<small>/100</small>
                    </b>
                  </div>
                </div>
              </div>

              <div className={s.recentHead}>
                <b>Recent</b>
                <span>See All</span>
              </div>
              <div className={s.list}>
                <Tx
                  name="Bean Cafe"
                  when="Just now"
                  amount="₹486"
                  icon={ICON.food}
                  color="#F97316"
                  className={added ? s.txNew : s.txWaiting}
                  pos={0}
                />
                <Tx name="Metro" when="Today" amount="₹500" icon={ICON.train} color="#3B82F6" pos={added ? 1 : 0} />
                <Tx
                  name="Big Basket"
                  when="Yesterday"
                  amount="₹1,240"
                  icon={ICON.cart}
                  color="#3CCF91"
                  pos={added ? 2 : 1}
                />
              </div>

              <div className={s.slot}>
                <div className={`${s.card} ${s.budget} ${insight ? "" : s.cardOn}`}>
                  <div className={s.cardTop}>
                    <span>Food &amp; Dining budget</span>
                    <b>₹6,120 / ₹8,000</b>
                  </div>
                  <div className={s.meter}>
                    <i />
                  </div>
                </div>
                <div className={`${s.card} ${s.insight} ${insight ? s.cardOn : ""}`}>
                  <span className={s.insIcon}>
                    <Icon d={ICON.up} />
                  </span>
                  <div>
                    <div className={s.insTitle}>Food &amp; Dining Up 42%</div>
                    <div className={s.insLine}>Spending increased significantly vs last month.</div>
                  </div>
                </div>
              </div>
            </div>

            <nav className={s.tabbar}>
              <Icon d={ICON.home} className={s.tabOn} />
              <Icon d={ICON.chart} />
              <span className={`${s.fab} ${step === PRESS ? s.fabPressed : ""}`}>
                <Icon d={ICON.cam} />
              </span>
              <Icon d={ICON.goal} />
              <Icon d={ICON.user} />
            </nav>

            <div className={`${s.dim} ${sheet ? s.dimOn : ""}`} />

            <div className={`${s.sheet} ${sheet ? s.sheetOn : ""}`}>
              <span className={s.grab} />
              <div className={s.sheetTitle}>Scan Receipt</div>
              <div className={s.sheetSub}>Reading on device</div>

              <div className={s.finder}>
                <span className={s.corners} />
                <div className={s.receipt}>
                  <div className={s.rcHead}>BEAN CAFE</div>
                  {RECEIPT.map(([item, amt]) => (
                    <div key={item} className={s.rcRow}>
                      <span>{item}</span>
                      <span>{amt}</span>
                    </div>
                  ))}
                  <div className={`${s.rcRow} ${s.rcTotal} ${found ? s.rcFound : ""}`}>
                    <span>TOTAL</span>
                    <span>486</span>
                  </div>
                </div>
                <span className={`${s.scanLine} ${scanning ? s.scanOn : ""}`} />
              </div>

              <div className={`${s.detected} ${found ? s.detectedOn : ""}`}>
                <span className={s.okIcon}>
                  <Icon d={ICON.check} />
                </span>
                Total ₹486 · Food &amp; Dining
              </div>

              <span className={`${s.fillBtn} ${found ? s.fillReady : ""} ${step === FILL ? s.fillPressed : ""}`}>
                Auto-fill
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
