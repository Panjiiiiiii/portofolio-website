import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon from the NJOEL wordmark: the first two letters, since the full word does not fit at 32px.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090B",
          color: "#ECEAF2",
          fontSize: 19,
          fontWeight: 800,
          letterSpacing: -1,
          borderBottom: "3px solid #00A19B",
        }}
      >
        NJ
      </div>
    ),
    size,
  );
}
