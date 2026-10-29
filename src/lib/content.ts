// Every word on the page, in one place, in Mohit's own voice. The projects, the line, the scenes off
// the clock and the belief come from his own branch (mumbai-local, his answers of 2026-10-28).
// No em dashes and no Oxford commas in anything a visitor reads.

import type { Media } from "@/components/media/types";

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

export const hero = {
  name: "Mohit Bagri",
  role: "Software Engineer at Sypha AI",
  line: "I build things and learn how they work.",
};

// One year in: what he shipped, then the aside he says next to it.
export const about = {
  title: "One year in, here\u2019s what I shipped",
  shipped: [
    "An LLM gateway that replaced OpenRouter, cutting its 5% markup.",
    "A terminal tool 500+ developers open daily.",
    "A live auction SaaS I built alone.",
  ],
  aside: ["9.45 CGPA taught me less than shipping did.", "Still early. Still building."],
};

export type Project = {
  id: string;
  title: string;
  type: string;
  period: string;
  description: string;
  features: string[];
  tech: string[];
  /** omitted for private repos */
  github?: string;
  live?: string;
  /** small caveat under the links, e.g. a demo on a free tier that sleeps */
  liveNote?: string;
  video?: string;
  /** shown instead of links when there is nothing public to open */
  note?: string;
  media?: Media;
};

