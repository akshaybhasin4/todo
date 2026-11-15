import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon for iOS (it doesn't use SVG favicons).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#4566ec" }}>
        <div style={{ width: 92, height: 92, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="#4566ec" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    ),
    size
  );
}
