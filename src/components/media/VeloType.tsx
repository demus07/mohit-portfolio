"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { useReplay, type Sleep } from "./useReplay";
import s from "./VeloType.module.css";

const TEXT =
  "the night train hums along the coast while a few late riders read by the glow of their phones and the city turns its lights down one window at a time until only the station clock is awake";
const WORDS = TEXT.split(" ");
const DURATION = 15_000;

// Where the ghost slips, and what it hits instead.
const SLIPS: Record<number, string> = { 24: "r", 67: "w", 95: "m" };

type Frame = { t: number; pos: number; wrong: number | null };
type Sample = { wpm: number; raw: number };

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The whole run is decided up front, so the live counter and the result chart tell the same story.
function rehearse() {
  const rand = seeded(11);
  const frames: Frame[] = [];
  const keys: { t: number; ok: boolean }[] = [];
  let t = 0;
  let pos = 0;
  const slipped = new Set<number>();
  while (pos < TEXT.length) {
    let dt = 92 + rand() * 72 + (TEXT[pos] === " " ? 30 : 0);
    if (SLIPS[pos] && !slipped.has(pos)) {
      slipped.add(pos);
      t += dt;
      frames.push({ t, pos: pos + 1, wrong: pos });
      keys.push({ t, ok: false });
      t += 340;
      frames.push({ t, pos, wrong: null });
      dt = 170;
    }
    t += dt;
    if (t > DURATION) break;
    frames.push({ t, pos: pos + 1, wrong: null });
    keys.push({ t, ok: true });
    pos++;
  }
  const samples: Sample[] = [];
  for (let sec = 1; sec <= DURATION / 1000; sec++) {
    const upTo = keys.filter((k) => k.t <= sec * 1000);
    const ok = upTo.filter((k) => k.ok).length;
    samples.push({ wpm: (ok / 5) * (60 / sec), raw: (upTo.length / 5) * (60 / sec) });
  }
  const errors = keys.filter((k) => !k.ok).map((k) => Math.min(DURATION / 1000, Math.ceil(k.t / 1000)));
  const ok = keys.filter((k) => k.ok).length;
  return {
    frames,
    samples,
    errors,
    correct: ok,
    incorrect: keys.length - ok,
    acc: Math.round((ok / keys.length) * 100),
  };
}

const RUN = rehearse();
const LAST = RUN.samples[RUN.samples.length - 1];

