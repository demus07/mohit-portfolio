import type { Metadata, Viewport } from "next";
import { Newsreader, Hanken_Grotesk, Schibsted_Grotesk, Geist_Mono, Bricolage_Grotesque, Noto_Sans_Devanagari } from "next/font/google";
import { MotionLayer } from "@/components/MotionLayer";
import "./globals.css";

// The serif is Mohit's voice and the sans states facts.
const serif = Newsreader({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hanken",
  display: "swap",
});

// His project pieces keep the type they were built in on his own site.
const productSans = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-schibsted",
  display: "swap",
});

const productMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

// His own scenes (from his mumbai-local branch) letter their signs in Bricolage, and every station
// board carries its Marathi name in Noto Sans Devanagari.
const productDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const deva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["500", "700"],
  variable: "--font-noto-deva",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mohitbagri.vercel.app"),
  title: "Mohit Bagri, software engineer in Mumbai",
  description: "Software engineer at Sypha AI and founder of AuctionXI. I build things and learn how they work.",
  openGraph: {
    title: "Mohit Bagri, software engineer in Mumbai",
    description: "Software engineer at Sypha AI and founder of AuctionXI. I build things and learn how they work.",
    url: "https://mohitbagri.vercel.app",
    siteName: "Mohit Bagri",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efe8da" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1a2b" },
  ],
};

// Morning or night before the first paint: a saved choice, else the system's.
const THEME = `try{var t=localStorage.getItem("theme");if(t!=="day"&&t!=="night")t=matchMedia("(prefers-color-scheme: dark)").matches?"night":"day";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="day"}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${serif.variable} ${sans.variable} ${productSans.variable} ${productMono.variable} ${productDisplay.variable} ${deva.variable} is-loading`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME }} />
      </head>
      <body>
        <MotionLayer />
        {children}
      </body>
    </html>
  );
}
