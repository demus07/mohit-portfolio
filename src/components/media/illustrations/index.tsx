"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { IllustrationName } from "../types";

/*
 * Each illustration is its own chunk, fetched the first time it is needed
 * (a hover on desktop, scrolling near it on a phone) — none of them add
 * weight to the initial page load.
 */
type Props = { active: boolean };
const quiet = () => <div className="absolute inset-0 bg-[#0b0d0c]" />;

const REGISTRY: Record<IllustrationName, ComponentType<Props>> = {
  aether: dynamic(() => import("./aether").then((m) => m.AetherIllustration), { ssr: false, loading: quiet }),
  velotype: dynamic(() => import("./velotype").then((m) => m.VeloTypeIllustration), { ssr: false, loading: quiet }),
  flowledger: dynamic(() => import("./flowledger").then((m) => m.FlowLedgerIllustration), { ssr: false, loading: quiet }),
  auctionxi: dynamic(() => import("./auctionxi").then((m) => m.AuctionXIIllustration), { ssr: false, loading: quiet }),
  texagent: dynamic(() => import("./texagent").then((m) => m.TexAgentIllustration), { ssr: false, loading: quiet }),
  windmill: dynamic(() => import("./windmill").then((m) => m.WindmillIllustration), { ssr: false, loading: quiet }),
};

export function LazyIllustration({ name, active }: { name: IllustrationName } & Props) {
  const Illustration = REGISTRY[name];
  return <Illustration active={active} />;
}
