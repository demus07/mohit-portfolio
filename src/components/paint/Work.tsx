"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { platforms, projects, type Project } from "@/lib/content";
import { ProjectMedia } from "@/components/media/project-media";
import { DepartureBoard } from "@/components/line/platforms/departure-board";
import { platformAnchor } from "@/components/line/platforms/shared";

// AuctionXI takes the hall; the other seven are the rest of the board.
const [FEATURED, ...REST] = projects;
// the headline is the first sentence of his description, the rest stays as the line beneath it
const firstSentence = (t: string) => t.split(/(?<=\.)\s+/)[0];
const afterFirst = (t: string) => t.split(/(?<=\.)\s+/).slice(1).join(" ");
const linksOf = (p: Project): [string, string][] => [
  ...(p.live ? ([["Live", p.live]] as [string, string][]) : []),
  ...(p.github ? ([["Source", p.github]] as [string, string][]) : []),
];

// Plays while it is on screen, and only loads once it is close.
function useSeen<T extends Element>(margin = "0px") {
  const ref = useRef<T>(null);
  const [state, setState] = useState({ near: false, on: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setState((s) => (s.near ? s : { ...s, near: true })), { rootMargin: "600px 0px" });
    const on = new IntersectionObserver(([e]) => setState((s) => ({ near: s.near || e.isIntersecting, on: e.isIntersecting })), { rootMargin: margin });
    near.observe(el);
    on.observe(el);
    return () => {
      near.disconnect();
      on.disconnect();
    };
  }, [margin]);
  return [ref, state] as const;
}

const narrowQuery = "(max-width: 759px)";
const subscribeNarrow = (fn: () => void) => {
  const mq = window.matchMedia(narrowQuery);
  mq.addEventListener("change", fn);
  return () => mq.removeEventListener("change", fn);
};

// On a phone each project carries its own piece, playing as it passes; on a desk the panel does.
function RowMedia({ p }: { p: Project }) {
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches, () => false);
  const [ref, { near, on }] = useSeen<HTMLDivElement>("-20% 0px");
  return (
    <div ref={ref} className="shot thumb">
      {narrow && near && p.media && <ProjectMedia media={p.media} active={on} />}
    </div>
  );
}

// AuctionXI on the projector screen over his shoulder, then the other seven as an index; pointing at
// one plays its piece. Every piece is his original: real footage, a replay of real output, or the
// product itself, recreated in code on his own site.
export function Work() {
  const [on, setOn] = useState(0);

  // fetch his pieces while the page is idle, so the first one to play never stalls the scroll
  useEffect(() => {
    const warm = () => {
      import("@/components/media/illustrations/auctionxi");
      import("@/components/media/illustrations/texagent");
      import("@/components/media/illustrations/aether");
      import("@/components/media/illustrations/flowledger");
      import("@/components/media/illustrations/velotype");
      import("@/components/media/illustrations/windmill");
    };
    // Safari has no idle callback; a short wait after load does the same job there
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 1500);
    return () => clearTimeout(id);
  }, []);
  const [stage, seen] = useSeen<HTMLElement>();


  const [index, indexSeen] = useSeen<HTMLDivElement>();

  return (
    <>
      <section className="auction" id="work" ref={stage}>
        <span id={platformAnchor(0)} className="sr-only" />
        <div className="stage">
          <div className="scene">
            <div className="cam" id="roomCam">
              <canvas id="room" role="img" aria-label="A dark hall, the AuctionXI live board on the projector screen and Mohit watching it from the front row." />
              <div className="screen" id="screen">
                {seen.near && FEATURED.media && <ProjectMedia media={FEATURED.media} active={seen.on} />}
              </div>
            </div>
            <canvas id="roomFront" aria-hidden="true" />
          </div>
          <div className="copy">
            <div className="head" id="workHead">
              <h2>Things I&rsquo;ve built and shipped</h2>
              <p className="line">Products I run, client work, web and mobile apps, AI, VR and command-line tools.</p>
            </div>
            <div className="feat" id="aucCopy">
              <p className="meta">
                <b>{FEATURED.title}</b>
                {FEATURED.type}, {FEATURED.period}
              </p>
              <h3>{firstSentence(FEATURED.description)}</h3>
              <p className="one">{afterFirst(FEATURED.description)}</p>
              <ul className="facts">
                {FEATURED.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="links">
                {linksOf(FEATURED).map(([t, u]) => (
                  <a key={u} className="tlink" href={u}>
                    {t}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="work">
        {/* a departure board row jumps to its platform and picks it in the index */}
        <div
          className="board"
          id="platforms"
          onClick={(e) => {
            const href = (e.target as HTMLElement).closest("a")?.getAttribute("href") ?? "";
            const m = /^#pf-(\d+)$/.exec(href);
            if (m && +m[1] > 1) setOn(+m[1] - 2);
          }}
        >
          {/* the hall above already carries the title, so the board opens on his line about it */}
          <p className="lead">{platforms.intro.split(". ")[0]}.</p>
          <div className="departures">
            <DepartureBoard projects={projects} />
          </div>
        </div>
        <div className="index" ref={index}>
          <ul className="rows">
            {REST.map((p, i) => (
              <li
                key={p.id}
                id={platformAnchor(i + 1)}
                className="row"
                tabIndex={0}
                data-on={on === i ? "" : undefined}
                onMouseEnter={() => setOn(i)}
                onFocus={() => setOn(i)}
              >
                <span className="name">{p.title}</span>
                <span className="kind">
                  {p.type}, {p.period}
                </span>
                <p className="head">{firstSentence(p.description)}</p>
                <div className="sub">
                  <div>
                    {afterFirst(p.description) && <p>{afterFirst(p.description)}</p>}
                    <ul className="facts small">
                      {p.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <div className="links">
                      {linksOf(p).length ? (
                        linksOf(p).map(([t, u]) => (
                          <a key={u} className="tlink" href={u}>
                            {t}
                          </a>
                        ))
                      ) : (
                        <span className="private">{p.note}</span>
                      )}
                    </div>
                    {p.liveNote && <p className="note">{p.liveNote}</p>}
                  </div>
                </div>
                <RowMedia p={p} />
              </li>
            ))}
          </ul>
          <div className="view">
            <div className="shot" key={on}>
              {indexSeen.near && REST[on].media && <ProjectMedia media={REST[on].media!} active={indexSeen.on} />}
            </div>
            <p className="cap">{REST[on].title}</p>
          </div>
        </div>
      </section>
    </>
  );
}
