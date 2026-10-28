"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { IllustrationTag } from "./tag";

/* Aether chat, recreated from Mohit-Bagri/aether-news-trends (index.html, style.css, script.js):
   same palette, section order (News, YouTube, Reddit, Aether's Briefing) and in-chat tone switch.
   Headlines are generic placeholders. */

const QUERY = "what's new in open-source AI?";
const TONE_Q = "explain like professor";
const TONE_REPLY = "Switched to Professor mode. Let's continue!";
const YT = "M19.615 3.184A3.006 3.006 0 0 1 22 6.077v11.846a3.006 3.006 0 0 1-2.385 2.893C17.155 21.5 12 21.5 12 21.5s-5.155 0-7.615-.684A3.006 3.006 0 0 1 2 17.923V6.077A3.006 3.006 0 0 1 4.385 3.184C6.845 2.5 12 2.5 12 2.5s5.155 0 7.615.684z";
const ICONS = {
  news: ["#0094ff", "M4 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h5v2H8v-2z"],
  youtube: ["#ff0000", YT + "M10 8.5v7l6-3.5-6-3.5z"],
  reddit: ["#ff4500", "M14.5 15.5c0 .827-1.12 1.5-2.5 1.5s-2.5-.673-2.5-1.5H8c0 1.379 1.79 2.5 4 2.5s4-1.121 4-2.5h-1.5zm-5-1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z"],
} as const;

