"use client";

import { useEffect, useState } from "react";
import { PERSON, mailto } from "@/lib/content";
import s from "./Nav.module.css";

// The name, three places and the one action. Clear over the opening; once past it, it sits on
// paper, tucks away while you read down and comes back the moment you scroll up.
export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState<boolean | null>(null);

  // the theme: whatever the system says until someone picks, then what they picked
  useEffect(() => {
    const html = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const read = () => setDark(html.dataset.theme ? html.dataset.theme === "dark" : mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  const flip = () => {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const opening = document.getElementById("top");
      setSolid(y > (opening ? opening.offsetHeight - 80 : window.innerHeight));
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > window.innerHeight * 0.5);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`${s.nav}${hidden ? ` ${s.hidden}` : ""}${solid ? ` ${s.solid}` : ""}`} aria-label="Main">
      <a href="#top" className={s.mark}>
        Mohit Bagri
      </a>
      <div className={s.links}>
        <a href="#about">About</a>
        <a href="#work">Work</a>
        <a href="#experience">Experience</a>
        <a href={PERSON.resume} target="_blank" rel="noreferrer">
          Resume
        </a>
        <button type="button" className={s.theme} onClick={flip} aria-pressed={dark ?? false} aria-label="Night mode">
          {dark ? "Day" : "Night"}
        </button>
        <a className={s.cta} href={mailto("Hello Mohit")}>
          Write to me <span aria-hidden="true">→</span>
        </a>
      </div>
    </nav>
  );
}