/* AuctionXI is the first platform and gets the hall; the other seven follow it on the board. */
export const projects: Project[] = [
  {
    id: "01",
    title: "AuctionXI",
    type: "Founder · SaaS",
    period: "2026",
    description:
      "Live player auctions for any sport. Real-time bidding, broadcast-quality graphics and instant YouTube overlays, with no production team needed.",
    features: [
      "Every bid lands on every screen at once and the money always adds up.",
      "Twenty ready-made broadcast scenes for the projector and the live stream.",
      "Auction-ready in under 20 minutes, with every result ready to download after.",
    ],
    tech: ["Next.js", "TypeScript", "Postgres", "Drizzle", "Pusher", "NextAuth"],
    live: "https://auction-xi.com",
    media: { kind: "illustration", name: "auctionxi" },
  },
  {
    id: "02",
    title: "TexAgent",
    type: "Freelance · Client",
    period: "2026",
    description:
      "A digital bahi-khata for textile brokers. Bills, brokerage and follow-ups all in one place, instead of a paper book.",
    features: [
      "Every bill's GST and brokerage worked out automatically, exact to the paisa.",
      "See who owes what and for how long, with follow-ups ready to go.",
      "Each party's full account on one page, always up to date.",
    ],
    tech: ["Next.js", "TypeScript", "Postgres", "Drizzle", "Tailwind CSS", "Vitest"],
    note: "Private client project",
    media: { kind: "illustration", name: "texagent" },
  },
  {
    id: "03",
    title: "Cache Karo",
    type: "CLI Tool",
    period: "2026",
    description:
      "A cross-platform command-line tool to analyze disk usage, hunt down cache hogs and reclaim space on macOS, Linux and Windows.",
    features: [
      "Install in one line with `pip install cachekaro`, published on PyPI.",
      "Analyze disk usage and surface the biggest cache hogs.",
      "Safe cleanup to free up space across macOS, Linux and Windows.",
    ],
    tech: ["Python", "CLI", "Cross-platform"],
    github: "https://github.com/Mohit-Bagri/cachekaro",
    media: { kind: "terminal" },
  },
  {
    id: "04",
    title: "Aether",
    type: "AI Web App",
    period: "2025",
    description:
      "An AI assistant that pulls real-time news, YouTube and Reddit into one conversational feed with 17+ response tones. Behind the chat sits a full NLP pipeline that scores every article before you ever see it.",
    features: [
      "Aggregates live news, YouTube videos and Reddit discussions.",
      "17+ response tones plus a general-purpose assistant mode.",
      "spaCy preprocessing feeds TF-IDF and k-means to group articles by keyword relevance, and an intent classifier picks what fits each query. Parallel fetching cut response time by 66%.",
    ],
    tech: ["Python", "Flask", "OpenAI", "NLP", "Reddit API", "YouTube API"],
    github: "https://github.com/Mohit-Bagri/aether-news-trends",
    live: "https://aether-news-trends-vpt4.onrender.com/",
    liveNote: "Free-tier demo, the first load can take a minute",
    media: { kind: "illustration", name: "aether" },
  },
  {
    id: "05",
    title: "FlowLedger",
    type: "Mobile App",
    period: "2026",
    description:
      "A cross-platform personal finance app built with Flutter. Track every income stream and expense, scan receipts and catch money leaks, all local-first with optional encrypted cloud sync.",
    features: [
      "Receipt scanning with Google ML Kit OCR and 53+ bank accounts.",
      "Budgets, savings goals and AI money-leak detection.",
      "Local-first storage with biometric lock and 12+ languages.",
    ],
    tech: ["Flutter", "Dart", "Riverpod", "Supabase", "Hive", "ML Kit"],
    github: "https://github.com/Mohit-Bagri/flowledger",
    media: { kind: "illustration", name: "flowledger" },
  },
  {
    id: "06",
    title: "Space Shuttle VR",
    type: "VR Game",
    period: "2024",
    description:
      "A room-scale VR game for Meta Quest. Complete hands-on tasks aboard a space shuttle and pilot it to the final portal.",
    features: [
      "Grab, dismantle and interact with objects using the XR Interaction Toolkit.",
      "Task-based progression ending in a drivable shuttle sequence.",
      "AI voice guidance built in Unity with ElevenLabs.",
    ],
    tech: ["Unity", "C#", "XR Interaction Toolkit", "Meta Quest", "ElevenLabs"],
    github: "https://github.com/Mohit-Bagri/spaceshuttletasks-vr-game",
    video: "https://drive.google.com/file/d/15qvFWB-3ilB526Bnv-MyG3wQXX16g7Li/view?usp=sharing",
    media: {
      kind: "video",
      src: "/work/shuttle-vr.mp4",
      poster: "/work/shuttle-vr.jpg",
      alt: "Space Shuttle VR gameplay: the shuttle interior, a target range and the ladder climb",
    },
  },
  {
    id: "07",
    title: "VeloType",
    type: "Web App",
    period: "2026",
    description:
      "A fast, minimal typing-speed test inspired by MonkeyType, built for feel, with themes, modes and real-time analytics.",
    features: [
      "9 themes, 6 test modes and 12 languages, plus 16 code languages.",
      "Smooth animated caret with real-time WPM analytics.",
      "Built with React, Vite and Tailwind CSS.",
    ],
    tech: ["React", "Vite", "JavaScript", "Tailwind CSS"],
    github: "https://github.com/Mohit-Bagri/velotype",
    live: "https://velo-type.vercel.app",
    media: { kind: "illustration", name: "velotype" },
  },
  {
    id: "08",
    title: "Windmill VR",
    type: "VR App",
    period: "2025",
    description:
      "A calming VR breathing app for Meta Quest, with an animated 3D windmill paced to a 4-phase breathing cycle for guided mindfulness.",
    features: [
      "Animated 3D windmill synced to a 4-phase breathing cycle.",
      "Designed for mindfulness and meditation on Meta Quest.",
      "Built with Unity and C#.",
    ],
    tech: ["Unity", "C#", "Meta Quest"],
    github: "https://github.com/Mohit-Bagri/windmill-vr",
    media: { kind: "illustration", name: "windmill" },
  },
];


/** Origin story + experience as stations on one line, oldest first. */
export type Station = {
  code: string;
  /** station-board name, short and uppercase-friendly */
  name: string;
  /** optional Marathi line for the board */
  deva?: string;
  when: string;
  title: string;
  body: string;
  points?: string[];
};

/* The line runs through his story up to the job he is in. AuctionXI and TexAgent are his own work
 * beside Sypha, so they stay with the projects rather than as stations. */
