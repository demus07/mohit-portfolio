import { cn } from "@/lib/utils";

/*
 * Shared pieces for the Mumbai Local design (docs/mumbai-local.md).
 * Kept server-safe (no hooks) so any section can use them.
 */

/** Indian railway station board: yellow, black type, English over Marathi. */
export function StationSign({
  en,
  deva,
  sub,
  lit = true,
  className,
}: {
  en: string;
  deva?: string;
  sub?: string;
  /** unlit boards sit in shadow until the train reaches them */
  lit?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center rounded-[3px] border-[3px] border-ink px-4 py-1.5 text-center transition-opacity duration-700",
        "bg-signboard text-ink shadow-[0_0_0_2px_var(--color-signboard),0_10px_30px_-10px_rgb(243_198_35/0.45)]",
        lit ? "opacity-100" : "opacity-35",
        className,
      )}
    >
      {deva && <span className="font-deva text-[0.8em] font-bold leading-tight">{deva}</span>}
      <span className="font-display text-[1em] font-extrabold uppercase leading-tight tracking-[0.02em]">{en}</span>
      {sub && <span className="font-mono text-[0.55em] uppercase tracking-[0.14em]">{sub}</span>}
    </div>
  );
}

/** Amber LED indicator text, like the boards above Mumbai platforms. */
export function Led({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={cn("font-mono uppercase tracking-[0.18em] text-sodium", className)}
      // the glow is what sells "LED"; text-shadow is static so it costs nothing per frame
      style={{ textShadow: "0 0 6px rgb(244 166 64 / 0.75), 0 0 18px rgb(244 166 64 / 0.35)" }}
    >
      {text}
    </span>
  );
}

/** Small mono eyebrow above a section title. */
export function SectionLabel({ index, text, className }: { index: string; text: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-haze", className)}>
      <span className="text-sodium">{index}</span>
      <span className="h-px w-8 bg-rail" />
      <span>{text}</span>
    </div>
  );
}
