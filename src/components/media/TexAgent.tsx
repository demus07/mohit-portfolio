"use client";

import { useTimeline } from "./useTimeline";
import s from "./TexAgent.module.css";

// ---------- money, in paisa, with Indian digit grouping ----------

const group = (r: string) =>
  r.length > 3 ? `${r.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${r.slice(-3)}` : r;

const inr = (paisa: number, symbol = true) =>
  `${symbol ? "₹" : ""}${group(String(Math.floor(paisa / 100)))}.${String(paisa % 100).padStart(2, "0")}`;

const GST_RATE = 0.05;
const BROK_RATE = 0.015;
const gstOf = (basic: number) => Math.round(basic * GST_RATE);
const brokOf = (basic: number) => Math.round(basic * BROK_RATE);
const totalOf = (basic: number) => basic + gstOf(basic);

type Status = "Pending" | "Partial" | "Paid";
type Bill = { date: string; no: string; item: string; basic: number; received: number; pay: Status; brok: Status };

const OLD_BILLS: Bill[] = [
  { date: "30/06/2026", no: "1011", item: "Cambric 40s", basic: 3924643, received: 0, pay: "Pending", brok: "Pending" },
  { date: "20/05/2026", no: "0987", item: "Rayon Slub", basic: 8070057, received: 4000000, pay: "Partial", brok: "Pending" },
  { date: "02/05/2026", no: "0952", item: "Grey Poplin 60s", basic: 5942857, received: 6240000, pay: "Paid", brok: "Paid" },
];

const NEW_BASIC = 12434400;
const NEW_BILL: Bill = {
  date: "01/09/2026",
  no: "1043",
  item: "Grey Poplin 60s",
  basic: NEW_BASIC,
  received: 0,
  pay: "Pending",
  brok: "Pending",
};

const outstanding = (bills: Bill[]) => bills.reduce((n, b) => n + totalOf(b.basic) - b.received, 0);
const brokDue = (bills: Bill[]) => bills.reduce((n, b) => n + (b.brok === "Paid" ? 0 : brokOf(b.basic)), 0);

const NAV = ["Dashboard", "Parties", "Payments", "Follow-ups", "Brokerage", "Reports"];

// ---------- the loop, as a list of frames ----------

type Field = "party" | "item" | "basic" | "due";
type Frame = {
  ms: number;
  veil: boolean;
  press: "new" | "save" | null;
  sheet: boolean;
  party: string;
  item: string;
  basic: string;
  due: string;
  caret: Field | null;
  computed: boolean;
  toast: boolean;
  landed: boolean;
};

const BASE: Frame = {
  ms: 0,
  veil: false,
  press: null,
  sheet: false,
  party: "",
  item: "",
  basic: "",
  due: "",
  caret: null,
  computed: false,
  toast: false,
  landed: false,
};

const FRAMES: Frame[] = [];
const push = (ms: number, patch: Partial<Frame>) => {
  const prev = FRAMES[FRAMES.length - 1] ?? BASE;
  FRAMES.push({ ...prev, veil: false, press: null, ...patch, ms });
};

push(650, { veil: true });
push(1700, {});
push(450, { press: "new" });
push(750, { sheet: true, caret: "party" });
["Demo", "Demo Yarn", "Demo Yarn Co."].forEach((party) => push(230, { party }));
push(300, { caret: "item" });
["Grey", "Grey Poplin", "Grey Poplin 60s"].forEach((item) => push(230, { item }));
push(300, { caret: "basic" });
["1", "12", "124", "1243", "12434", "124344"].forEach((basic) => push(170, { basic }));
push(300, { caret: "due" });
["3", "30"].forEach((due) => push(220, { due }));
push(1500, { caret: null, computed: true });
push(450, { press: "save" });
push(700, { sheet: false, toast: true });
push(2300, { landed: true });
push(1100, { toast: false });
push(700, { veil: true });

const DURATIONS = FRAMES.map((f) => f.ms);
const STILL = FRAMES.findIndex((f) => f.landed);

// ---------- pieces ----------

const statusClass: Record<Status, string> = { Pending: s.pending, Partial: s.partial, Paid: s.paid };

function Pill({ status }: { status: Status }) {
  return <span className={`${s.pill} ${statusClass[status]}`}>{status}</span>;
}

function Input({ label, value, caret, num }: { label: string; value: string; caret: boolean; num?: boolean }) {
  return (
    <div className={`${s.field} ${caret ? s.focus : ""}`}>
      <span className={s.fieldLabel}>{label}</span>
      <span className={`${s.input} ${num ? s.num : ""}`}>
        {value}
        {caret && <i className={s.caret} />}
      </span>
    </div>
  );
}

