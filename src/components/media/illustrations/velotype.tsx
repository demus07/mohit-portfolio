"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IllustrationTag } from "./tag";

// VeloType (github.com/Mohit-Bagri/velotype), default dark theme. Drawn at 440px, scaled with cqw.
const u = (px: number) => `${+(px / 4.4).toFixed(3)}cqw`;
const ACC = "#8b5cf6";
const TEXT = "#d1d0e0";
const SUB = "rgba(255,255,255,0.3)";
const ERR = "#f87171";
const CARD = "#16161d";
const LH = 2.07; // line-height / font-size, as in the app (48px @ 1.45rem)
const CARET_T = "transform 100ms cubic-bezier(0.17,0.67,0.5,1)";

const WORDS =
  "student take any start busy them suppose world party example heavy there bring introduce morning round poet within brain strip black this ring college sheet stream machine".split(" ");
// "~" = backspace: one typo ("thr"), noticed and fixed.
const KEYS = "student take any start busy thr~em suppose world party example heavy there bring introduce morning round".split("");
const LIVE = [0, 84, 96, 103, 107, 110, 112, 111, 113, 115, 114, 114, 115, 114, 114];
const WPM = [98, 112, 104, 118, 121, 109, 116, 124, 119, 113, 122, 117, 110, 120, 114];
const RAW = [104, 118, 112, 122, 125, 118, 120, 128, 124, 118, 126, 121, 116, 124, 118];

const LOGO = [
  "██╗   ██╗███████╗██╗      ██████╗ ████████╗██╗   ██╗██████╗ ███████╗",
  "██║   ██║██╔════╝██║     ██╔═══██╗╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝",
  "██║   ██║█████╗  ██║     ██║   ██║   ██║    ╚████╔╝ ██████╔╝█████╗",
  "╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║   ██║     ╚██╔╝  ██╔═══╝ ██╔══╝",
  " ╚████╔╝ ███████╗███████╗╚██████╔╝   ██║      ██║   ██║     ███████╗",
  "  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝    ╚═╝      ╚═╝   ╚═╝     ╚══════╝",
].join("\n");

type Phase = "idle" | "run" | "done";
type State = { phase: Phase; n: number; t: number; wpm: number };
const IDLE: State = { phase: "idle", n: 0, t: 15, wpm: 0 };

function typedAt(n: number) {
  const t = [""];
  for (const k of KEYS.slice(0, n)) {
    if (k === " ") t.push("");
    else if (k === "~") t[t.length - 1] = t[t.length - 1].slice(0, -1);
    else t[t.length - 1] += k;
  }
  return t;
}

const pt = (v: number[], i: number) => [(i / (v.length - 1)) * 140, 100 - (v[i] / 150) * 100];
function curve(v: number[]) {
  let d = `M${pt(v, 0)}`;
  for (let i = 1; i < v.length; i++) {
    const [x0, y0] = pt(v, i - 1);
    const [x1, y1] = pt(v, i);
    const m = (x0 + x1) / 2;
    d += `C${m},${y0} ${m},${y1} ${x1},${y1}`;
  }
  return d;
}
const WPM_D = curve(WPM);

