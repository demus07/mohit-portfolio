"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/hooks";
import s from "./Aether.module.css";

const ASK = "what's new in open-source AI?";
const ASK_2 = "explain like professor";
const TONE_REPLY = "Switched to Professor mode. Let's continue!";

const YT =
  "M19.615 3.184A3.006 3.006 0 0 1 22 6.077v11.846a3.006 3.006 0 0 1-2.385 2.893C17.155 21.5 12 21.5 12 21.5s-5.155 0-7.615-.684A3.006 3.006 0 0 1 2 17.923V6.077A3.006 3.006 0 0 1 4.385 3.184C6.845 2.5 12 2.5 12 2.5s5.155 0 7.615.684z";
const PLAY = "M10 8.5v7l6-3.5-6-3.5z";

type Source = "news" | "youtube" | "reddit";
type Key = "greet" | "user" | "dots" | Source | "brief" | "user2" | "dots2" | "tone";

const ICON: Record<Source, [string, string]> = {
  news: ["#0094ff", "M4 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h5v2H8v-2z"],
  youtube: ["#ff0000", YT + PLAY],
  reddit: [
    "#ff4500",
    "M14.5 15.5c0 .827-1.12 1.5-2.5 1.5s-2.5-.673-2.5-1.5H8c0 1.379 1.79 2.5 4 2.5s4-1.121 4-2.5h-1.5zm-5-1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z",
  ],
};

// The settled conversation, shown when off screen or with reduced motion.
const FINAL: Key[] = ["greet", "user", "news", "youtube", "reddit", "brief"];

const ROWS: Record<Source, [string, string][]> = {
  news: [
    ["Open models close the gap on coding benchmarks", "News Desk • 3h ago"],
    ["Smaller language models get surprisingly capable", "News Desk • 5h ago"],
  ],
  youtube: [["Running a 7B model on a laptop, explained", "Dev Explained • 48,210 views • 6h ago"]],
  reddit: [["Which open model do you actually use day to day?", "r/MachineLearning • 1,284 upvotes • 9h ago"]],
};

const BRIEF = [
  "Open models close the gap on coding benchmarks (NEWS)",
  "Running a 7B model on a laptop, explained (YouTube)",
  "Smaller language models get surprisingly capable (NEWS)",
];

const EASE = "cubic-bezier(.2,1,.25,1)";

