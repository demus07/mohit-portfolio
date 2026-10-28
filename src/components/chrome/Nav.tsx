"use client";

import { useEffect, useState } from "react";
import { PERSON, mailto } from "@/lib/content";
import s from "./Nav.module.css";

// The name, three places and the one action. Clear over the opening; once past it, it sits on
// paper, tucks away while you read down and comes back the moment you scroll up.
export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

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
        <a href="#work">Work</a>
        <a href="#experience">Experience</a>
        <a href={PERSON.resume} target="_blank" rel="noreferrer">
          Resume
        </a>
        <a className={s.cta} href={mailto("Hello Mohit")}>
          Write to me <span aria-hidden="true">→</span>
        </a>
      </div>
    </nav>
  );
}
