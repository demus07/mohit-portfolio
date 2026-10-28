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

// The opening: the evening local pulling into Bhayandar, Mohit hanging out of the door.
export const HERO = {
  title: "Mohit Bagri",
  line: "Software engineer at Sypha AI and founder of AuctionXI. I build things and learn how they work.",
  note: "That's me. Can't wait to get home and fix what blocked production.",
  hint: "Scroll, the train is pulling in",
};

// The Western line, Churchgate to Bhayandar, every station on the way home.
export const WESTERN_LINE = [
  "Churchgate",
  "Marine Lines",
  "Charni Road",
  "Grant Road",
  "Mumbai Central",
  "Mahalaxmi",
  "Lower Parel",
  "Prabhadevi",
  "Dadar",
  "Matunga Road",
  "Mahim",
  "Bandra",
  "Khar Road",
  "Santacruz",
  "Vile Parle",
  "Andheri",
  "Jogeshwari",
  "Ram Mandir",
  "Goregaon",
  "Malad",
  "Kandivali",
  "Borivali",
  "Dahisar",
  "Mira Road",
  "Bhayandar",
];

// The ride in: every detour is a station on the way.
export const ROUTE = {
  title: "Every detour was part of the path",
  stops: [
    {
      station: "Ramrao Adik",
      year: "2021",
      line: "My first real code was a blog that tracked patch notes for games I played. It got taken down over copyright. First lesson in building.",
    },
    {
      station: "NFTs",
      year: "",
      line: "The worst call I've made. I listened to the hype instead of the people calling it out.",
    },
    {
      station: "Everything else",
      year: "",
      line: "Blogging, Google Ads and SEO, Meta Ads, an agency, dropshipping. For about a year I stopped coding and turned into a finance guy.",
    },
    {
      station: "MK Exim",
      year: "2025",
      line: "One person led hundreds across warehouse, finance, e-commerce and media, and walked me through how it all connected. The biggest room for growth was in tech.",
    },
    {
      station: "Graduated",
      year: "2025",
      line: "Computer Engineering, 9.45 CGPA. Grades taught me less than shipping did.",
    },
    {
      station: "Sypha AI",
      year: "2025",
      line: "So I came back to engineering for good. An LLM gateway, an AI CLI 500+ developers use, and days of finance work turned into one upload.",
    },
    {
      station: "AuctionXI",
      year: "2026",
      line: "My own product, and the thing I'm proudest of. It taught me what code alone can't: getting users, keeping them, taking the friction out of every step.",
    },
  ],
};

export type Media =
  | { kind: "auctionxi" }
  | { kind: "texagent" }
  | { kind: "terminal" }
  | { kind: "aether" }
  | { kind: "flowledger" }
  | { kind: "video"; src: string; poster: string; alt: string }
  | { kind: "velotype" }
  | { kind: "windmill" };

export type Project = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  headline: string;
  line: string;
  facts: string[];
  tech: string[];
  live?: string;
  liveNote?: string;
  pypi?: string;
  github?: string;
  video?: string;
  note?: string;
  media: Media;
  // what the departure board says about it
  board: { time: string; via: string; cars: number; fast: boolean };
};