type Src = keyof typeof ICONS;
type Kind = "greet" | "user" | "dots" | Src | "brief" | "user2" | "dots2" | "tone";
const RESULT: Kind[] = ["greet", "user", "news", "youtube", "reddit", "brief"];
const CARDS: Record<Src, [title: string, meta: string][]> = {
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
const bot = "self-start rounded-[1.4em] rounded-tl-[0.35em] border border-white/[0.06] bg-white/[0.05]";
const btn = "flex h-[2.3em] w-[2.3em] items-center justify-center rounded-[0.7em] border border-white/10 bg-white/[0.04] text-[#cbb9ff]";

/** Enters like the app's `.bot-msg.show` / `.result-card.show`: translate + fade. */
function Reveal({ on, delay = 0, className = "", style, children }: { on: boolean; delay?: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  const [shown, setShown] = useState(!on);
  useEffect(() => {
    if (!on) return;
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(() => setShown(true)))); // 2 frames: commit hidden first
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
    <Reveal on={on} className={`${bot} max-w-[84%] px-[1.1em] py-[0.7em] leading-[1.4]`}>
      <strong className="font-semibold tracking-[0.3px] text-[#7db9ff]" style={{ textShadow: "0 0 6px rgba(125,176,255,.45)" }}>
        AETHER:
      </strong>{" "}
      {children}
    </Reveal>
  );
}

function User({ on, text }: { on: boolean; text: string }) {
  return (
    <Reveal on={on} className="max-w-[75%] self-end rounded-[1.4em] rounded-tr-[0.35em] bg-gradient-to-b from-[#7d4cff] to-[#6a3dff] px-[1.1em] py-[0.65em] text-white">
      {text}
    </Reveal>
  );
}

function Section({ src, on }: { src: Src; on: boolean }) {
  const [color, d] = ICONS[src];
  return (
    <Reveal on={on} className={`${bot} w-[86%] p-[0.85em]`}>
      <div className="mb-[0.6em] flex items-center gap-[0.35em]">
        <svg viewBox="0 0 24 24" fill={color} className="h-[1.25em] w-[1.25em]">
          <path d={d} />
        </svg>
        <strong className="font-semibold uppercase tracking-[0.4px] text-[#ddd9ff]">{src === "youtube" ? "YouTube" : src}</strong>
      </div>
      {CARDS[src].map(([title, meta], i) => (
        <Reveal key={title} on={on} delay={160 + i * 140} className="mt-[0.5em] flex items-center gap-[0.8em] rounded-[1em] border border-white/[0.05] bg-white/[0.03] px-[0.9em] py-[0.6em]">
          {src === "youtube" && (
            // stand-in thumbnail: the app loads img.youtube.com, this stays offline
            <div className="flex aspect-[110/68] w-[7em] shrink-0 items-center justify-center rounded-[0.6em] bg-gradient-to-br from-[#2a1b4d] via-[#14213d] to-[#0b1a2a]">
              <svg viewBox="0 0 24 24" className="h-[1.9em] w-[1.9em]">
                <path d={YT} fill="#ff0000" />
                <path d="M10 8.5v7l6-3.5-6-3.5z" fill="#fff" />
              </svg>
            </div>
          )}
          <div className="leading-[1.3]">
            {title}
            <div className="mt-[0.2em] text-[0.9em] text-white/60">{meta}</div>
          </div>
        </Reveal>
      ))}
      <div className="mx-auto mt-[0.7em] w-fit rounded-[0.8em] border border-[#7d4cff]/20 bg-[#7d4cff]/[0.08] px-[1em] py-[0.3em] text-[0.9em] text-[#d5cfff]">
        + Show more {src}
      </div>
    </Reveal>
  );
}

function Briefing({ on }: { on: boolean }) {
  return (
    <Reveal
      on={on}
      className="w-[90%] rounded-[1.4em] border border-[rgba(150,120,255,0.15)] border-l-[3px] border-l-[#a680ff] bg-[rgba(130,80,255,0.08)] px-[1.3em] py-[0.9em] leading-[1.45] text-[#f0eaff]"
    >
      <div className="mb-[0.5em] flex items-center justify-between">
        <span className="w-[4.5em]" />
        <strong className="font-semibold">Aether&rsquo;s Briefing</strong>
        <span className="rounded-[0.8em] border border-[rgba(180,160,255,0.3)] bg-[rgba(150,120,255,0.1)] px-[0.7em] py-[0.15em] text-[0.9em] text-[#d5c8ff]">▲ Hide</span>
      </div>
      <ul className="list-disc pl-[1.3em]">
        {BRIEF.map((b, i) => (
          <Reveal key={b} on={on} delay={200 + i * 180} className="list-item">
            {b}
          </Reveal>
        ))}
      </ul>
      <Reveal on={on} delay={860} className="mt-[0.4em] text-[0.92em] italic text-[#bfa8ff]">
        Capability is spreading outward; what we build with it is still up to us.
      </Reveal>
    </Reveal>
  );
}

function Dots() {
  return (
    <div className={`${bot} flex gap-[0.35em] px-[1.1em] py-[0.8em]`}>
      {[0, 0.2, 0.4].map((d) => (
        <span key={d} className="h-[0.55em] w-[0.55em] rounded-full bg-[#b9cfff]" style={{ animation: `aetherDot 1.2s ease-in-out ${d}s infinite` }} />
      ))}
    </div>
  );
}

function Item({ k, on, tone }: { k: Kind; on: boolean; tone: string }) {
  if (k === "greet") return <Bot on={false}>Hey, I&apos;m Aether - your smart news and AI companion! Ask me anything.</Bot>;
  if (k === "user" || k === "user2") return <User on={on} text={k === "user" ? QUERY : TONE_Q} />;
  if (k === "dots" || k === "dots2") return <Dots />;
  if (k === "brief") return <Briefing on={on} />;
  if (k === "tone") return <Bot on={on}>{tone}</Bot>;
  return <Section src={k} on={on} />;
}

export function AetherIllustration({ active }: { active: boolean }) {
  const [items, setItems] = useState<Kind[]>(active ? ["greet"] : RESULT);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false); // send button shows the stop square while generating
  const [press, setPress] = useState(false);
  const [tone, setTone] = useState("");
  const [fade, setFade] = useState(false);
  const [instant, setInstant] = useState(true);
  const [offset, setOffset] = useState(0);
  const vp = useRef<HTMLDivElement>(null);
  const ct = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      setItems(RESULT);
      setTyped("");
      setBusy(false);
      setPress(false);
      setFade(false);
      setInstant(true);
      return;
    }
    let dead = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (ms: number) =>
      new Promise<void>((r, j) => {
        const t = setTimeout(() => (timers.delete(t), dead ? j() : r()), ms);
        timers.add(t);
      });
    const add = (k: Kind) => setItems((l) => [...l, k]);
    const swap = (a: Kind, b: Kind) => setItems((l) => [...l.filter((x) => x !== a), b]);
    const type = async (text: string) => {
      for (let i = 1; i <= text.length; i++) {
        setTyped(text.slice(0, i));
        await wait(34 + ((i * 37) % 5) * 8);
      }
      await wait(260);
      setPress(true);
      await wait(160);
      setPress(false);
      setTyped("");
      setBusy(true);
    };
    const ask = async (text: string, user: Kind, dots: Kind) => {
      await type(text);
      add(user);
      await wait(350);
      add(dots);
    };

    (async () => {
      for (;;) {
        setInstant(true);
        setItems(["greet"]);
        setTone("");
        setBusy(false);
        setFade(false);
        await wait(80);
        setInstant(false);
        await wait(600);
        await ask(QUERY, "user", "dots");
        await wait(1000);
        swap("dots", "news");
        await wait(1300);
        add("youtube");
        await wait(1200);
        add("reddit");
        await wait(1100);
        add("brief");
        await wait(1200);
        setBusy(false);
        await wait(900);
        await ask(TONE_Q, "user2", "dots2");
        await wait(800);
        swap("dots2", "tone");
        await wait(150);
        for (let i = 1; i <= TONE_REPLY.length; i++) {
          setTone(TONE_REPLY.slice(0, i));
          await wait(22);
        }
        setBusy(false);
        await wait(1800);
        setFade(true);
        await wait(500);
      }
    })().catch(() => {}); // rejected wait() = torn down

    return () => {
      dead = true;
      timers.forEach(clearTimeout);
    };
  }, [active]);

  // Follow the newest message (transform only); the static frame opens on the question.
  useLayoutEffect(() => {
    if (!vp.current || !ct.current) return;
    const max = Math.max(0, ct.current.offsetHeight - vp.current.clientHeight);
    setOffset(active ? max : Math.min(max, Math.max(0, (anchor.current?.offsetTop ?? 0) - 8)));
  }, [items, active, tone]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#1b002b,#080010_70%)] [container-type:size]">
      <style>{`@keyframes aetherDot{0%,100%{opacity:.45;transform:scale(.8)}50%{opacity:1;transform:scale(1.25)}}`}</style>
      <IllustrationTag />
      <div
        className="absolute inset-0 flex flex-col bg-[rgba(25,10,40,0.55)] text-[#f3f1ff]"
        style={{ fontFamily: 'Inter, "Helvetica Neue", system-ui, sans-serif', fontSize: "clamp(9.5px, 2.5cqw, 11px)" }}
      >
        <div className="border-b border-white/5 py-[0.6em] text-center leading-[1.2]">
          <div className="text-[1.5em] font-bold">Aether</div>
          <div className="text-[0.9em] text-white/70 @max-[400px]:hidden">Your AI-powered News &amp; Tech Companion</div>
        </div>

        <div ref={vp} className="relative flex-1 overflow-hidden">
          <div
            ref={ct}
            className="absolute inset-x-0 top-0 flex flex-col gap-[0.9em] px-[1.3em] py-[1em]"
            style={{
              transform: `translateY(${-offset}px)`,
              opacity: fade ? 0 : 1,
              transition: instant ? "opacity .45s ease" : "transform .7s cubic-bezier(.25,1,.5,1), opacity .45s ease",
            }}
          >
            {items.map((k) => (
              <div key={k} ref={k === "user" ? anchor : undefined} className="flex flex-col">
                <Item k={k} on={active} tone={tone} />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.03] bg-black/40 px-[1em] py-[0.6em]">
          <div className="flex items-center gap-[0.45em] rounded-[0.9em] border border-white/10 bg-[rgba(30,10,50,0.7)] py-[0.35em] pl-[0.9em] pr-[0.4em]">
            <div className="flex-1 truncate">
              <span className={typed ? "text-white" : "text-white/45"}>{typed || "Ask about any topic..."}</span>
              {active && typed && <span className="ml-px inline-block h-[1.05em] w-px translate-y-[0.18em] bg-white/80" />}
            </div>
            <span className={btn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-[55%] w-[55%]">
                <path d="M12 1v10M19 10a7 7 0 0 1-14 0M12 19v4M8 23h8" />
                <rect x="9" y="1" width="6" height="12" rx="3" />
              </svg>
            </span>
            <span className={btn} style={{ transform: press ? "scale(0.88)" : "none", transition: "transform .16s ease" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-[52%] w-[52%]">
                {busy ? <rect x="6" y="6" width="12" height="12" rx="2" fill="#ff8a8a" /> : <path d="M2 21l21-9L2 3v7l15 2-15 2z" />}
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
