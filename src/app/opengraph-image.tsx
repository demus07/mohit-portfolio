import { ImageResponse } from "next/og";

export const alt = "Mohit Bagri, software engineer in Mumbai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The share card: paper, the name, one line, and the station board for the way home.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(180deg, #a9c6d3 0%, #ece0c8 55%, #f4c993 100%)",
          color: "#23262a",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 112, letterSpacing: -4, lineHeight: 1, fontFamily: "Georgia, serif" }}>Mohit Bagri</div>
          <div style={{ fontSize: 34, maxWidth: 760, lineHeight: 1.35 }}>
            Software engineer at Sypha AI and founder of AuctionXI. I build things and learn how they work.
          </div>
        </div>
        <div style={{ display: "flex", alignSelf: "flex-end", background: "#f5c518", padding: "18px 40px", fontSize: 44, fontWeight: 800, letterSpacing: 2, color: "#141414" }}>
          BHAYANDAR
        </div>
      </div>
    ),
    size,
  );
}