export function VeloTypeIllustration({ active }: { active: boolean }) {
  const [s, setS] = useState<State>(IDLE);
  const [rev, setRev] = useState(0);
  const v = active ? s : IDLE;
  const typed = typedAt(v.n);
  const cur = typed.length - 1;
  const running = v.phase === "run";
  const done = v.phase === "done";

  const wordsRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const wordEls = useRef<(HTMLSpanElement | null)[]>([]);
  const charEls = useRef<(HTMLSpanElement | null)[]>([]);
  const geo = useRef({ y: -1, line: 0 });

  // Scripted story: idle -> typing (15s test, shown 2x fast) -> results -> loop.
  useEffect(() => {
    if (!active) return;
    let alive = true;
    let id: ReturnType<typeof setTimeout> | undefined;
    const wait = (ms: number) => new Promise<void>((r) => (id = setTimeout(r, ms)));
    (async () => {
      while (alive) {
        setS(IDLE);
        await wait(1500);
        const t0 = performance.now();
        for (let n = 1; n <= KEYS.length && alive; n++) {
          const el = performance.now() - t0;
          if (el >= 7500) break;
          const tick = Math.floor(el / 500);
          setS({ phase: "run", n, t: 15 - tick, wpm: LIVE[tick] });
          const k = KEYS[n];
          await wait(k === "~" ? 460 : KEYS[n - 1] === "~" ? 170 : k === " " ? 95 + Math.random() * 60 : 52 + Math.random() * 60);
        }
        if (!alive) return;
        setS((p) => ({ ...p, phase: "done" }));
        await wait(4800);
      }
    })();
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [active]);

  // re-measure on resize / font load
  useEffect(() => {
    const ro = new ResizeObserver(() => setRev((r) => r + 1));
    if (wordsRef.current) ro.observe(wordsRef.current);
    document.fonts?.ready.then(() => setRev((r) => r + 1));
    return () => ro.disconnect();
  }, []);

  // caret + line scroll, measured from the DOM like the app
  useLayoutEffect(() => {
    const w = wordEls.current[cur];
    const words = wordsRef.current;
    const caret = caretRef.current;
    if (!w || !words || !caret) return;
    const ci = typed[cur].length;
    const c = charEls.current[ci - 1];
    const x = ci === 0 || !c ? w.offsetLeft : c.offsetLeft + c.offsetWidth;
    const lh = w.offsetHeight;
    const g = geo.current;
    if (v.phase === "idle") g.line = 0;
    else g.line = Math.max(g.line, Math.round(w.offsetTop / lh));
    words.style.transition = running ? "transform 200ms cubic-bezier(0.25,0.1,0.25,1)" : "none";
    words.style.transform = `translateY(${-g.line * lh}px)`;
    caret.style.transition = w.offsetTop !== g.y || v.n === 0 ? "none" : CARET_T;
    caret.style.transform = `translate3d(${x}px,${w.offsetTop}px,0)`;
    g.y = w.offsetTop;
  });

  // The app's caret pulses when idle (opacity only).
  useEffect(() => {
    if (!active || v.phase !== "idle" || !caretRef.current) return;
    const a = caretRef.current.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], {
      duration: 1000,
      iterations: Infinity,
      easing: "ease-in-out",
    });
    return () => a.cancel();
  }, [active, v.phase]);

  const fade = (on: boolean, extra = "") => ({
    opacity: on ? 1 : 0,
    transform: extra,
    transition: "opacity 250ms ease, transform 300ms ease",
  });

  return (
    <div
      className="absolute inset-0 overflow-hidden font-mono"
      style={{ containerType: "inline-size", background: "linear-gradient(180deg,#0f0f14,#13131c 50%,#0f0f14)", color: TEXT }}
      data-rev={rev}
    >
      <IllustrationTag />
      <div className="flex flex-col" style={{ padding: `${u(12)} ${u(28)} 0` }}>
        <div className="flex flex-col items-center" style={fade(!running)}>
          <pre
            aria-hidden
            className="select-none bg-clip-text text-transparent"
            style={{ fontSize: u(3.6), lineHeight: 1.15, backgroundImage: "linear-gradient(90deg,#8b5cf6,#c084fc,#818cf8,#a78bfa)" }}
          >
            {LOGO}
          </pre>
          <nav
            className="flex items-center"
            style={{ marginTop: u(8), padding: `${u(2)} ${u(8)}`, gap: u(1), borderRadius: u(11), background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", color: SUB }}
          >
            {["Mode", "Options", "Settings"].map((l) => (
              <span key={l} className="flex items-center" style={{ fontSize: u(11), fontWeight: 500, padding: `${u(4)} ${u(7)}`, gap: u(3) }}>
                {l}
                <Icon d="M9 6l6 6-6 6" size={7} />
              </span>
            ))}
            <Sep />
            <Icon d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
            <Icon d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7" />
            <Sep />
            <Icon d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />
            <Icon d="M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </nav>
          <div style={{ marginTop: u(7), fontSize: u(10.5), letterSpacing: "0.05em", color: SUB }}>
            <span style={{ color: ACC }}>time</span>
            {["15s", "english", "medium"].map((x) => (
              <span key={x}>
                <span style={{ margin: `0 ${u(6)}`, opacity: 0.3 }}>/</span>
                {x}
              </span>
            ))}
          </div>
        </div>

        <div className="relative" style={{ marginTop: u(10), height: u(170) }}>
          <div className="absolute inset-0" style={fade(!done)}>
            <div className="flex items-center tabular-nums" style={{ height: u(26), gap: u(12), ...fade(running) }}>
              <span style={{ fontSize: u(19), fontWeight: 600, color: ACC, lineHeight: 1 }}>{v.t}</span>
              <span style={{ fontSize: u(11), color: SUB, opacity: v.wpm ? 1 : 0 }}>{v.wpm} wpm</span>
            </div>
            <div className="overflow-hidden" style={{ fontSize: u(15.5), height: `${3 * LH}em` }}>
              <div ref={wordsRef} className="relative flex flex-wrap" style={{ lineHeight: LH, columnGap: "0.5em" }}>
                <div
                  ref={caretRef}
                  className="absolute left-0 top-0"
                  style={{ width: u(2.3), height: "1.3em", marginTop: `${(LH - 1.3) / 2}em`, borderRadius: 2, background: ACC, boxShadow: `0 0 ${u(7)} ${ACC}` }}
                />
                {WORDS.map((w, wi) =>
                  wi === cur ? (
                    <span key={wi} ref={(e) => void (wordEls.current[wi] = e)}>
                      {w.split("").map((ch, ci) => {
                        const t = typed[cur][ci];
                        return (
                          <span key={ci} ref={(e) => void (charEls.current[ci] = e)} style={{ color: t === undefined ? SUB : t === ch ? TEXT : ERR }}>
                            {ch}
                          </span>
                        );
                      })}
                    </span>
                  ) : (
                    <span key={wi} ref={(e) => void (wordEls.current[wi] = e)} style={{ color: wi < cur ? TEXT : SUB }}>
                      {w}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="text-center" style={{ marginTop: u(12), fontSize: u(10), letterSpacing: "0.05em", color: "rgba(255,255,255,0.25)", ...fade(!running) }}>
              <kbd style={{ padding: `${u(1)} ${u(5)}`, borderRadius: u(3), background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>esc</kbd>
              <span style={{ marginLeft: u(6) }}>- restart test</span>
            </div>
          </div>

          <div className="absolute inset-x-0 top-0" style={fade(done, done ? "none" : `translateY(${u(8)})`)}>
            <Results play={done} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Results({ play }: { play: boolean }) {
  const label = { fontSize: u(10), lineHeight: 1, letterSpacing: "0.18em", color: SUB, textTransform: "uppercase" as const };
  const big = { fontSize: u(25), fontWeight: 700, lineHeight: 1, color: ACC };
  const box = { background: CARD, border: "1px solid rgba(255,255,255,0.06)", borderRadius: u(10) };
  return (
    <>
      <div className="flex tabular-nums" style={{ ...box, padding: `${u(10)} ${u(12)}`, gap: u(12) }}>
        <div className="flex shrink-0 flex-col justify-center" style={{ gap: u(10), width: u(72) }}>
          {[
            ["wpm", "114"],
            ["acc", "98%"],
          ].map(([l, n]) => (
            <div key={l}>
              <div style={{ ...label, marginBottom: u(5) }}>{l}</div>
              <div style={big}>{n}</div>
            </div>
          ))}
        </div>
        <div className="flex min-w-0 flex-1" style={{ height: u(76), gap: u(5) }}>
          <div className="flex flex-col justify-between text-right" style={{ fontSize: u(10), color: SUB, lineHeight: 1, margin: `${u(-4)} 0` }}>
            {[150, 100, 50, 0].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          <div className="relative flex-1">
            <svg viewBox="0 0 140 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <linearGradient id="vt-wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACC} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={ACC} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d="M0 0H140M0 33.3H140M0 66.7H140M0 100H140" stroke="rgba(255,255,255,0.05)" vectorEffect="non-scaling-stroke" />
              <path d={`${WPM_D}L140,100L0,100Z`} fill="url(#vt-wg)" />
              <path d={curve(RAW)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
              <path d={WPM_D} fill="none" stroke={ACC} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="absolute font-bold" style={{ left: `${(4 / 14) * 100}%`, top: u(-7), fontSize: u(11), color: ERR, transform: "translateX(-50%)" }}>
              x
            </span>
            {/* left-to-right reveal of the chart (transform only) */}
            <div
              className="absolute origin-right"
              style={{ inset: `${u(-8)} ${u(-2)} ${u(-2)} ${u(-2)}`, background: CARD, transform: `scaleX(${play ? 0 : 1})`, transition: play ? "transform 1100ms cubic-bezier(0.3,0.6,0.3,1) 250ms" : "none" }}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 text-center tabular-nums" style={{ marginTop: u(8), gap: u(8) }}>
        {[
          ["test type", "time 15s"],
          ["raw wpm", "118"],
          ["consistency", "92%"],
          ["time", "15s"],
        ].map(([l, n]) => (
          <div key={l} style={{ ...box, padding: `${u(6)} ${u(4)}`, lineHeight: 1.25 }}>
            <div style={{ ...label, fontSize: u(9.5), letterSpacing: "0.1em", fontWeight: 600, whiteSpace: "nowrap" }}>{l}</div>
            <div style={{ marginTop: u(2), fontSize: u(13), fontWeight: 600, color: l === "test type" ? ACC : TEXT }}>{n}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Icon({ d, size = 12 }: { d: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: u(size), height: u(size), margin: size > 10 ? `0 ${u(5)}` : undefined, opacity: size > 10 ? 1 : 0.4 }}
    >
      <path d={d} />
    </svg>
  );
}

function Sep() {
  return <span style={{ width: 1, height: u(14), margin: `0 ${u(3)}`, background: "rgba(255,255,255,0.08)" }} />;
}
