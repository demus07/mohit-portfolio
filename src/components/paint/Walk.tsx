"use client";

import { useEffect } from "react";
import { PERSON, ROLES, mailto } from "@/lib/content";
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
            <h1>Mohit Bagri</h1>
            <p className="line">Software engineer at Sypha AI and founder of AuctionXI. I build things and learn how they work.</p>
            <a className="cta" href={write}>
              Write to me <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="about" id="about">
            <h2 data-in="">One year in, here&rsquo;s what I shipped</h2>
            <ul data-in="">
              <li>An LLM gateway that replaced OpenRouter.</li>
              <li>A terminal tool 500+ developers open daily.</li>
              <li>A live auction SaaS I built alone.</li>
            </ul>
          </div>
          <p className="aside" id="aside" data-in="">
            <span>9.45 CGPA taught me less than shipping did.</span> <span>Still early. Still building.</span>
          </p>
        </div>
      </section>

      <main>
        <Work />

        <section className="path" id="experience" style={{ "--stops": ROLES.length } as React.CSSProperties}>
          <div className="stage">
            <canvas id="line" role="img" aria-label="A Western line local travelling down the line, stopping at a station for each job." />
            <div className="col">
              <h2>Every detour was part of the path</h2>
              <div className="journey" id="journey">
                {ROLES.map((r) => (
                  <div className="role" key={r.co}>
                    <div className="co">{r.co}</div>
                    <div className="ti">{r.ti}</div>
                    <div className="when">{r.when}</div>
                    {r.did && (
                      <ul>
                        {r.did.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="ground" id="ground">
          <div className="stage">
            <canvas id="wankhede" role="img" aria-label="Wankhede Stadium as the floodlights come on, the stands in Mumbai Indians blue and one empty seat lit." />
            <div className="copy">
              <h2>Love watching cricket, bad at playing it.</h2>
              <p className="seat" id="seat">
                Mumbai Indians fan. Wankhede is the dream seat.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot" id="contact">
        <canvas id="footCity" aria-hidden="true" />
        <div className="lede" />
        <div className="copy">
          <h2>Got something to build?</h2>
          <p className="line">I&rsquo;m open to full-time roles, freelance work and the occasional wild idea.</p>
          <div className="act">
            <a className="cta" href={write}>
              Write to me <span aria-hidden="true">→</span>
            </a>
            <a className="mail" href={`mailto:${PERSON.email}`}>
              {PERSON.email}
            </a>
          </div>
          <blockquote>If you believe you can make it, you will. The rest is trusting God and doing the work.</blockquote>
          <p className="reset">Siddhivinayak, where I go when I feel low or high. It&rsquo;s where I reset.</p>
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
