"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

/**
 * Steps through a fixed list of frame durations (ms), looping, while `active`.
 * Pausing keeps the current frame; resuming continues from it.
 * With reduced motion the loop never runs and `stillFrame` is returned instead.
 * `durations` must be a stable (module-level) array.
 */
export function useTimeline(durations: readonly number[], active: boolean, stillFrame: number) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const run = active && !reduced;

  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % durations.length),
      durations[step] ?? 1000,
    );
    return () => window.clearTimeout(id);
  }, [run, step, durations]);

  return { step: reduced ? stillFrame : step, reduced };
}
