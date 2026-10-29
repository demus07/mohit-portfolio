/*
 * Marigold toran across the top edge of the Belief section: swags between anchor
 * points, a strand hanging from each anchor and mango leaves at the anchors, the way
 * temple doorways are dressed. Kept in its own SVG (anchored to the top, xMidYMin)
 * because the main scene is anchored to the ground and would crop the top on wide
 * screens. Static: garlands do not need to move to feel alive.
 */

const W = 1440;
const STEP = 180;
const DIP = 44;
const BEAD = 13;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Bead = { x: number; y: number; c: number; r: number };

const beads: Bead[] = [];
const leaves: { x: number; a: number }[] = [];
{
  const r = rng(7);
  for (let x0 = 0; x0 < W; x0 += STEP) {
    // swag: a parabola from anchor to anchor, beads spaced along it
    const n = Math.round(STEP / BEAD);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      beads.push({ x: x0 + t * STEP, y: 4 + 4 * DIP * t * (1 - t), c: Math.floor(r() * 3), r: 6.5 + r() * 1.5 });
    }
  }
  for (let x = 0; x <= W; x += STEP) {
    // strands vary in length so the edge does not read as a ruler
    const len = 5 + Math.floor(r() * 5);
    for (let j = 0; j < len; j++) {
      beads.push({ x: x + Math.sin(j * 0.6) * 1.2, y: 10 + j * 12, c: (j + Math.floor(r() * 2)) % 3, r: 7 - j * 0.25 });
    }
    leaves.push({ x, a: -24 + r() * 8 }, { x, a: 18 + r() * 8 });
  }
}

const FILLS = ["url(#gl-orange)", "url(#gl-saffron)", "url(#gl-yellow)"];

export function Garland({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${W} 150`} preserveAspectRatio="xMidYMin slice" aria-hidden>
      <defs>
        {/* each bead is shaded as a lit sphere; three gradients instead of a second node per bead */}
        <radialGradient id="gl-orange" cx="0.38" cy="0.62" r="0.7">
          <stop offset="0" stopColor="#ffb05a" />
          <stop offset="0.6" stopColor="#d9681a" />
          <stop offset="1" stopColor="#6e2a0c" />
        </radialGradient>
        <radialGradient id="gl-saffron" cx="0.38" cy="0.62" r="0.7">
          <stop offset="0" stopColor="#ffc764" />
          <stop offset="0.6" stopColor="#e88d1e" />
          <stop offset="1" stopColor="#74380c" />
        </radialGradient>
        <radialGradient id="gl-yellow" cx="0.38" cy="0.62" r="0.7">
          <stop offset="0" stopColor="#ffe07a" />
          <stop offset="0.6" stopColor="#e8b324" />
          <stop offset="1" stopColor="#6e4c0c" />
        </radialGradient>
      </defs>
      {/* pre-dawn: the flowers are seen in low light, so the whole toran is dimmed */}
      <g opacity={0.78}>
        <line x1={0} y1={2} x2={W} y2={2} stroke="#3a2a1a" strokeWidth={3} />
        {leaves.map((l, i) => (
          <ellipse key={i} cx={l.x} cy={20} rx={5} ry={17} fill="#24451f" transform={`rotate(${l.a} ${l.x} 4)`} />
        ))}
        {beads.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={FILLS[b.c]} />
        ))}
      </g>
    </svg>
  );
}
