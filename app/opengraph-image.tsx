import { ImageResponse } from "next/og";
import { hero } from "@/data/site";

export const alt = "NJOEL, full-stack & mobile developer based in Malang, Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Simple wordmark card: tokens from DESIGN.md, no gradients, no photo.
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
          background: "#09090B",
          color: "#ECEAF2",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 44, color: "#8B5CF6", fontWeight: 800 }}>
          {"</>"}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 280,
              fontWeight: 800,
              letterSpacing: -14,
              lineHeight: 0.85,
            }}
          >
            NJOEL
          </div>
          <div style={{ display: "flex", marginTop: 36, fontSize: 36, color: "#8B8A96" }}>
            {hero.tagline}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
