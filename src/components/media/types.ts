// What a project shows, as on his own site: real footage, a replay of real terminal output, or a
// coded recreation of the product itself.
export type IllustrationName = "aether" | "velotype" | "flowledger" | "auctionxi" | "texagent" | "windmill";

export type Media =
  | { kind: "video"; src: string; poster: string; alt: string }
  | { kind: "terminal" }
  | { kind: "illustration"; name: IllustrationName };
