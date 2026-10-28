"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { useReplay, type Sleep } from "./useReplay";
import s from "./Aether.module.css";

type Source = "news" | "youtube" | "reddit";

type Item =
  | { k: "greet" }
  | { k: "user"; text: string }
  | { k: "dots" }
  | { k: "reply"; text: string; lead?: string }
  | { k: "card"; src: Source; title: string; meta: string }
  | { k: "brief" };

const TONES = ["Neutral", "Witty", "Explain like I'm five", "Professor"];
const MORE_TONES = 14; // 18 tones in all

const ASK = "What's new with small open models?";
const ANSWER =
  "Small open models had a big week. They are closing in on coding benchmarks, and a 7B model now runs comfortably on a laptop. Here is what I found:";
const ASK_2 = "Say that again, but witty";
const ANSWER_2 =
  "Short version: the little models stopped skipping leg day. Same brains, smaller backpack, and your laptop is now the data centre.";

const CARDS: Extract<Item, { k: "card" }>[] = [
  { k: "card", src: "news", title: "Open models close the gap on coding benchmarks", meta: "News Desk • 3h ago" },
  { k: "card", src: "news", title: "Smaller language models get surprisingly capable", meta: "News Desk • 5h ago" },
  {
    k: "card",
    src: "youtube",
    title: "Running a 7B model on a laptop, explained",
    meta: "Dev Explained • 48,210 views • 6h ago",
  },
  {
    k: "card",
    src: "reddit",
    title: "Which open model do you actually use day to day?",
    meta: "r/MachineLearning • 1,284 upvotes • 9h ago",
  },
];

const FINAL: Item[] = [
  { k: "greet" },
  { k: "user", text: ASK },
  { k: "reply", text: ANSWER },
  ...CARDS,
  { k: "brief" },
  { k: "user", text: ASK_2 },
  { k: "reply", lead: "Switched to Witty mode.", text: ANSWER_2 },
];

type Setters = {
  setItems: Dispatch<SetStateAction<Item[]>>;
  setDraft: (v: string) => void;
  setSend: (v: boolean) => void;
  setTone: (v: number) => void;
  setFade: (v: boolean) => void;
};

async function play(sleep: Sleep, { setItems, setDraft, setSend, setTone, setFade }: Setters) {
  const push = (it: Item) => setItems((xs) => [...xs, it]);
  const patch = (it: Item) => setItems((xs) => [...xs.slice(0, -1), it]);

  const ask = async (text: string) => {
    for (let i = 1; i <= text.length; i++) {
      setDraft(text.slice(0, i));
      await sleep(34 + ((i * 29) % 5) * 9);
    }
    await sleep(320);
    setSend(true);
    await sleep(180);
    setSend(false);
    setDraft("");
    push({ k: "user", text });
    await sleep(500);
    push({ k: "dots" });
    await sleep(1100);
  };

  const stream = async (text: string, lead?: string) => {
    const words = text.split(" ");
    patch({ k: "reply", lead, text: "" });
    for (let i = 1; i <= words.length; i++) {
      await sleep(48 + ((i * 17) % 4) * 14);
      patch({ k: "reply", lead, text: words.slice(0, i).join(" ") });
    }
  };

  setItems([{ k: "greet" }]);
  setTone(0);
  await sleep(1000);

  await ask(ASK);
  await stream(ANSWER);
  await sleep(380);
  for (const c of CARDS) {
    push(c);
    await sleep(420);
  }
  await sleep(300);
  push({ k: "brief" });
  await sleep(2000);

  await ask(ASK_2);
  setTone(1);
  await sleep(300);
  await stream(ANSWER_2, "Switched to Witty mode.");
  await sleep(3200);

  setFade(true);
  await sleep(750);
  setItems([]);
  setTone(0);
  await sleep(450);
  setFade(false);
}

