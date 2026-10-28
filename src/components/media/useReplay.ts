"use client";

import { useEffect, useRef } from "react";

export type Sleep = (ms: number) => Promise<void>;

type Pending = { id: number | null; left: number; since: number; fire: () => void };

/**
 * Plays an async script on repeat. Its `sleep` only ticks while `active` is true, so going
 * off screen freezes the replay mid-step and coming back carries on from the same frame.
 * Nothing runs when `enabled` is false (reduced motion): the caller shows a static frame instead.
 */
export function useReplay(active: boolean, enabled: boolean, script: (sleep: Sleep) => Promise<void>) {
  const activeRef = useRef(active);
  const pending = useRef<Pending | null>(null);
  const scriptRef = useRef(script);

  useEffect(() => {
    scriptRef.current = script;
  });

  // Pause and resume whatever sleep is in flight.
  useEffect(() => {
    activeRef.current = active;
    const p = pending.current;
    if (!p) return;
    if (active && p.id === null) {
      p.since = performance.now();
      p.id = window.setTimeout(p.fire, p.left);
    } else if (!active && p.id !== null) {
      window.clearTimeout(p.id);
      p.id = null;
      p.left = Math.max(0, p.left - (performance.now() - p.since));
    }
  }, [active]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const sleep: Sleep = (ms) =>
      new Promise<void>((resolve) => {
        if (cancelled) return;
        const p: Pending = {
          id: null,
          left: ms,
          since: 0,
          fire: () => {
            if (pending.current === p) pending.current = null;
            if (!cancelled) resolve();
          },
        };
        pending.current = p;
        if (activeRef.current) {
          p.since = performance.now();
          p.id = window.setTimeout(p.fire, ms);
        }
      });

    (async () => {
      while (!cancelled) await scriptRef.current(sleep);
    })().catch(() => {});

    return () => {
      cancelled = true;
      const p = pending.current;
      if (p?.id != null) window.clearTimeout(p.id);
      pending.current = null;
    };
  }, [enabled]);
}
