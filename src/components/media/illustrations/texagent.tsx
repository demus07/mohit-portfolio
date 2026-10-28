"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { IllustrationTag } from "./tag";

/* TexAgent (Ledger theme). Logo: the Woven T rects from the app's design/logo-preview.html.
   Motion is the app's own: weave loader (globals.css tex-warp/tex-weft, 2s ease-in-out) redone with
   scale; view rise .25s 6px (mockup .view); button hover accent-deep + busy "Saving…" at opacity-60;
   inline saved flash; skeletons swapped in place (DESIGN §6). Paise math; names invented. */

const CSS = `@keyframes tx-w{0%{transform:scaleY(0)}30%,100%{transform:none}}
@keyframes tx-f{0%,30%{transform:scaleX(0)}60%,100%{transform:none}}
@keyframes tx-rise{from{opacity:0;transform:translateY(.45em)}to{opacity:1;transform:none}}
@keyframes tx-sh{from{transform:translateX(-80%)}to{transform:translateX(80%)}}`;

// Woven T: 6 warp segments, then 5 weft segments
const MARK = [
  [172, 100, 40, 40], [172, 180, 40, 240], [236, 100, 40, 104], [236, 244, 40, 176], [300, 100, 40, 40], [300, 180, 40, 240],
  [96, 140, 140, 40], [276, 140, 140, 40], [96, 204, 76, 40], [212, 204, 88, 40], [340, 204, 76, 40],
];
const Mark = ({ className, draw }: { className: string; draw?: boolean }) => (
  <svg viewBox="96 100 320 320" className={className} aria-hidden="true">
    {MARK.map(([x, y, w, h], i) => (
      <rect
        key={i} x={x} y={y} width={w} height={h} fill="#8f2b1e"
        style={draw ? { transformBox: "fill-box", transformOrigin: i < 6 ? "top" : "left", animation: `${i < 6 ? "tx-w" : "tx-f"} 2s ease-in-out both` } : undefined}
      />
    ))}
  </svg>
);

// hold per step (ms): 0 loader · 1-8 bill entry · 9-11 save · 12-14 ledger · 15-17 follow-ups
const T = [2000, 700, 170, 380, 170, 170, 170, 170, 900, 350, 600, 1300, 350, 450, 2200, 350, 450, 2400];
const REST = 8;
const START = 9;
const BASIC = 12434400; // 1,440 mtr × 86.35
const TOTAL = BASIC + 621720; // + GST 5%

const inr = (p: number, sym = true) => {
  const [i, f] = (p / 100).toFixed(2).split(".");
  const g = i.length > 3 ? i.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + i.slice(-3) : i;
  return `${sym ? "₹" : ""}${g}.${f}`;
};

const A = "text-[#8f2b1e]";
const MUT = "text-[#77694f]";
const DUE = "text-[#b3261e]";
const CARD = "rounded-[.7em] border border-[#e2d8c3] bg-[#fffdf8]";
const LBL = `text-[.93em] font-extrabold uppercase tracking-[.06em] ${MUT}`;
const H = "font-serif text-[1.5em] font-extrabold leading-[1.2]";
const PILL: Record<string, string> = {
  Pending: "border-[#b3261e]/25 bg-[#b3261e]/10 text-[#b3261e]",
  Partial: "border-[#9a5b0c]/25 bg-[#9a5b0c]/10 text-[#9a5b0c]",
  Paid: "border-[#1e6b41]/25 bg-[#1e6b41]/10 text-[#1e6b41]",
};
const Pill = ({ s }: { s: string }) => (
  <span className={`justify-self-start whitespace-nowrap rounded-full border px-[.45em] text-[.93em] font-extrabold leading-[1.5] before:mr-[.3em] before:inline-block before:size-[.35em] before:rounded-full before:bg-current before:align-middle ${PILL[s]}`}>
    {s}
  </span>
);