function Icon({ src }: { src: Source }) {
  if (src === "youtube")
    return (
      <svg viewBox="0 0 24 24">
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="#ff3b30" />
        <path d="M10 9.2v5.6l4.8-2.8z" fill="#fff" />
      </svg>
    );
  if (src === "reddit")
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12.5" r="8.5" fill="#ff5a1f" />
        <circle cx="9" cy="12" r="1.3" fill="#fff" />
        <circle cx="15" cy="12" r="1.3" fill="#fff" />
        <path d="M8.8 15.2q3.2 2.2 6.4 0" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <circle cx="16.5" cy="5" r="1.4" fill="#ff5a1f" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2.5" fill="#2f8cff" />
      <path d="M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Bubble({ item }: { item: Item }) {
  switch (item.k) {
    case "greet":
      return (
        <div className={s.bot}>
          <strong className={s.name}>AETHER:</strong> Hey, I&apos;m Aether, your news and AI companion. Ask me
          anything.
        </div>
      );
    case "user":
      return <div className={s.user}>{item.text}</div>;
    case "dots":
      return (
        <div className={`${s.bot} ${s.dots}`}>
          <i />
          <i />
          <i />
        </div>
      );
    case "reply":
      return (
        <div className={s.bot}>
          <strong className={s.name}>AETHER:</strong> {item.lead && <em className={s.lead}>{item.lead} </em>}
          {item.text}
        </div>
      );
    case "card":
      return (
        <div className={s.card}>
          <span className={s.icon}>
            <Icon src={item.src} />
          </span>
          <span className={s.cardText}>
            <span className={s.cardTitle}>{item.title}</span>
            <span className={s.cardMeta}>{item.meta}</span>
          </span>
        </div>
      );
    case "brief":
      return (
        <div className={s.brief}>
          <span className={s.briefHead}>Aether&apos;s Briefing</span>
          <span>Capability is spreading outward; what we build with it is still up to us.</span>
        </div>
      );
  }
}

export function AetherMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [items, setItems] = useState<Item[]>([{ k: "greet" }]);
  const [draft, setDraft] = useState("");
  const [send, setSend] = useState(false);
  const [tone, setTone] = useState(0);
  const [fade, setFade] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useReplay(active, !reduced, (sleep) => play(sleep, { setItems, setDraft, setSend, setTone, setFade }));

  // The feed glides up to keep its newest message in view.
  useEffect(() => {
    const f = feed.current;
    const l = list.current;
    if (!f || !l) return;
    const fit = () => {
      const off = Math.max(0, l.offsetHeight - f.clientHeight);
      l.style.transform = `translate3d(0, ${-off}px, 0)`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(f);
    ro.observe(l);
    return () => ro.disconnect();
  }, []);

  const shown = reduced ? FINAL : items;
  const activeTone = reduced ? 1 : tone;

  return (
    <div
      className={`${s.root} ${reduced ? s.still : ""} ${active ? "" : s.paused}`}
      role="img"
      aria-label="Aether, an AI news assistant, answering a question about small open models with news, YouTube and Reddit sources"
    >
      <div className={s.app} aria-hidden="true">
        <header className={s.head}>
          <div className={s.brand}>Aether</div>
          <div className={s.sub}>Your AI-powered News &amp; Tech Companion</div>
        </header>

        <div ref={feed} className={s.feed}>
          <div ref={list} className={s.list} style={{ opacity: fade ? 0 : 1 }}>
            {shown.map((it, i) => (
              <Bubble key={i} item={it} />
            ))}
          </div>
        </div>

        <div className={s.tones}>
          <span className={s.toneLabel}>Tone</span>
          {TONES.map((t, i) => (
            <span key={t} className={`${s.chip} ${i === activeTone ? s.chipOn : ""}`}>
              {t}
            </span>
          ))}
          <span className={`${s.chip} ${s.chipMore}`}>+{MORE_TONES} more</span>
        </div>

        <div className={s.input}>
          <span className={s.mic}>
            <svg viewBox="0 0 24 24">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
            </svg>
          </span>
          <span className={s.field}>
            {draft ? (
              <>
                {draft}
                <span className={s.caret} />
              </>
            ) : (
              <span className={s.placeholder}>Ask about any topic...</span>
            )}
          </span>
          <span className={`${s.send} ${send ? s.sendOn : ""}`}>
            <svg viewBox="0 0 24 24">
              <path d="M3 20.5 21.5 12 3 3.5V10l12 2-12 2z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