// Fades and lifts its children in a frame after mounting with `on`; with `on` false it is simply there.
function Reveal({
  on,
  delay = 0,
  className = "",
  style,
  children,
}: {
  on: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(!on);
  useEffect(() => {
    if (!on) return;
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(() => setShown(true))));
    return () => cancelAnimationFrame(id);
  }, [on]);
  return (
    <div
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(12px) scale(0.98)",
        transition: on ? `opacity .45s ${EASE} ${delay}ms, transform .45s ${EASE} ${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}

function Bot({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <Reveal on={on} className={`${s.bubble} ${s.bot}`}>
      <strong className={s.botName}>AETHER:</strong> {children}
    </Reveal>
  );
}

function User({ on, text }: { on: boolean; text: string }) {
  return (
    <Reveal on={on} className={s.user}>
      {text}
    </Reveal>
  );
}

function Card({ src, on }: { src: Source; on: boolean }) {
  const [fill, d] = ICON[src];
  return (
    <Reveal on={on} className={`${s.bubble} ${s.card}`}>
      <div className={s.cardHead}>
        <svg viewBox="0 0 24 24" fill={fill} className={s.cardIcon}>
          <path d={d} />
        </svg>
        <strong className={s.cardLabel}>{src === "youtube" ? "YouTube" : src}</strong>
      </div>
      {ROWS[src].map(([title, meta], i) => (
        <Reveal key={title} on={on} delay={160 + 140 * i} className={s.row}>
          {src === "youtube" && (
            <div className={s.thumb}>
              <svg viewBox="0 0 24 24" className={s.thumbIcon}>
                <path d={YT} fill="#ff0000" />
                <path d={PLAY} fill="#fff" />
              </svg>
            </div>
          )}
          <div className={s.rowText}>
            {title}
            <div className={s.rowMeta}>{meta}</div>
          </div>
        </Reveal>
      ))}
      <div className={s.more}>+ Show more {src}</div>
    </Reveal>
  );
}

function Brief({ on }: { on: boolean }) {
  return (
    <Reveal on={on} className={s.brief}>
      <div className={s.briefHead}>
        <span className={s.briefSpacer} />
        <strong className={s.briefTitle}>Aether’s Briefing</strong>
        <span className={s.hide}>▲ Hide</span>
      </div>
      <ul className={s.briefList}>
        {BRIEF.map((line, i) => (
          <Reveal key={line} on={on} delay={200 + 180 * i} className={s.briefItem}>
            {line}
          </Reveal>
        ))}
      </ul>
      <Reveal on={on} delay={860} className={s.briefNote}>
        Capability is spreading outward; what we build with it is still up to us.
      </Reveal>
    </Reveal>
  );
}

function Dots() {
  return (
    <div className={`${s.bubble} ${s.dots}`}>
      {[0, 0.2, 0.4].map((d) => (
        <span key={d} className={s.dot} style={{ animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

function Item({ k, on, tone }: { k: Key; on: boolean; tone: string }) {
  if (k === "greet") return <Bot on={false}>Hey, I&apos;m Aether - your smart news and AI companion! Ask me anything.</Bot>;
  if (k === "user" || k === "user2") return <User on={on} text={k === "user" ? ASK : ASK_2} />;
  if (k === "dots" || k === "dots2") return <Dots />;
  if (k === "brief") return <Brief on={on} />;
  if (k === "tone") return <Bot on={on}>{tone}</Bot>;
  return <Card src={k} on={on} />;
}

export function AetherMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const run = active && !reduced;

  const [items, setItems] = useState<Key[]>(run ? ["greet"] : FINAL);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [tone, setTone] = useState("");
  const [fading, setFading] = useState(false);
  const [snap, setSnap] = useState(true);
  const [scroll, setScroll] = useState(0);

  const viewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const firstAskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!run) {
      /* eslint-disable react-hooks/set-state-in-effect -- settle on the still frame when paused */
      setItems(FINAL);
      setDraft("");
      setBusy(false);
      setPressed(false);
      setFading(false);
      setSnap(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const id = setTimeout(() => {
          timers.delete(id);
          if (cancelled) reject();
          else resolve();
        }, ms);
        timers.add(id);
      });
    const push = (k: Key) => setItems((xs) => [...xs, k]);
    const swap = (from: Key, to: Key) => setItems((xs) => [...xs.filter((x) => x !== from), to]);

    const type = async (text: string) => {
      for (let i = 1; i <= text.length; i++) {
        setDraft(text.slice(0, i));
        await sleep(34 + ((37 * i) % 5) * 8);
      }
      await sleep(260);
      setPressed(true);
      await sleep(160);
      setPressed(false);
      setDraft("");
      setBusy(true);
    };
    const ask = async (text: string, user: Key, dots: Key) => {
      await type(text);
      push(user);
      await sleep(350);
      push(dots);
    };

    (async () => {
      for (;;) {
        setSnap(true);
        setItems(["greet"]);
        setTone("");
        setBusy(false);
        setFading(false);
        await sleep(80);
        setSnap(false);
        await sleep(600);

        await ask(ASK, "user", "dots");
        await sleep(1000);
        swap("dots", "news");
        await sleep(1300);
        push("youtube");
        await sleep(1200);
        push("reddit");
        await sleep(1100);
        push("brief");
        await sleep(1200);
        setBusy(false);
        await sleep(900);

        await ask(ASK_2, "user2", "dots2");
        await sleep(800);
        swap("dots2", "tone");
        await sleep(150);
        for (let i = 1; i <= TONE_REPLY.length; i++) {
          setTone(TONE_REPLY.slice(0, i));
          await sleep(22);
        }
        setBusy(false);
        await sleep(1800);
        setFading(true);
        await sleep(500);
      }
    })().catch(() => {});

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [run]);

  // Follow the newest message while playing; when still, frame the conversation from the first question.
  useLayoutEffect(() => {
    if (!viewRef.current || !listRef.current) return;
    const max = Math.max(0, listRef.current.offsetHeight - viewRef.current.clientHeight);
    setScroll(run ? max : Math.min(max, Math.max(0, (firstAskRef.current?.offsetTop ?? 0) - 8)));
  }, [items, run, tone]);

  return (
    <div className={s.root}>
      <div className={s.app}>
        <div className={s.head}>
          <div className={s.brand}>Aether</div>
          <div className={s.tagline}>Your AI-powered News &amp; Tech Companion</div>
        </div>

        <div ref={viewRef} className={s.view}>
          <div
            ref={listRef}
            className={s.list}
            style={{
              transform: `translateY(${-scroll}px)`,
              opacity: fading ? 0 : 1,
              transition: snap ? "opacity .45s ease" : "transform .7s cubic-bezier(.25,1,.5,1), opacity .45s ease",
            }}
          >
            {items.map((k) => (
              <div key={k} ref={k === "user" ? firstAskRef : undefined} className={s.slot}>
                <Item k={k} on={run} tone={tone} />
              </div>
            ))}
          </div>
        </div>

        <div className={s.foot}>
          <div className={s.input}>
            <div className={s.field}>
              <span className={draft ? s.typed : s.placeholder}>{draft || "Ask about any topic..."}</span>
              {run && draft && <span className={s.caret} />}
            </div>
            <span className={s.btn}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={s.mic}
              >
                <path d="M12 1v10M19 10a7 7 0 0 1-14 0M12 19v4M8 23h8" />
                <rect x="9" y="1" width="6" height="12" rx="3" />
              </svg>
            </span>
            <span
              className={s.btn}
              style={{ transform: pressed ? "scale(0.88)" : "none", transition: "transform .16s ease" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className={s.send}>
                {busy ? (
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="#ff8a8a" />
                ) : (
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                )}
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