export const WORK = {
  title: "Churchgate, all platforms",
  line: "Everything I've built and shipped, end to end.",
  projects: [
    {
      slug: "auctionxi",
      title: "AuctionXI",
      kind: "My own product",
      year: "2026",
      headline: "Live player auctions for any sport",
      line: "Real-time bidding, broadcast graphics and YouTube overlays, with no production team.",
      facts: [
        "Every bid lands on every screen at once, and the money always adds up.",
        "Twenty broadcast scenes for the projector and the stream.",
        "Auction-ready in under 20 minutes.",
      ],
      tech: ["Next.js", "TypeScript", "Postgres", "Drizzle", "Pusher", "NextAuth"],
      live: "https://auction-xi.com",
      media: { kind: "auctionxi" },
      board: { time: "8:04", via: "Live", cars: 15, fast: true },
    },
    {
      slug: "texagent",
      title: "TexAgent",
      kind: "Client work",
      year: "2026",
      headline: "A bahi-khata for textile brokers",
      line: "Bills, brokerage and follow-ups in one place, instead of a paper book.",
      facts: [
        "GST and brokerage on every bill, exact to the paisa.",
        "Who owes what, and for how long.",
        "Each party's full account on one page.",
      ],
      tech: ["Next.js", "TypeScript", "Postgres", "Drizzle", "Tailwind CSS", "Vitest"],
      note: "Private client project",
      media: { kind: "texagent" },
      board: { time: "8:11", via: "Private", cars: 12, fast: false },
    },
    {
      slug: "cachekaro",
      title: "Cache Karo",
      kind: "Command-line tool",
      year: "2026",
      headline: "Find the cache hogs, get the space back",
      line: "Disk analysis and safe cleanup on macOS, Linux and Windows. One line to install.",
      facts: [
        "Published on PyPI: pip install cachekaro.",
        "Surfaces the biggest caches first.",
        "Cleans safely, with a dry run before anything goes.",
      ],
      tech: ["Python", "CLI", "Cross-platform"],
      pypi: "https://pypi.org/project/cachekaro/",
      github: "https://github.com/Mohit-Bagri/cachekaro",
      media: { kind: "terminal" },
      board: { time: "8:17", via: "PyPI", cars: 12, fast: true },
    },
    {
      slug: "aether",
      title: "Aether",
      kind: "AI web app",
      year: "2025",
      headline: "News, YouTube and Reddit in one conversation",
      line: "An assistant with 17+ tones, and an NLP pipeline that scores every article first.",
      facts: [
        "spaCy, TF-IDF and k-means group articles by relevance.",
        "An intent classifier picks what fits each question.",
        "Parallel fetching cut response time by 66%.",
      ],
      tech: ["Python", "Flask", "OpenAI", "NLP", "Reddit API", "YouTube API"],
      live: "https://aether-news-trends-vpt4.onrender.com/",
      liveNote: "Free-tier demo, the first load can take a minute.",
      github: "https://github.com/Mohit-Bagri/aether-news-trends",
      media: { kind: "aether" },
      board: { time: "8:26", via: "Live", cars: 12, fast: false },
    },
    {
      slug: "flowledger",
      title: "FlowLedger",
      kind: "Mobile app",
      year: "2026",
      headline: "Every rupee in, every rupee out",
      line: "A local-first finance app in Flutter that scans receipts and catches money leaks.",
      facts: [
        "On-device receipt scanning with ML Kit, 53+ banks.",
        "Budgets, savings goals and leak detection.",
        "Biometric lock, 12+ languages, optional encrypted sync.",
      ],
      tech: ["Flutter", "Dart", "Riverpod", "Supabase", "Hive", "ML Kit"],
      github: "https://github.com/Mohit-Bagri/flowledger",
      media: { kind: "flowledger" },
      board: { time: "8:33", via: "Source", cars: 12, fast: false },
    },
    {
      slug: "shuttle",
      title: "Space Shuttle VR",
      kind: "VR game",
      year: "2024",
      headline: "Fix the shuttle, then fly it out",
      line: "A room-scale game for Meta Quest: hands-on tasks aboard, then pilot it to the final portal.",
      facts: [
        "Grab and dismantle things with the XR Interaction Toolkit.",
        "Tasks build up to a drivable shuttle.",
        "Voice guidance made with ElevenLabs.",
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
      board: { time: "8:40", via: "Quest", cars: 12, fast: true },
    },
    {
      slug: "velotype",
      title: "VeloType",
      kind: "Web app",
      year: "2026",
      headline: "A typing test built for feel",
      line: "Themes, modes and live words per minute, with a caret that keeps up.",
      facts: [
        "9 themes, 6 modes, 12 languages and 16 code languages.",
        "A smooth animated caret.",
        "React, Vite and Tailwind CSS.",
      ],
      tech: ["React", "Vite", "JavaScript", "Tailwind CSS"],
      live: "https://velo-type.vercel.app",
      github: "https://github.com/Mohit-Bagri/velotype",
      media: { kind: "velotype" },
      board: { time: "8:52", via: "Live", cars: 12, fast: false },
    },
    {
      slug: "windmill",
      title: "Windmill VR",
      kind: "VR app",
      year: "2025",
      headline: "Breathe with the windmill",
      line: "A calm VR app for Meta Quest, paced to a four-part breath.",
      facts: [
        "A 3D windmill that turns with your breathing.",
        "Made for a few quiet minutes.",
        "Unity and C#.",
      ],
      tech: ["Unity", "C#", "Meta Quest"],
      github: "https://github.com/Mohit-Bagri/windmill-vr",
      media: { kind: "windmill" },
      board: { time: "9:05", via: "Source", cars: 12, fast: false },
    },
  ] satisfies Project[],
};

export const DALAL = {
  title: "Where I do the work",
  line: "I like how businesses run underneath: startups, tax, the market.",
  ticker: [
    "Sypha Gateway: OpenRouter's 5% markup, gone",
    "AI CLI: 500+ developers, every day",
    "20+ model providers",
    "P&L: days of reconciliation, one upload",
    "Kotlin plugin: 21 issues traced, unblocked",
    "AuctionXI: live at auction-xi.com",
  ],
  roles: [
    {
      company: "Sypha AI",
      href: "https://sypha.ai",
      role: "Software Engineer",
      period: "Dec 2025 – now",
      points: [
        "Built Sypha Gateway. It replaced OpenRouter across every Sypha product and cut its 5% markup.",
        "Built an AI CLI that 500+ developers use daily, across 20+ providers and self-hosted models.",
        "Turned trackers, MIS reports and PDFs into a 21-sheet P&L workbook. Days of reconciliation, one upload.",
        "Unblocked a Kotlin plugin stuck in production for two months by tracing 21 cascading issues.",
      ],
    },
    { company: "AuctionXI", href: "https://auction-xi.com", role: "Founder", period: "Apr 2026 – now", points: [] },
    { company: "TexAgent", role: "Freelance developer", period: "Sep 2026 – now", points: [] },
    { company: "MK Exim India", role: "E-commerce, Amazon, TataCliQ and Sephora", period: "Mar – Sep 2025", points: [] },
    { company: "Brahmani Gems", role: "Web developer intern, Shopify", period: "Jul – Aug 2024", points: [] },
  ],
};

export const WANKHEDE = {
  title: "The dream seat is at Wankhede",
  line: "I love watching cricket. I'm bad at playing it.",
  aside: "I swim and I lift, irregularly.",
};

// The footer, at Siddhivinayak after dark.
export const CONTACT = {
  title: "Got something to build?",
  line: "I'm open to full-time roles, freelance work and the occasional wild idea.",
  belief: "If you believe you can make it, you will. The rest is trusting God and doing the work.",
  reset: "Siddhivinayak, where I go when I feel low or high. It's where I reset.",
};
