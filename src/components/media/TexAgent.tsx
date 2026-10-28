"use client";

import { Fragment, useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";
import s from "./TexAgent.module.css";

// ---------- logo: a woven T, warp threads drop in, then the weft slides across ----------

const LOGO: [number, number, number, number][] = [
  [172, 100, 40, 40],
  [172, 180, 40, 240],
  [236, 100, 40, 104],
  [236, 244, 40, 176],
  [300, 100, 40, 40],
  [300, 180, 40, 240],
  [96, 140, 140, 40],
  [276, 140, 140, 40],
  [96, 204, 76, 40],
  [212, 204, 88, 40],
  [340, 204, 76, 40],
];

function Logo({ className, draw }: { className: string; draw?: boolean }) {
  return (
    <svg viewBox="96 100 320 320" className={`${s.logo} ${className}`} aria-hidden="true">
      {LOGO.map(([x, y, w, h], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          fill="#8f2b1e"
          className={draw ? (i < 6 ? s.drawWarp : s.drawWeft) : undefined}
        />
      ))}
    </svg>
  );
}

// ---------- the script: how long each step stays on screen (ms) ----------
// 0 splash · 1-8 type Takka "12" then Rate "86.35" · 9 press save · 10 saving · 11 saved
// 12 hover Parties · 13 loading · 14 party ledger · 15 hover Follow-ups · 16 loading · 17 follow-ups

const STEPS = [2000, 700, 170, 380, 170, 170, 170, 170, 900, 350, 600, 1300, 350, 450, 2200, 350, 450, 2400];
const START = 9;
const STILL = 8;

// Paisa to rupees with Indian digit grouping.
const inr = (paisa: number, symbol = true) => {
  const [r, p] = (paisa / 100).toFixed(2).split(".");
  const g = r.length > 3 ? `${r.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${r.slice(-3)}` : r;
  return `${symbol ? "₹" : ""}${g}.${p}`;
};

const BASIC = 12434400;
const GST = 621720;
const TOTAL = 13056120;
const BROKERAGE = 186516;

type Status = "Pending" | "Partial" | "Paid";

function Pill({ status }: { status: Status }) {
  return <span className={`${s.pill} ${s[status]}`}>{status}</span>;
}

function Field({ label, value, num, caret }: { label: string; value: string; num?: boolean; caret?: boolean }) {
  return (
    <div className={s.field}>
      <div className={`${s.label} ${s.truncate}`}>{label}</div>
      <div className={`${s.input} ${num ? s.inputNum : ""} ${caret ? s.inputFocus : ""}`}>
        <span className={s.truncate}>{value}</span>
        {caret && <span className={s.caret} />}
      </div>
    </div>
  );
}

function Sum({ k, v, tag, big }: { k: string; v: string; tag?: string; big?: boolean }) {
  return (
    <div className={`${s.sum} ${big ? s.sumBig : ""}`}>
      <span>
        {k}
        {tag && <span className={s.tag}>{tag}</span>}
      </span>
      <b>{v}</b>
    </div>
  );
}

function Heads({ h, right }: { h: string[]; right: number }) {
  return h.map((t, i) => (
    <span key={t} className={i === right ? s.right : ""}>
      {t}
    </span>
  ));
}

function Heading({ t, sub }: { t: string; sub: string }) {
  return (
    <div className={s.heading}>
      <h3 className={s.title}>{t}</h3>
      <span className={s.muted}>{sub}</span>
    </div>
  );
}

const NAV = ["BOOK", "Dashboard", "Bills", "Parties", "Payments", "MONEY", "Follow-ups", "Brokerage", "Reports"];
const VIEWS = ["Bills", "Parties", "Follow-ups"];

const BILLS: [string, string, number, Status, Status][] = [
  ["01/09/2026", "1043", TOTAL, "Pending", "Pending"],
  ["30/06/2026", "1011", 4120875, "Pending", "Pending"],
  ["20/05/2026", "0987", 8473560, "Partial", "Pending"],
  ["02/05/2026", "0952", 6240000, "Paid", "Paid"],
];

const OVERDUE: [string, string, string, number][] = [
  ["0987", "19/06/2026", "74d", 4473560],
  ["1011", "30/07/2026", "33d", 4120875],
];

const CHIPS = ["All overdue · 3", "0-30 · 1", "31-60 · 1", "61-90 · 1", "90+ · 0"];

function Skeleton() {
  return (
    <div className={s.skeleton} aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className={s.bone} />
      ))}
      <div className={s.shimmer} />
    </div>
  );
}