// Chart geometry, in viewBox units.
const CW = 300;
const CH = 120;
const MAX_Y = Math.ceil(Math.max(...RUN.samples.map((p) => p.raw)) / 25) * 25 + 25;
const px = (i: number) => (i / (RUN.samples.length - 1)) * CW;
const py = (v: number) => CH - 6 - (v / MAX_Y) * (CH - 14);
const linePath = (pick: (p: Sample) => number) =>
  RUN.samples.map((p, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(pick(p)).toFixed(1)}`).join(" ");
const WPM_LINE = linePath((p) => p.wpm);
const RAW_LINE = linePath((p) => p.raw);
const WPM_AREA = `${WPM_LINE} L${CW} ${CH} L0 ${CH} Z`;
const CONSISTENCY = (() => {
  const v = RUN.samples.slice(2).map((p) => p.raw);
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
  return Math.round(100 - (sd / mean) * 100);
})();

type State = { pos: number; wrong: number | null; t: number; started: boolean };
const START: State = { pos: 0, wrong: null, t: 0, started: false };

async function play(
  sleep: Sleep,
  setState: (v: State) => void,
  setView: (v: "type" | "result") => void,
  setFade: (v: boolean) => void,
) {
  setState(START);
  setView("type");
  await sleep(1300);
  let prev = 0;
  for (const f of RUN.frames) {
    await sleep(f.t - prev);
    prev = f.t;
    setState({ pos: f.pos, wrong: f.wrong, t: f.t, started: true });
  }
  await sleep(Math.max(0, DURATION - prev));
  setState({ pos: RUN.frames[RUN.frames.length - 1].pos, wrong: null, t: DURATION, started: true });
  await sleep(450);
  setView("result");
  await sleep(5600);
  setFade(true);
  await sleep(750);
  setView("type");
  setState(START);
  await sleep(450);
  setFade(false);
}

function Chart() {
  return (
    <svg className={s.chart} viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="vt-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2a145" stopOpacity="0.22" />
          <stop offset="1" stopColor="#f2a145" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={CW} y1={CH * f} y2={CH * f} className={s.grid} vectorEffect="non-scaling-stroke" />
      ))}
      <g className={s.draw}>
        <path d={WPM_AREA} fill="url(#vt-area)" />
        <path d={RAW_LINE} className={s.raw} vectorEffect="non-scaling-stroke" />
        <path d={WPM_LINE} className={s.wpmLine} vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

export function VeloTypeMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<State>(START);
  const [view, setView] = useState<"type" | "result">("type");
  const [fade, setFade] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);

  useReplay(active, !reduced, (sleep) => play(sleep, setState, setView, setFade));

  // Place the caret with a transform and scroll the paragraph a line at a time; text never reflows.
  const posRef = useRef(0);
  const place = useCallback(() => {
    const c = caret.current;
    const wrap = inner.current;
    const all = letters.current;
    if (!c || !wrap || !all.length) return;
    const pos = posRef.current;
    const atEnd = pos >= all.length;
    const el = all[Math.min(pos, all.length - 1)];
    if (!el) return;
    const x = el.offsetLeft + (atEnd ? el.offsetWidth : 0);
    const y = el.offsetTop;
    c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const lh = parseFloat(getComputedStyle(wrap).lineHeight) || el.offsetHeight;
    const line = Math.round(y / lh);
    wrap.style.transform = `translate3d(0, ${-Math.max(0, line - 1) * lh}px, 0)`;
  }, []);
  useLayoutEffect(() => {
    posRef.current = state.pos;
    place();
  }, [state.pos, place]);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [place]);

  const shownView = reduced ? "result" : view;
  const sec = Math.floor(state.t / 1000);
  const live = sec >= 1 ? Math.round(RUN.samples[sec - 1].wpm) : 0;
  let idx = 0;

  return (
    <div
      className={`${s.root} ${reduced ? s.still : ""} ${active ? "" : s.paused}`}
      role="img"
      aria-label={`VeloType typing test: a 15 second run finishing at ${Math.round(LAST.wpm)} words per minute with ${RUN.acc}% accuracy`}
    >
      <div className={s.stage} style={{ opacity: fade ? 0 : 1 }} aria-hidden="true">
        <header className={s.top}>
          <span className={s.logo}>
            <span className={s.mark}>v</span>velotype
          </span>
          <span className={s.modes}>
            <span>punctuation</span>
            <span>numbers</span>
            <span className={s.sep} />
            <span className={s.on}>time</span>
            <span>words</span>
            <span className={s.sep} />
            <span className={s.on}>15</span>
            <span>30</span>
            <span>60</span>
          </span>
        </header>

        <section className={`${s.view} ${shownView === "type" ? s.shown : ""}`}>
          <div className={s.stats}>
            <span className={s.timer}>{Math.max(0, 15 - sec)}</span>
            <span className={s.live} style={{ opacity: sec >= 1 ? 1 : 0 }}>
              {live} wpm
            </span>
          </div>
          <div ref={box} className={s.words}>
            <div ref={inner} className={s.inner}>
              {WORDS.map((w, wi) => {
                const word = (
                  <span key={wi} className={s.word}>
                    {[...w].map((ch) => {
                      const i = idx++;
                      const cls = i < state.pos ? (state.wrong === i ? s.bad : s.good) : "";
                      return (
                        <span key={i} ref={(n) => void (letters.current[i] = n)} className={cls}>
                          {ch}
                        </span>
                      );
                    })}
                  </span>
                );
                if (wi === WORDS.length - 1) return word;
                const sp = idx++;
                return [
                  word,
                  <span key={`s${sp}`} ref={(n) => void (letters.current[sp] = n)}>
                    {" "}
                  </span>,
                ];
              })}
              <span ref={caret} className={`${s.caret} ${state.started ? "" : s.idle}`} />
            </div>
          </div>
          <div className={s.hint}>
            <kbd>tab</kbd> + <kbd>enter</kbd> restart test
          </div>
        </section>

        <section className={`${s.view} ${s.result} ${shownView === "result" ? s.shown : ""}`}>
          <div className={s.big}>
            <div>
              <div className={s.label}>wpm</div>
              <div className={s.value}>{Math.round(LAST.wpm)}</div>
            </div>
            <div>
              <div className={s.label}>acc</div>
              <div className={s.value}>{RUN.acc}%</div>
            </div>
          </div>
          <div className={s.plot}>
            <Chart />
            <div className={s.errs}>
              {RUN.errors.map((e, i) => (
                <i key={i} style={{ left: `${(px(e - 1) / CW) * 100}%` }} />
              ))}
            </div>
          </div>
          <div className={s.more}>
            <div>
              <div className={s.label}>test type</div>
              <div className={s.small}>time 15</div>
            </div>
            <div>
              <div className={s.label}>raw</div>
              <div className={s.small}>{Math.round(LAST.raw)}</div>
            </div>
            <div>
              <div className={s.label}>characters</div>
              <div className={s.small}>
                {RUN.correct}/{RUN.incorrect}/0/0
              </div>
            </div>
            <div>
              <div className={s.label}>consistency</div>
              <div className={s.small}>{CONSISTENCY}%</div>
            </div>
            <div>
              <div className={s.label}>time</div>
              <div className={s.small}>15s</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