const Field = ({ label, value, num, caret }: { label: string; value: string; num?: boolean; caret?: boolean }) => (
  <div className="min-w-0">
    <div className={`${LBL} truncate`}>{label}</div>
    <div className={`mt-[.2em] flex h-[1.9em] items-center rounded-[.4em] border bg-white px-[.5em] ${num ? "justify-end" : ""} ${caret ? "border-[#8f2b1e]" : "border-[#e2d8c3]"}`}>
      <span className="truncate">{value}</span>
      {caret && <span className="ml-px h-[1.1em] w-px bg-[#8f2b1e]" />}
    </div>
  </div>
);

const Sum = ({ k, v, tag, big }: { k: string; v: string; tag?: string; big?: boolean }) => (
  <div className={`flex justify-between py-[.15em] ${big ? "my-[.1em] border-y-[3px] border-double border-[#e2d8c3] font-extrabold" : ""}`}>
    <span>
      {k}
      {tag && <span className={`ml-[.35em] rounded border border-[#e2d8c3] px-[.3em] text-[.93em] font-bold ${MUT}`}>{tag}</span>}
    </span>
    <b>{v}</b>
  </div>
);

const Cols = ({ h, r }: { h: string[]; r: number }) =>
  h.map((c, i) => (
    <span key={c} className={i === r ? "text-right" : ""}>
      {c}
    </span>
  ));
const Head = ({ t, s }: { t: string; s: string }) => (
  <div className="flex items-baseline gap-[.6em]">
    <h3 className={H}>{t}</h3>
    <span className={MUT}>{s}</span>
  </div>
);

const NAV = ["BOOK", "Dashboard", "Bills", "Parties", "Payments", "MONEY", "Follow-ups", "Brokerage", "Reports"];
const ROW = "grid grid-cols-[5.5em_2.3em_1fr_5.3em_5.3em] items-center gap-[.5em] px-[.7em]";
const LEDGER: [string, string, number, string, string][] = [
  ["01/09/2026", "1043", TOTAL, "Pending", "Pending"],
  ["30/06/2026", "1011", 4120875, "Pending", "Pending"],
  ["20/05/2026", "0987", 8473560, "Partial", "Pending"],
  ["02/05/2026", "0952", 6240000, "Paid", "Paid"],
];
const FU = "grid grid-cols-[3em_1fr_3.2em_auto] gap-x-[.5em]";
const DUES: [string, string, string, number][] = [
  ["0987", "19/06/2026", "74d", 4473560],
  ["1011", "30/07/2026", "33d", 4120875],
];

const Skeleton = () => (
  <div className="relative overflow-hidden" aria-hidden="true">
    {["w-[9em] h-[1.3em]", "mt-[.5em] w-[14em] h-[.8em]", "mt-[1em] w-full h-[3em]", ...Array(4).fill("mt-[.6em] w-full h-[1.5em]")].map((c, i) => (
      <div key={i} className={`rounded-[.3em] bg-[#e2d8c3] ${c}`} />
    ))}
    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,253,248,.7)_50%,transparent)] [animation:tx-sh_1.6s_linear_infinite]" />
  </div>
);

