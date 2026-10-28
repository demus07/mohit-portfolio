// Every word on the page, in one place. All of it is Mohit's own, from his notes and his old site.

export const PERSON = {
  name: "Mohit Bagri",
  email: "mailmohitbagri@gmail.com",
  resume: "https://drive.google.com/file/d/1tvUUDXIiEy1aDDjIlC_ISVji06-NrZrF/view?usp=sharing",
  github: "https://github.com/Mohit-Bagri",
  linkedin: "https://www.linkedin.com/in/mohit-bagri-1a2099354/",
  instagram: "https://www.instagram.com/mohit_.bagri/",
  leetcode: "https://leetcode.com/u/mailmohitbagri/",
  sypha: "https://sypha.ai",
};

export const mailto = (subject: string) =>
  `mailto:${PERSON.email}?subject=${encodeURIComponent(subject)}`;

import type { Media } from "@/components/media/types";

export type Project = {
  name: string;
  kind: string;
  head: string;
  line: string;
  links: [string, string][];
  media: Media;
};

// AuctionXI leads; the other seven follow as an index. Every line is from his old site and his notes.
export const FEATURED = {
  name: "AuctionXI",
  kind: "My own product, 2026",
  head: "Live player auctions for any sport",
  line: "Real-time bidding, broadcast graphics and YouTube overlays, with no production team.",
  facts: [
    "Every bid lands on every screen at once, and the money always adds up.",
    "Twenty broadcast scenes for the projector and the stream.",
    "Auction-ready in under 20 minutes.",
  ],
  tech: "Next.js, TypeScript, Postgres, Drizzle, Pusher, NextAuth",
  links: [["Live", "https://auction-xi.com"]] as [string, string][],
  media: { kind: "illustration", name: "auctionxi" } as Media,
};

export const PROJECTS: Project[] = [
  { name: "TexAgent", kind: "Client work, 2026", head: "A bahi-khata for textile brokers", line: "Bills, brokerage and follow-ups in one place, instead of a paper book.", links: [], media: { kind: "illustration", name: "texagent" } },
  { name: "Cache Karo", kind: "Command-line tool, 2026", head: "Find the cache hogs, get the space back", line: "Disk analysis and safe cleanup on macOS, Linux and Windows. One line to install.", links: [["PyPI", "https://pypi.org/project/cachekaro/"], ["Source", "https://github.com/Mohit-Bagri/cachekaro"]], media: { kind: "terminal" } },
  { name: "Aether", kind: "AI web app, 2025", head: "News, YouTube and Reddit in one conversation", line: "An assistant with 17+ tones, and an NLP pipeline that scores every article first.", links: [["Source", "https://github.com/Mohit-Bagri/aether-news-trends"]], media: { kind: "illustration", name: "aether" } },
  { name: "FlowLedger", kind: "Mobile app, 2026", head: "Every rupee in, every rupee out", line: "A local-first finance app in Flutter that scans receipts and catches money leaks.", links: [["Source", "https://github.com/Mohit-Bagri/flowledger"]], media: { kind: "illustration", name: "flowledger" } },
  { name: "Space Shuttle VR", kind: "VR game, 2024", head: "Fix the shuttle, then fly it out", line: "A room-scale game for Meta Quest: hands-on tasks aboard, then pilot it to the final portal.", links: [["Source", "https://github.com/Mohit-Bagri/spaceshuttletasks-vr-game"]], media: { kind: "video", src: "/work/shuttle-vr.mp4", poster: "/work/shuttle-vr.jpg", alt: "Space Shuttle VR gameplay: the shuttle interior, a target range and the ladder climb" } },
  { name: "VeloType", kind: "Web app, 2026", head: "A typing test built for feel", line: "Themes, modes and live words per minute, with a caret that keeps up.", links: [["Live", "https://velo-type.vercel.app"]], media: { kind: "illustration", name: "velotype" } },
  { name: "Windmill VR", kind: "VR app, 2025", head: "Breathe with the windmill", line: "A calm VR app for Meta Quest, paced to a four-part breath.", links: [["Source", "https://github.com/Mohit-Bagri/windmill-vr"]], media: { kind: "illustration", name: "windmill" } },
];

// The jobs, oldest first, as stations on the line. AuctionXI and TexAgent are his own work beside
// Sypha, so they live with the projects.
export const ROLES: { co: string; ti: string; when: string; did?: string[] }[] = [
  { co: "Brahmani Gems", ti: "Web developer intern, Shopify", when: "Jul – Aug 2024" },
  { co: "MK Exim India", ti: "E-commerce, Amazon, TataCliQ and Sephora", when: "Mar – Sep 2025" },
  {
    co: "Sypha AI",
    ti: "Software Engineer",
    when: "Dec 2025 – now",
    did: [
      "Built Sypha Gateway. It replaced OpenRouter across every Sypha product and cut its 5% markup.",
      "Built an AI CLI that 500+ developers use daily, across 20+ providers and self-hosted models.",
      "Turned trackers, MIS reports and PDFs into a 21-sheet P&L workbook. Days of reconciliation, one upload.",
      "Unblocked a Kotlin plugin stuck in production for two months by tracing 21 cascading issues.",
    ],
  },
];
