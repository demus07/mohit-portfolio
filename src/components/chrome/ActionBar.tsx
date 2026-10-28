"use client";

import { useEffect, useState } from "react";
import { mailto } from "@/lib/content";
import s from "./ActionBar.module.css";

// Phones only: the one action stays in reach, and steps aside once the footer is on screen.
export function ActionBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const end = document.getElementById("contact");
    let past = false;
    let atEnd = false;
    const update = () => setShow(past && !atEnd);
    const onScroll = () => {
      // only once the opening has let go of the screen
      const opening = document.getElementById("top");
      past = window.scrollY > (opening ? opening.offsetHeight - window.innerHeight * 0.4 : window.innerHeight);
      update();
    };
    const io = new IntersectionObserver(([e]) => {
      atEnd = e.isIntersecting;
      update();
    });
    if (end) io.observe(end);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={`${s.bar}${show ? ` ${s.shown}` : ""}`} aria-hidden={!show}>
      <span>Mohit Bagri</span>
      <a href={mailto("Hello Mohit")} tabIndex={show ? 0 : -1}>
        Write to me <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
