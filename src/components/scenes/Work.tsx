"use client";

import { WORK, type Media, type Project } from "@/lib/content";
import { useOnScreen } from "@/lib/hooks";
import { AuctionXIMedia } from "@/components/media/AuctionXI";
import { TexAgentMedia } from "@/components/media/TexAgent";
import { TerminalMedia } from "@/components/media/Terminal";
import { AetherMedia } from "@/components/media/Aether";
import { FlowLedgerMedia } from "@/components/media/FlowLedger";
import { VideoMedia } from "@/components/media/VideoMedia";
import { VeloTypeMedia } from "@/components/media/VeloType";
import { WindmillMedia } from "@/components/media/Windmill";
import s from "./Work.module.css";

/*
 * The work, in the shade across the road: warm paper and the real thing. Each project is its words
 * on the left and the work itself on the right, playing only while it is on screen.
 */

function ProjectMedia({ media, active }: { media: Media; active: boolean }) {
  switch (media.kind) {
    case "auctionxi":
      return <AuctionXIMedia active={active} />;
    case "texagent":
      return <TexAgentMedia active={active} />;
    case "terminal":
      return <TerminalMedia active={active} />;
    case "aether":
      return <AetherMedia active={active} />;
    case "flowledger":
      return <FlowLedgerMedia active={active} />;
    case "video":
      return <VideoMedia src={media.src} poster={media.poster} alt={media.alt} active={active} />;
    case "velotype":
      return <VeloTypeMedia active={active} />;
    case "windmill":
      return <WindmillMedia active={active} />;
  }
}

function ProjectRow({ p }: { p: Project }) {
  const [ref, on] = useOnScreen<HTMLElement>("-15% 0px");
  const links = [
    p.live && { label: "Live", href: p.live },
    p.pypi && { label: "PyPI", href: p.pypi },
    p.github && { label: "Source", href: p.github },
    p.video && { label: "Demo video", href: p.video },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <article ref={ref} id={p.slug} className={s.project} aria-labelledby={`${p.slug}-name`}>
      <div className={s.text} data-reveal>
        <h3 id={`${p.slug}-name`} className={s.name}>
          {p.title}
        </h3>
        <p className={s.kind}>
          {p.kind}, {p.year}
        </p>
        <p className={s.headline}>{p.headline}</p>
        <p className="line">{p.line}</p>
        <ul className={s.facts}>
          {p.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className={s.tech}>{p.tech.join(", ")}</p>
        {links.length > 0 && (
          <p className={s.links}>
            {links.map((l) => (
              <a key={l.label} className="tlink" href={l.href} target="_blank" rel="noreferrer">
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </p>
        )}
        {p.liveNote && <p className={s.note}>{p.liveNote}</p>}
        {p.note && <p className={s.note}>{p.note}</p>}
      </div>
      <figure className={s.media} data-reveal style={{ "--d": 1 } as React.CSSProperties}>
        <ProjectMedia media={p.media} active={on} />
      </figure>
    </article>
  );
}

export function Work() {
  return (
    <section id="work" className={s.work} aria-labelledby="work-title">
      <header className={s.head}>
        <h2 id="work-title" className="h-voice" data-reveal>
          {WORK.title}
        </h2>
        <p className="line" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
          {WORK.line}
        </p>
      </header>
      {WORK.projects.map((p) => (
        <ProjectRow key={p.slug} p={p} />
      ))}
    </section>
  );
}