export function TexAgentMedia({ active }: { active: boolean }) {
  const { step } = useTimeline(DURATIONS, active, STILL);
  const f = FRAMES[step];

  const bills = f.landed ? [NEW_BILL, ...OLD_BILLS] : OLD_BILLS;
  const rows = [NEW_BILL, ...OLD_BILLS];
  const show = (v: number) => (f.computed ? inr(v) : "—");

  return (
    <div
      className={s.root}
      role="img"
      aria-label="TexAgent, a bahi-khata for textile brokers: a new bill is filled in, GST and brokerage are worked out to the paisa, and the bill lands in the party's ledger"
    >
      <div className={`${s.app} ${f.veil ? s.veiled : ""}`} aria-hidden="true">
        <aside className={s.side}>
          <div className={s.brand}>
            <span className={s.mark}>
              <i />
              <i />
              <i />
            </span>
            TexAgent
          </div>
          <nav className={s.nav}>
            {NAV.map((n) => (
              <span key={n} className={`${s.navItem} ${n === "Parties" ? s.navOn : ""}`}>
                {n}
              </span>
            ))}
          </nav>
        </aside>

        <main className={s.main}>
          <div className={s.crumb}>← Parties</div>
          <div className={s.head}>
            <h3 className={s.title}>Demo Yarn Co.</h3>
            <span className={s.tag}>Account</span>
            <span className={s.meta}>Buyer · Surat</span>
          </div>

          <div className={s.stats}>
            <div className={s.stat}>
              <span className={s.statLabel}>Outstanding</span>
              <b key={outstanding(bills)} className={s.statValue}>
                {inr(outstanding(bills))}
              </b>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Brokerage due</span>
              <b key={brokDue(bills)} className={s.statValue}>
                {inr(brokDue(bills))}
              </b>
            </div>
            <div className={`${s.stat} ${s.statLate}`}>
              <span className={s.statLabel}>Oldest due</span>
              <b className={s.statValue}>74d overdue</b>
            </div>
          </div>

          <div className={s.billsHead}>
            <span className={s.billsTitle}>Bills</span>
            <span className={`${s.newBtn} ${f.press === "new" ? s.pressed : ""}`}>+ New Bill</span>
          </div>

          <div className={s.table}>
            <div className={`${s.row} ${s.th}`}>
              <span>Date</span>
              <span>Bill</span>
              <span className={s.colItem}>Item</span>
              <span className={s.right}>Total ₹</span>
              <span>Payment</span>
              <span className={s.colBrok}>Brok.</span>
            </div>
            <div className={s.tbody}>
              {rows.map((b, i) => {
                const isNew = i === 0;
                const pos = isNew ? 0 : i - (f.landed ? 0 : 1);
                return (
                  <div
                    key={b.no}
                    className={`${s.row} ${s.tr} ${isNew ? (f.landed ? s.fresh : s.waiting) : ""}`}
                    style={{ transform: `translateY(${pos * 100}%)` }}
                  >
                    <span className={s.muted}>{b.date}</span>
                    <b className={s.accent}>{b.no}</b>
                    <span className={`${s.colItem} ${s.clip}`}>{b.item}</span>
                    <b className={s.right}>{inr(totalOf(b.basic), false)}</b>
                    <span>
                      <Pill status={b.pay} />
                    </span>
                    <span className={s.colBrok}>
                      <Pill status={b.brok} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${s.scrim} ${f.sheet ? s.scrimOn : ""}`} />

          <section className={`${s.sheet} ${f.sheet ? s.sheetOn : ""}`}>
            <div className={s.sheetHead}>
              <span className={s.sheetTitle}>New Bill</span>
              <span className={s.muted}>01/09/2026 · Bill No {f.party ? "1043" : "—"}</span>
            </div>
            <div className={s.form}>
              <div className={s.wide}>
                <Input label="Party" value={f.party} caret={f.caret === "party"} />
              </div>
              <div className={s.wide}>
                <Input label="Item / Quality" value={f.item} caret={f.caret === "item"} />
              </div>
              <Input
                label="Basic amount ₹"
                value={f.basic ? (f.computed ? inr(NEW_BASIC, false) : group(f.basic)) : ""}
                caret={f.caret === "basic"}
                num
              />
              <Input label="Due days" value={f.due} caret={f.caret === "due"} num />
            </div>

            <div className={`${s.calc} ${f.computed ? s.calcOn : ""}`}>
              <div className={s.line}>
                <span>Basic amount</span>
                <b>{show(NEW_BASIC)}</b>
              </div>
              <div className={s.line}>
                <span>
                  GST <em>5%</em>
                </span>
                <b>{show(gstOf(NEW_BASIC))}</b>
              </div>
              <div className={`${s.line} ${s.total}`}>
                <span>Total</span>
                <b>{show(totalOf(NEW_BASIC))}</b>
              </div>
              <div className={s.line}>
                <span>
                  Brokerage <em>1.5%</em>
                </span>
                <b>{show(brokOf(NEW_BASIC))}</b>
              </div>
              <div className={`${s.line} ${s.dueLine}`}>
                <span>Due date</span>
                <b>{f.computed ? "01/10/2026" : "—"}</b>
              </div>
            </div>

            <div className={s.actions}>
              <span className={`${s.saveBtn} ${f.press === "save" ? s.pressed : ""}`}>Save bill</span>
              <span className={s.ghostBtn}>Save &amp; add another</span>
            </div>
          </section>

          <div className={`${s.toast} ${f.toast ? s.toastOn : ""}`}>
            <i className={s.tick} />
            Bill 1043 saved
          </div>
        </main>
      </div>
    </div>
  );
}