export const route = {
  label: "The line",
  title: "Every detour was part of the path",
  stations: [
    {
      code: "01",
      name: "First semester",
      deva: "पहिले सत्र",
      when: "2021",
      title: "The first thing I built got taken down",
      body: "I wrote my first real code in my first semester of Computer Engineering at Ramrao Adik Institute of Technology. It was a blog that tracked patch updates for games I played. It got taken down over copyright, and that was my first lesson in building.",
    },
    {
      code: "02",
      name: "Detours",
      deva: "वळण",
      when: "During college",
      title: "I tried everything",
      body: "I got pulled into NFTs, the worst call I've made, because I was listening to the hype instead of the people calling it out. Then blogging, Google Ads and SEO, Meta Ads, running an agency and dropshipping. For about a year I stopped coding and turned into a finance guy.",
      points: ["Web developer intern at Brahmani Gems, Jul to Aug 2024, improving a Shopify storefront."],
    },
    {
      code: "03",
      name: "MK Exim",
      deva: "एमके एक्झिम",
      when: "Mar to Sep 2025",
      title: "Where I learned how a business really runs",
      body: "I went to MK Exim for business exposure. I saw one person lead hundreds of people across warehouse, finance, e-commerce and media, and he walked me through how all of it connected. It also showed me the biggest room for growth was in tech, and tech was what I already knew.",
      points: ["E-commerce across Amazon, TataCliQ and Sephora."],
    },
    {
      code: "04",
      name: "Sypha AI",
      deva: "सायफा",
      when: "Dec 2025 to now",
      title: "Back to engineering, for good",
      body: "I built projects, applied and joined Sypha AI as a full-time Software Engineer. This is where I do my main work.",
      points: [
        "Built Sypha Gateway. It replaced OpenRouter across every Sypha product and cut its 5% markup.",
        "Built an AI CLI that 500+ developers use daily, across 20+ providers and self-hosted models.",
        "Turned trackers, MIS reports and PDFs into a 21-sheet P&L workbook. Days of reconciliation, one upload.",
        "Unblocked a Kotlin plugin stuck in production for two months by tracing 21 cascading issues.",
      ],
    },
    {
      code: "05",
      name: "AuctionXI",
      deva: "ऑक्शन इलेव्हन",
      when: "2026",
      title: "My own product, and the one closest to my heart",
      body: "Building it taught me what code alone can't: how to get users, how to keep them, how to make a product feel smooth and friendly and how to take the friction out of every step.",
    },
    {
      code: "06",
      name: "TexAgent",
      deva: "टेक्सएजंट",
      when: "Sep 2026 to now",
      title: "Freelance, for textile brokers",
      body: "A client project: a digital bahi-khata that keeps bills, brokerage and follow-ups in one place instead of a paper book.",
    },
  ] satisfies Station[],
  footnote: "B.Tech Computer Engineering, Ramrao Adik Institute of Technology, 2021 to 2025. CGPA 9.45, which taught me less than shipping did.",
};


export const stations = route.stations.filter((s) => s.name !== "AuctionXI" && s.name !== "TexAgent");

export const platforms = {
  label: "Platforms",
  title: "Things I've built and shipped",
  intro: "Every project gets its own platform. Products I run, client work, web and mobile apps, AI, VR and command-line tools.",
  /** short destination text for the LED departure board, one per project id */
  board: {
    "01": "LIVE AUCTIONS",
    "02": "TEXTILE BOOKS",
    "03": "FREE DISK SPACE",
    "04": "NEWS + AI",
    "05": "EVERY RUPEE",
    "06": "FINAL PORTAL",
    "07": "120 WPM",
    "08": "SLOW BREATH",
  } as Record<string, string>,
};


export const offTheClock = {
  label: "Off the clock",
  title: "Mumbai, when I'm not in a terminal",
  scenes: {
    wankhede: {
      title: "Love watching cricket, bad at playing it",
      body: "Mumbai Indians fan. Wankhede is the dream seat.",
    },
    bse: {
      title: "Dalal Street on my mind",
      body: "Startups, finance, taxation and the stock market. I like talking to people from finance backgrounds about how their side works.",
      ticker: ["STARTUPS", "FINANCE", "TAXATION", "MARKETS", "BSE"],
    },
    tapri: {
      title: "Fuel",
      body: "Cutting chai, but I won't say no to a cold coffee, a latte or an espresso. Chaas or lassi when Mumbai gets hot.",
      menu: ["Cutting chai", "Cold coffee", "Latte", "Espresso", "Chaas", "Lassi"],
    },
    monsoon: {
      title: "The city in the rain",
      body: "Monsoon, the double-decker and the skyline at night from somewhere high. I swim and lift too, just not regularly.",
    },
  },
};


export const belief = {
  label: "Belief",
  quote: "If you believe you can make it, you will. The rest is trusting God and doing the work.",
  place: "Siddhivinayak",
  note: "Whenever I feel low or high, I go to Siddhivinayak. It's where I reset.",
};


export const necklace = {
  label: "Last stop",
  title: "Got something to build?",
  body: "I'm open to full-time roles, freelance work and the occasional wild idea.",
  cta: "Write to me",
  clockPrefix: "It's",
  clockSuffix: "in Mumbai.",
};

