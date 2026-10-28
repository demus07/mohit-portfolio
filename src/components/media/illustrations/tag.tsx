/** Small top-right label: "Illustration" for coded recreations, or e.g. "Live video" for real footage. */
export function IllustrationTag({ tone = "dark", label = "Illustration" }: { tone?: "dark" | "light"; label?: string }) {
  return (
    <span
      className={`pointer-events-none absolute right-2.5 top-2 z-20 rounded-full px-2 py-[3px] font-mono text-[8.5px] uppercase tracking-[0.14em] ${
        tone === "dark" ? "bg-black/45 text-white/60" : "bg-white/70 text-black/50"
      }`}
    >
      {label}
    </span>
  );
}
