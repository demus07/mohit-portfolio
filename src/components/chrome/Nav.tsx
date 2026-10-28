"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { PERSON, mailto } from "@/lib/content";
import s from "./Nav.module.css";

type Theme = "day" | "night";

// The light lives on <html data-theme>; the painted scenes listen for "themechange" and repaint.
function setLight(next: Theme, save = true) {
  document.documentElement.dataset.theme = next;
  if (save) {
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }
  window.dispatchEvent(new Event("themechange"));
}
const subscribe = (fn: () => void) => {
  window.addEventListener("themechange", fn);
  return () => window.removeEventListener("themechange", fn);
};
const light = (): Theme => (document.documentElement.dataset.theme === "night" ? "night" : "day");

// The landing already carries his name and the one action, so the bar stays out of it; past the
// landing it comes back whenever you scroll up. The switch between morning and night is always there.
export function Nav() {
  const [shown, setShown] = useState(false);
  const theme = useSyncExternalStore(subscribe, light, () => null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const landing = document.getElementById("top");
      const past = y > (landing ? landing.offsetHeight - window.innerHeight * 0.5 : window.innerHeight);
      if (!past) setShown(false);
      else if (Math.abs(y - last) > 6) setShown(y < last);
      if (Math.abs(y - last) > 6 || !past) last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // a saved choice wins; until someone picks, the light follows the system's
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => {
      try {
        if (localStorage.getItem("theme")) return;
      } catch {}
      setLight(mq.matches ? "night" : "day", false);
    };
    mq.addEventListener("change", follow);
    return () => mq.removeEventListener("change", follow);
  }, []);

  return (
    <>
      <nav className={`${s.nav}${shown ? ` ${s.shown}` : ""}`} aria-label="Main">
        <a href="#top" className={s.mark}>
          Mohit Bagri
        </a>
        <div className={s.links}>
          <a className="tlink" href="#work">
            Work
          </a>
          <a className="tlink" href="#experience">
            The path
          </a>
          <a className="tlink" href={PERSON.resume} target="_blank" rel="noreferrer">
            Resume
          </a>
          <a className={s.write} href={mailto("Hello Mohit")}>
            Write to me <span aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
      <button
        type="button"
        className={s.mode}
        onClick={() => setLight(theme === "night" ? "day" : "night")}
        aria-label={theme === "night" ? "Switch to morning" : "Switch to night"}
      >
        {theme === "night" ? "Day" : "Night"}
      </button>
    </>
  );
}