export function TexAgentMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const live = active && !reduced;
  const [state, setState] = useState({ step: START, round: 0 });

  useEffect(() => {
    if (!live) return;
    let step = START;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      timer = setTimeout(() => {
        step = (step + 1) % STEPS.length;
        setState((p) => ({ step, round: step ? p.round : p.round + 1 }));
        next();
      }, STEPS[step]);
    };
    next();
    return () => {
      clearTimeout(timer);
      setState((p) => ({ ...p, step: START }));
    };
  }, [live]);

  // Off screen (or with reduced motion) hold on the filled-in bill, just before it is saved.
  const a = live ? state.step : STILL;
  const round = state.round;

  const view = a >= 1 && a <= 12 ? 0 : a >= 13 && a <= 15 ? 1 : 2;
  const hover = a === 12 ? "Parties" : a === 15 ? "Follow-ups" : "";
  const loading = live && (a === 13 || a === 16);
  const filled = a >= 1 && a <= 10;
  const takka = a === 2 ? "1" : a >= 3 && filled ? "12" : "";
  const rate = a >= 4 && filled ? "86.35".slice(0, Math.min(a - 3, 5)) : "";
  const basic = takka === "12" && rate === "86.35" ? BASIC : 0;
  const money = (n: number) => (basic ? inr(n) : "—");

  return (
    <div className={s.root}>
      <div className={s.frame}>
        <div className={s.side}>
          <div className={s.brand}>
            <Logo className={s.logoSmall} />
            <span className={s.brandName}>TexAgent</span>
          </div>
          {NAV.map((n, i) =>
            n === n.toUpperCase() ? (
              <div key={n} className={`${s.label} ${s.group} ${i ? s.groupGap : ""}`}>
                {n}
              </div>
            ) : (
              <div
                key={n}
                className={`${s.nav} ${n === VIEWS[view] ? s.navOn : n === hover ? s.navHover : ""}`}
              >
                {n}
              </div>
            ),
          )}
        </div>

        <div className={s.main}>
          <div className={s.top}>
            <span className={s.search}>Search bill no, party…</span>
          </div>

          {loading ? (
            <Skeleton />
          ) : view === 0 ? (
            <div key={`b${round}`} className={live && a >= 1 && a < 9 ? s.rise : undefined}>
              <Heading t="New Bill" sub={`01/09/2026 · Bill No ${filled ? "1043" : "—"}`} />
              <div className={`${s.card} ${s.form}`}>
                <Field label="Party" value="Sample Fabrics" />
                <Field label="Bill Name" value={filled ? "Demo Yarn Co." : ""} />
                <Field label="Item / Quality" value={filled ? "Grey Poplin 60s" : ""} />
                <Field label="Takka" value={takka} num caret={live && a >= 1 && a < 4} />
                <Field label="Qty (Mtr)" value={takka ? inr(12000 * Number(takka), false) : ""} num />
                <Field label="Rate" value={rate} num caret={live && a >= 4 && a < 9} />
              </div>
              <div className={s.sums}>
                <div className={`${s.card} ${s.sumCard}`}>
                  <Sum k="Basic amount" tag="auto" v={money(basic)} />
                  <Sum k="GST" tag="5%" v={money(GST)} />
                  <Sum k="Total" v={money(TOTAL)} big />
                </div>
                <div>
                  <Field label="Due days" value="30" num />
                  <div className={s.due}>Due 01/10/2026</div>
                </div>
              </div>
              <div className={`${s.saved} ${a === 11 || a === 12 ? "" : s.hidden}`}>Bill 1043 saved</div>
              <div className={`${s.card} ${s.bar}`}>
                <span className={s.barTotals}>
                  Total <b>{money(TOTAL)}</b>
                  <br />
                  Brokerage <b>{money(BROKERAGE)}</b>
                </span>
                <span className={s.btnGhost}>Save &amp; close</span>
                <span className={`${s.btn} ${a === 9 || a === 10 ? s.btnDown : ""} ${a === 10 ? s.btnBusy : ""}`}>
                  {a === 10 ? "Saving…" : "Save & add another"}
                </span>
              </div>
            </div>
          ) : view === 1 ? (
            <div>
              <div className={`${s.bold} ${s.accent}`}>← Parties</div>
              <div className={s.partyHead}>
                <h3 className={s.title}>Sample Fabrics</h3>
                <span className={s.account}>ACCOUNT</span>
                <span className={`${s.pushRight} ${s.muted}`}>Buyer · Surat</span>
              </div>
              <div className={`${s.card} ${s.owed}`}>
                <span className={s.label}>Outstanding</span>
                <b className={s.owedAmount}>{inr(21650555)}</b>
                <span className={`${s.pushRight} ${s.muted}`}>FY business {inr(31890555)}</span>
              </div>
              <div className={`${s.card} ${s.table}`}>
                <div className={`${s.billRow} ${s.billHead} ${s.label}`}>
                  <Heads h={["Date", "Bill", "Total ₹", "Payment", "Brok."]} right={2} />
                </div>
                {BILLS.map(([date, no, total, pay, brok]) => (
                  <div key={no} className={`${s.billRow} ${s.billLine}`}>
                    <span>{date}</span>
                    <b className={s.accent}>{no}</b>
                    <b className={s.right}>{inr(total, false)}</b>
                    <Pill status={pay} />
                    <Pill status={brok} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Heading t="Follow-ups" sub="Who to call today" />
              <div className={s.chips}>
                {CHIPS.map((c, i) => (
                  <span key={c} className={`${s.chip} ${i ? (i > 3 ? s.red : s.muted) : s.chipOn}`}>
                    {c}
                  </span>
                ))}
              </div>
              {[0, 1].map((e) => (
                <div key={e} className={`${s.card} ${s.follow}`}>
                  <div className={s.heading}>
                    <span className={s.followName}>{e ? "Model Silk Mills" : "Sample Fabrics"}</span>
                    <span className={`${s.bold} ${s.red}`}>oldest {e ? 12 : 74}d overdue</span>
                    <b className={s.followAmount}>{inr(e ? 2695000 : 8594435)}</b>
                  </div>
                  <div className={s.followMeta}>
                    {e ? 1 : 2} bill{e ? "" : "s"} due
                    <span className={s.call}>Call</span>
                  </div>
                  {!e && (
                    <Fragment>
                      <div className={`${s.dueRow} ${s.dueHead} ${s.label}`}>
                        <Heads h={["Bill", "Due date", "Late", "Remaining ₹"]} right={3} />
                      </div>
                      {OVERDUE.map(([no, due, late, left]) => (
                        <div key={no} className={`${s.dueRow} ${s.dueLine}`}>
                          <b className={s.accent}>{no}</b>
                          <span>{due}</span>
                          <b className={s.red}>{late}</b>
                          <b className={s.right}>{inr(left, false)}</b>
                        </div>
                      ))}
                    </Fragment>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {live && (
          <div className={`${s.splash} ${a ? s.splashGone : ""}`}>
            <Logo key={round} className={s.logoLarge} draw={a === 0} />
            <span className={s.splashText}>Loading…</span>
          </div>
        )}
      </div>
    </div>
  );
}
