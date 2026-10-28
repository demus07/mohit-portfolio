import type { Metadata, Viewport } from "next";
import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { MotionLayer } from "@/components/MotionLayer";
import "./globals.css";

// The serif is Mohit's voice, the sans states facts, and the mono is only ever code.
const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
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

// A saved choice of day or night, applied before the first paint so nothing flashes.
const THEME = `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${serif.variable} ${sans.variable} ${mono.variable} is-loading`}>
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