export function TexAgentIllustration({ active }: { active: boolean }) {
  const [step, setStep] = useState(REST);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(REST);
      return;
    }
    let s = START;
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      id = setTimeout(() => {
        s = (s + 1) % T.length;
        if (!s) setCycle((c) => c + 1);
        setStep(s);
        tick();
      }, T[s]);
    };
    setStep(s);
    tick();
    return () => clearTimeout(id);
  }, [active]);

  const pg = step >= 1 && step <= 12 ? 0 : step >= 13 && step <= 15 ? 1 : 2;
  const nav = step === 12 ? "Parties" : step === 15 ? "Follow-ups" : "";
  const skel = active && (step === 13 || step === 16);
  const filled = step >= 1 && step <= 10;
  const takka = step === 2 ? "1" : step >= 3 && filled ? "12" : "";
  const rate = step >= 4 && filled ? "86.35".slice(0, Math.min(step - 3, 5)) : "";
  const basic = takka === "12" && rate === "86.35" ? BASIC : 0;
  const v = (p: number) => (basic ? inr(p) : "—");
  const rise: CSSProperties | undefined = active ? { animation: "tx-rise .25s ease both" } : undefined;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f7f3ea] font-sans text-[#26211b] [container-type:size]">
      <style>{CSS}</style>
      <div className="absolute inset-0 leading-[1.35]" style={{ fontSize: "clamp(8.6px, 2.2cqw, 9.7px)" }}>
        <div className="absolute inset-y-0 left-0 w-[8.8em] border-r border-[#e2d8c3] bg-[#fffdf8]/60">
          <div className="flex h-[2.9em] items-center gap-[.45em] px-[.9em]">
            <Mark className="size-[1.9em]" />
            <span className="font-serif text-[1.2em] font-extrabold">TexAgent</span>
          </div>
          {NAV.map((n, i) =>
            n === n.toUpperCase() ? (
              <div key={n} className={`${LBL} px-[.9em] pb-[.2em] ${i ? "pt-[.6em]" : ""}`}>{n}</div>
            ) : (
              <div
                key={n}
                className={`relative mx-[.4em] rounded-[.45em] px-[.5em] py-[.28em] font-semibold ${
                  n === ["Bills", "Parties", "Follow-ups"][pg]
                    ? `bg-[#8f2b1e]/[.09] ${A} before:absolute before:inset-y-[.35em] before:-left-[.4em] before:w-[2px] before:rounded before:bg-[#8f2b1e]`
                    : `${MUT} ${n === nav ? "bg-[#8f2b1e]/5" : ""}`
                }`}
              >
                {n}
              </div>
            ),
          )}
        </div>

        <div className="absolute inset-y-0 left-[8.8em] right-0 px-[1.1em]">
          <div className="flex h-[2.9em] items-center">
            <span className={`w-[15em] rounded-[.45em] border border-[#e2d8c3] bg-[#fffdf8] px-[.6em] py-[.25em] ${MUT}`}>Search bill no, party…</span>
          </div>
          {skel ? (
            <Skeleton />
          ) : pg === 0 ? (
            <div key={`b${cycle}`} style={step >= 1 && step < 9 ? rise : undefined}>
              <Head t="New Bill" s={`01/09/2026 · Bill No ${filled ? "1043" : "—"}`} />
              <div className={`${CARD} mt-[.55em] grid grid-cols-3 gap-x-[.55em] gap-y-[.5em] p-[.7em]`}>
                <Field label="Party" value="Sample Fabrics" />
                <Field label="Bill Name" value={filled ? "Demo Yarn Co." : ""} />
                <Field label="Item / Quality" value={filled ? "Grey Poplin 60s" : ""} />
                <Field label="Takka" value={takka} num caret={active && step >= 1 && step < 4} />
                <Field label="Qty (Mtr)" value={takka ? inr(+takka * 12000, false) : ""} num />
                <Field label="Rate" value={rate} num caret={active && step >= 4 && step < 9} />
              </div>
              <div className="mt-[.55em] grid grid-cols-[1.5fr_1fr] gap-[.55em]">
                <div className={`${CARD} px-[.75em] py-[.35em]`}>
                  <Sum k="Basic amount" tag="auto" v={v(basic)} />
                  <Sum k="GST" tag="5%" v={v(TOTAL - BASIC)} />
                  <Sum k="Total" v={v(TOTAL)} big />
                </div>
                <div>
                  <Field label="Due days" value="30" num />
                  <div className={`mt-[.35em] ${MUT}`}>Due 01/10/2026</div>
                </div>
              </div>
              <div className={`h-[1.7em] pt-[.35em] font-bold text-[#1e6b41] ${step === 11 || step === 12 ? "" : "invisible"}`}>Bill 1043 saved</div>
              <div className={`${CARD} flex items-center gap-[.4em] p-[.5em]`}>
                <span className="mr-auto leading-[1.3]">
                  Total <b>{v(TOTAL)}</b>
                  <br />
                  Brokerage <b>{v(Math.round((BASIC * 3) / 200))}</b>
                </span>
                <span className="rounded-[.5em] border border-[#e2d8c3] px-[.7em] py-[.5em] font-extrabold @max-[400px]:hidden">Save &amp; close</span>
                <span
                  className={`rounded-[.5em] px-[.8em] py-[.5em] font-extrabold text-[#f7f3ea] ${step === 9 || step === 10 ? "bg-[#701f15]" : "bg-[#8f2b1e]"} ${step === 10 ? "opacity-60" : ""}`}
                >
                  {step === 10 ? "Saving…" : "Save & add another"}
                </span>
              </div>
            </div>
          ) : pg === 1 ? (
            <div>
              <div className={`font-bold ${A}`}>← Parties</div>
              <div className="flex items-center gap-[.5em]">
                <h3 className={H}>Sample Fabrics</h3>
                <span className="rounded border border-[#1e6b41]/30 px-[.35em] text-[.93em] font-extrabold text-[#1e6b41]">ACCOUNT</span>
                <span className={`ml-auto ${MUT}`}>Buyer · Surat</span>
              </div>
              <div className={`${CARD} mt-[.5em] flex items-baseline gap-[.6em] px-[.8em] py-[.45em]`}>
                <span className={LBL}>Outstanding</span>
                <b className={`text-[1.3em] ${A}`}>{inr(21650555)}</b>
                <span className={`ml-auto ${MUT}`}>FY business {inr(31890555)}</span>
              </div>
              <div className={`${CARD} mt-[.55em] overflow-hidden`}>
                <div className={`${ROW} border-b border-[#e2d8c3] py-[.4em] ${LBL}`}>
                  <Cols h={["Date", "Bill", "Total ₹", "Payment", "Brok."]} r={2} />
                </div>
                {LEDGER.map(([d, n, t, p, b]) => (
                  <div key={n} className={`${ROW} h-[2.1em] border-b border-[#e2d8c3]/60 last:border-0`}>
                    <span>{d}</span>
                    <b className={A}>{n}</b>
                    <b className="text-right">{inr(t, false)}</b>
                    <Pill s={p} />
                    <Pill s={b} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Head t="Follow-ups" s="Who to call today" />
              <div className="mt-[.5em] flex gap-[.35em] whitespace-nowrap text-[.93em] font-bold">
                {["All overdue · 3", "0-30 · 1", "31-60 · 1", "61-90 · 1", "90+ · 0"].map((c, i) => (
                  <span key={c} className={`rounded-full border px-[.6em] py-[.15em] ${i ? `border-[#e2d8c3] bg-[#fffdf8] ${i > 3 ? DUE : MUT}` : `border-[#8f2b1e] bg-[#8f2b1e]/[.07] ${A}`}`}>
                    {c}
                  </span>
                ))}
              </div>
              {[0, 1].map((k) => (
                <div key={k} className={`${CARD} mt-[.55em] px-[.8em] py-[.5em]`}>
                  <div className="flex items-baseline gap-[.6em]">
                    <span className="font-serif text-[1.15em] font-extrabold">{k ? "Model Silk Mills" : "Sample Fabrics"}</span>
                    <span className={`font-bold ${DUE}`}>oldest {k ? 12 : 74}d overdue</span>
                    <b className={`ml-auto text-[1.2em] ${A}`}>{inr(k ? 2695000 : 8594435)}</b>
                  </div>
                  <div className={`flex items-center ${MUT}`}>
                    {k ? 1 : 2} bill{k ? "" : "s"} due
                    <span className={`ml-auto rounded-full border border-[#e2d8c3] px-[.6em] font-bold ${A}`}>Call</span>
                  </div>
                  {!k && (
                    <>
                      <div className={`${FU} mt-[.35em] border-y border-[#e2d8c3] py-[.2em] ${LBL}`}>
                        <Cols h={["Bill", "Due date", "Late", "Remaining ₹"]} r={3} />
                      </div>
                      {DUES.map(([n, due, od, amt]) => (
                        <div key={n} className={`${FU} pt-[.3em]`}>
                          <b className={A}>{n}</b>
                          <span>{due}</span>
                          <b className={DUE}>{od}</b>
                          <b className="text-right">{inr(amt, false)}</b>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {active && (
          <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-[.9em] bg-[#f7f3ea] transition-opacity duration-300 ${step ? "pointer-events-none opacity-0" : ""}`}>
            <Mark key={cycle} className="size-[4.2em]" draw={step === 0} />
            <span className={`text-[.93em] font-bold uppercase tracking-[.2em] ${MUT}`}>Loading…</span>
          </div>
        )}
      </div>
      <IllustrationTag tone="light" />
    </div>
  );
}
