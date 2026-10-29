"use client";

import { useEffect } from "react";
import { PERSON, about, hero, necklace, offTheClock, stations, mailto } from "@/lib/content";
import { OffTheClock } from "@/components/line/off-the-clock";
import { Belief } from "@/components/line/belief";
import { Work } from "./Work";
import { Clock } from "./Clock";
import { mount } from "./scenes";
import "./walk.css";

const write = mailto("Hello Mohit");

// One walk through his Mumbai: down from the air to the parapet, the work, the Western line through
// every job, Wankhede under its lights, and back up over the city to say hello.
export function Walk() {
  useEffect(() => mount(), []);

  return (
    <>
      <section className="open" id="top">
        <div className="stage">
          <canvas id="bay" role="img" aria-label="The Mumbai skyline across the bay from Marine Drive, with Mohit sitting on the parapet looking out." />
          <canvas id="city" role="img" aria-label="South Mumbai from the air: towers down to the bay, two of them crowned with domes, and Marine Drive along the water." />
          <div className="lede" />
          <div className="copy" id="landCopy">
            <h1>{hero.name}</h1>
            <p className="line">
              {hero.role}. {hero.line}
            </p>
            <a className="cta" href={write}>
              Write to me <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="about" id="about">
            <h2 data-in="">{about.title}</h2>
            <ul data-in="">
              {about.shipped.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <p className="aside" id="aside" data-in="">
            <span>{about.aside[0]}</span> <span>{about.aside[1]}</span>
          </p>
        </div>
      </section>

      <main>
        <Work />

        <section className="path" id="experience" style={{ "--stops": stations.length } as React.CSSProperties}>
          <div className="stage">
            <canvas id="line" role="img" aria-label="A Western line local travelling down the line, stopping at a station for each chapter of his story." />
            <div className="col">
              <h2 id="pathTitle">Every detour was part of the path</h2>
              <div className="journey" id="journey">
                {stations.map((st) => (
                  <article className="role" key={st.code} data-name={st.name} data-deva={st.deva}>
                    <p className="when">{st.when}</p>
                    <h3>{st.title}</h3>
                    <p className="body">{st.body}</p>
                    {st.points && (
                      <ul>
                        {st.points.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <OffTheClock />

        <section className="ground" id="ground">
          <div className="stage">
            <canvas id="wankhede" role="img" aria-label="Wankhede Stadium as the floodlights come on, the stands in Mumbai Indians blue and one empty seat lit." />
            <div className="copy">
              <h2>{offTheClock.scenes.wankhede.title}</h2>
              <p className="seat" id="seat">
                {offTheClock.scenes.wankhede.body}
              </p>
            </div>
          </div>
        </section>

        <Belief />
      </main>

      <footer className="foot" id="contact">
        <canvas id="footCity" aria-hidden="true" />
        <div className="lede" />
        <div className="copy">
          <h2>{necklace.title}</h2>
          <p className="line">{necklace.body}</p>
          <div className="act">
            <a className="cta" href={write}>
              Write to me <span aria-hidden="true">→</span>
            </a>
            <a className="mail" href={`mailto:${PERSON.email}`}>
              {PERSON.email}
            </a>
          </div>
        </div>
        <div className="bar">
          <Clock />
          <nav aria-label="Elsewhere">
            <a className="tlink" href={PERSON.github}>GitHub</a>
            <a className="tlink" href={PERSON.linkedin}>LinkedIn</a>
            <a className="tlink" href={PERSON.leetcode}>LeetCode</a>
            <a className="tlink" href={PERSON.instagram}>Instagram</a>
            <a className="tlink" href={PERSON.resume}>Resume</a>
            <a className="tlink" href={`mailto:${PERSON.email}`}>Email</a>
          </nav>
          <span className="c">© 2026 Mohit Bagri</span>
        </div>
      </footer>
    </>
  );
}
