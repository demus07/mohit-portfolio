"use client";

import { useEffect, useState, type ReactNode } from "react";
import { IllustrationTag } from "./tag";

/*
 * FlowLedger (Flutter) recreated from its source: palette from
 * lib/core/constants/app_colors.dart, home layout from home_screen.dart,
 * scan flow from receipt_scanner_sheet.dart, insight copy from
 * insights_screen.dart. Sizes are in cqw (the box keeps a 3:2 ratio), so the
 * whole phone always fits. One idea per step. Demo data is fictional.
 */
const P = "#5B7CFA", OK = "#3CCF91", ERR = "#F97066", TX = "#E6E8EB", MU = "#9BA1A6", LN = "#2D333B", CARD = "#1C2128";

// phase schedule (ms from loop start); index = phase
const AT = [0, 1600, 2000, 3900, 4700, 5700, 6100, 8400, 11000, 11400];
const LOOP = 12400;

const I = {
  cam: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  food: "M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3m0 0v7",
  train: "M4 11V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm0 0h16M8 22l2-4m6 4-2-4",
  up: "M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
  check: "M20 6 9 17l-5-5",
};

function Ic({ d, c, s = "60%" }: { d: string; c: string; s?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const tr = (ms = 500, delay = 0) => ({
  transition: `transform ${ms}ms cubic-bezier(.2,.8,.2,1) ${delay}ms, opacity ${ms}ms ease ${delay}ms`,
});

function Roll({ from, to, on }: { from: string; to: string; on: boolean }) {
  const s = (vis: boolean, dir: number) => ({ ...tr(450, 300), opacity: vis ? 1 : 0, transform: `translateY(${vis ? 0 : dir * 70}%)` });
  return (
    <span className="inline-grid overflow-hidden">
      <span className="[grid-area:1/1]" style={s(!on, -1)}>{from}</span>
      <span className="[grid-area:1/1]" style={s(on, 1)}>{to}</span>
    </span>
  );
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-[0.4cqw]">
      <span className="text-[1.95cqw] text-white/75">{label}</span>
      <span className="text-[2.35cqw] font-semibold leading-none text-white">{children}</span>
    </div>
  );
}

function Row({ n, t, a, d, c, style }: { n: string; t: string; a: string; d: string; c: string; style?: object }) {
  return (
    <div className="flex h-[5.6cqw] items-center gap-[1cqw] rounded-[1.6cqw] px-[1cqw]" style={style}>
      <div className="flex h-[3.2cqw] w-[3.2cqw] shrink-0 items-center justify-center rounded-[1cqw]" style={{ background: `${c}22` }}><Ic d={d} c={c} /></div>
      <div className="min-w-0 flex-1 leading-[1.2]">
        <div className="truncate text-[1.95cqw] font-medium" style={{ color: TX }}>{n}</div>
        <div className="text-[1.95cqw] text-[#6E7681]">{t}</div>
      </div>
      <span className="text-[1.95cqw] font-semibold" style={{ color: TX }}>-{a}</span>
    </div>
  );
}

const CAPS = [
  ["01", "Dashboard", "Income, spend and health at a glance."],
  ["02", "Receipt scan", "On-device OCR reads the receipt."],
  ["03", "Auto-fill", "The total lands in the ledger by itself."],
  ["04", "Money leaks", "Insights flag spending that creeps up."],
];

export function FlowLedgerIllustration({ active }: { active: boolean }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    setP(0);
    if (!active) return;
    let ids: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      ids = AT.map((t, i) => setTimeout(() => setP(i), t));
      ids.push(setTimeout(run, LOOP));
    };
    run();
    return () => ids.forEach(clearTimeout);
  }, [active]);

  const shown = p < 8;
  const sheet = p >= 2 && p <= 5;
  const done = p >= 6 && p < 9;
  const ins = p >= 7 && p < 9;
  const cap = p >= 9 ? 0 : p >= 7 ? 3 : p >= 6 ? 2 : p >= 2 ? 1 : 0;
  const tap = (on: boolean) => ({ ...tr(260), opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 1.6})` });
  const hl = p >= 3 && p <= 5;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0d10] font-sans [container-type:size]">
      <div className="absolute inset-0" style={{ background: `radial-gradient(45% 70% at 24% 50%, ${P}24, transparent 70%)` }} />
      <IllustrationTag />

      {/* phone: 58cqw tall in a 66.7cqw-tall box, so the whole device fits */}
      <div className="absolute left-[9cqw] top-[4.3cqw] h-[58cqw] w-[28.4cqw] rounded-[4.6cqw] border-[0.7cqw] border-[#262a31] bg-[#0F1115] shadow-[0_14px_40px_rgba(0,0,0,.55)]">
        <div className="absolute inset-0 overflow-hidden rounded-[3.9cqw]" style={{ ...tr(400), opacity: shown ? 1 : 0 }}>
          <div className="absolute inset-0 px-[1.5cqw] pt-[5cqw]" style={{ ...tr(700), transform: `translateX(${ins ? -30 : 0}%)`, opacity: ins ? 0 : 1 }}>
            <div className="text-[2.4cqw] font-semibold" style={{ color: TX }}>Good Evening</div>

            <div className="mt-[1.6cqw] rounded-[2.2cqw] px-[1cqw] py-[1.6cqw] text-center" style={{ background: `linear-gradient(135deg, ${P}, #8B5CF6)` }}>
              <div className="text-[1.95cqw] font-semibold text-white/90">Quick Summary</div>
              <div className="mt-[1.4cqw] flex">
                <Cell label="Income">₹85,000</Cell>
                <Cell label="Expenses"><Roll from="₹42,380" to="₹42,866" on={done} /></Cell>
              </div>
              <div className="mx-[1cqw] my-[1.4cqw] h-px bg-white/20" />
              <div className="flex">
                <Cell label="Balance"><Roll from="₹42,620" to="₹42,134" on={done} /></Cell>
                <Cell label="Health">78<span className="text-[1.95cqw] font-normal text-white/70">/100</span></Cell>
              </div>
            </div>

            <div className="relative mt-[1.8cqw] flex h-[4.6cqw] items-center justify-center gap-[0.8cqw] rounded-[1.6cqw] border text-[1.95cqw] font-medium" style={{ borderColor: `${P}55`, background: `${P}1f`, color: TX }}>
              <span className="flex h-[2.6cqw] w-[2.6cqw]"><Ic d={I.cam} c={P} s="100%" /></span>Scan Receipt
              <span className="absolute left-1/2 top-1/2 -ml-[2.6cqw] -mt-[2.6cqw] h-[5.2cqw] w-[5.2cqw] rounded-full border border-white/60 bg-white/25" style={tap(p === 1)} />
            </div>

            <div className="mb-[0.8cqw] mt-[2.6cqw] flex justify-between text-[1.95cqw]">
              <span className="font-semibold" style={{ color: TX }}>Recent</span>
              <span style={{ color: P }}>See All</span>
            </div>
            <div className="h-[5.6cqw] overflow-hidden">
              <div style={{ ...tr(700, 200), transform: `translateY(${done ? 0 : -6.2}cqw)` }}>
                <Row n="Bean Cafe" t="Just now" a="₹486" d={I.food} c="#F97316" style={{ ...tr(600, 400), opacity: done ? 1 : 0, background: `${P}1f`, marginBottom: "0.6cqw" }} />
                <Row n="Metro" t="Today" a="₹500" d={I.train} c="#3B82F6" style={{ background: CARD }} />
              </div>
            </div>
          </div>

          <div className="absolute inset-0 px-[1.5cqw] pt-[5cqw]" style={{ ...tr(700), transform: `translateX(${ins ? 0 : 40}%)`, opacity: ins ? 1 : 0 }}>
            <div className="text-[2.4cqw] font-semibold" style={{ color: TX }}>Insights</div>
            <div className="text-[1.95cqw]" style={{ color: MU }}>September 2026</div>
            <div className="mt-[2cqw] rounded-[2.2cqw] border p-[1.6cqw]" style={{ background: CARD, borderColor: `${ERR}55` }}>
              <div className="flex h-[3.8cqw] w-[3.8cqw] items-center justify-center rounded-[1.1cqw]" style={{ background: `${ERR}22` }}><Ic d={I.up} c={ERR} /></div>
              <div className="mt-[1.2cqw] text-[2.2cqw] font-semibold leading-[1.25]" style={{ color: TX }}>Food & Dining Up 42%</div>
              <div className="mt-[0.6cqw] text-[1.95cqw] leading-[1.35]" style={{ color: MU }}>Spending increased significantly vs last month.</div>
            </div>
          </div>

          <div className="absolute inset-0 bg-black/55" style={{ ...tr(400), opacity: sheet ? 1 : 0 }} />
          <div className="absolute inset-x-0 bottom-0 top-[9cqw] rounded-t-[3cqw] bg-[#161A22] px-[1.5cqw]" style={{ ...tr(550), transform: `translateY(${sheet ? 0 : 105}%)` }}>
            <div className="mx-auto mt-[1cqw] h-[0.6cqw] w-[5cqw] rounded-full" style={{ background: LN }} />
            <div className="mt-[1.4cqw] text-center text-[2.2cqw] font-semibold" style={{ color: TX }}>Scan Receipt</div>
            <div className="relative mt-[1.6cqw] flex h-[21cqw] items-center justify-center overflow-hidden rounded-[1.8cqw] border bg-[#0b0d10]" style={{ borderColor: LN }}>
              <div className="w-[19.5cqw] -rotate-2 rounded-[0.5cqw] bg-[#f3f0e8] px-[1.4cqw] py-[1.3cqw] font-mono text-[1.95cqw] leading-[1.5] text-[#2a2a2a]">
                {([["BEAN CAFE", "", 0], ["Cappuccino", "240"], ["Croissant", "246"], ["TOTAL", "486", 1]] as const).map(([k, v, h], i) => (
                  <div key={k} className={`relative flex justify-between ${i % 3 ? "" : "font-bold"} ${i === 3 ? "mt-[0.5cqw] border-t border-dashed border-black/30" : ""}`}>
                    <span>{k}</span><span>{v}</span>
                    {h !== undefined && <span className="absolute -inset-x-[0.6cqw] inset-y-0 rounded-[0.5cqw] border-[0.25cqw]" style={{ borderColor: P, background: `${P}22`, ...tr(350, h * 180), opacity: hl ? 1 : 0, transform: `scale(${hl ? 1 : 1.08})` }} />}
                  </div>
                ))}
              </div>
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 75%, ${P}33 97%, ${P} 100%)`, transition: `transform ${p === 2 ? 1800 : 0}ms linear, opacity 300ms`, opacity: p === 2 ? 1 : 0, transform: `translateY(${p === 2 ? 0 : -100}%)` }} />
            </div>
            <div className="relative mt-[1.6cqw] h-[3cqw] text-center text-[1.95cqw]">
              <div className="absolute inset-x-0" style={{ ...tr(300), opacity: p < 4 ? 1 : 0, color: MU }}>Scanning...</div>
              <div className="absolute inset-x-0 flex items-center justify-center gap-[0.6cqw]" style={{ ...tr(300, 100), opacity: p >= 4 ? 1 : 0, color: OK }}>
                <span className="flex h-[2.2cqw] w-[2.2cqw]"><Ic d={I.check} c={OK} s="100%" /></span>Scanned · ₹486
              </div>
            </div>
            <div className="relative mt-[1cqw] flex h-[4.6cqw] items-center justify-center rounded-[1.6cqw] text-[1.95cqw] font-semibold text-white" style={{ background: P, ...tr(300), opacity: p >= 4 ? 1 : 0.35 }}>
              Use This Data
              <span className="absolute left-1/2 top-1/2 -ml-[2.6cqw] -mt-[2.6cqw] h-[5.2cqw] w-[5.2cqw] rounded-full border border-white/60 bg-white/25" style={tap(p === 5)} />
            </div>
          </div>
        </div>
        <div className="absolute left-1/2 top-[1.1cqw] h-[1.9cqw] w-[7cqw] -translate-x-1/2 rounded-full bg-black" />
      </div>

      {/* right: brand + step caption */}
      <div className="absolute left-[46cqw] right-[7cqw] top-[20cqw]">
        <div className="flex items-center gap-[1.2cqw]">
          <svg viewBox="0 0 40 30" className="w-[3.2cqw]" fill="#ebe7dc">
            <rect x="14" y="0" width="26" height="7" rx="3.5" />
            <rect x="7" y="11" width="26" height="7" rx="3.5" />
            <rect x="0" y="22" width="26" height="7" rx="3.5" />
          </svg>
          <span className="text-[2.6cqw] font-semibold tracking-tight text-[#ebe7dc]/90">FlowLedger</span>
        </div>
        <div className="relative mt-[5cqw] h-[14cqw]">
          {CAPS.map(([n, h, t], i) => (
            <div key={n} className="absolute inset-x-0 top-0" style={{ ...tr(500, i === cap ? 150 : 0), opacity: i === cap ? 1 : 0, transform: `translateY(${i === cap ? 0 : i < cap ? -1.2 : 1.2}cqw)` }}>
              <div className="font-mono text-[1.95cqw] uppercase tracking-[0.14em] text-[#2fbf8a]">{n} · {h}</div>
              <div className="mt-[1cqw] text-[2.5cqw] leading-[1.4] text-[#ebe7dc]/70">{t}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-[1cqw]">
          {CAPS.map(([n], i) => (
            <span key={n} className="h-[0.5cqw] w-[4cqw] origin-left rounded-full bg-[#ebe7dc]" style={{ ...tr(400), opacity: i === cap ? 0.8 : 0.18 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
