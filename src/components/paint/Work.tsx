"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FEATURED, PROJECTS, type Project } from "@/lib/content";
import { ProjectMedia } from "@/components/media/project-media";

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
      {narrow && near && <ProjectMedia media={p.media} active={on} />}
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
        <div className="stage">
          <div className="scene">
            <div className="cam" id="roomCam">
              <canvas id="room" role="img" aria-label="A dark hall, the AuctionXI live board on the projector screen and Mohit watching it from the front row." />
              <div className="screen" id="screen">
                {seen.near && <ProjectMedia media={FEATURED.media} active={seen.on} />}
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
                <b>{FEATURED.name}</b>
                {FEATURED.kind}
              </p>
              <h3>{FEATURED.head}</h3>
              <p className="one">{FEATURED.line}</p>
              <ul className="facts">
                {FEATURED.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="tech">{FEATURED.tech}</p>
              <div className="links">
                {FEATURED.links.map(([t, u]) => (
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
        <div className="index" ref={index}>
          <div>
            <h4>And seven more</h4>
            <ul className="rows">
              {PROJECTS.map((p, i) => (
                <li
                  key={p.name}
                  className="row"
                  tabIndex={0}
                  data-on={on === i ? "" : undefined}
                  onMouseEnter={() => setOn(i)}
                  onFocus={() => setOn(i)}
                >
                  <span className="name">{p.name}</span>
                  <span className="kind">{p.kind}</span>
                  <p className="head">{p.head}</p>
                  <div className="sub">
                    <div>
                      <p>{p.line}</p>
                      <div className="links">
                        {p.links.length ? (
                          p.links.map(([t, u]) => (
                            <a key={u} className="tlink" href={u}>
                              {t}
                            </a>
                          ))
                        ) : (
                          <span className="private">Private client project</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <RowMedia p={p} />
                </li>
              ))}
            </ul>
          </div>
          <div className="view">
            <div className="shot" key={on}>
              {indexSeen.near && <ProjectMedia media={PROJECTS[on].media} active={indexSeen.on} />}
            </div>
            <p className="cap">{PROJECTS[on].head}</p>
          </div>
        </div>
      </section>
    </>
  );
}
