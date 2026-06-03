import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Words Sanctuary - AI-Powered Quote Archive";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#f4f4f5",
          padding: "80px",
          border: "1px solid #27272a",
          position: "relative",
        }}
      >
        {/* Decorative background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "400px",
            background: "rgba(217, 119, 6, 0.08)",
            borderRadius: "50%",
            filter: "blur(120px)",
          }}
        />

        {/* Large Decorative Quote Mark */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "60px",
            fontSize: "180px",
            fontFamily: "serif",
            color: "rgba(217, 119, 6, 0.15)",
            lineHeight: 1,
          }}
        >
          “
        </div>

        {/* Brand Header */}
        <div
          style={{
            display: "flex",
            fontSize: "16px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.4em",
            color: "#d97706",
            marginBottom: "24px",
            fontFamily: "sans-serif",
          }}
        >
          Words Sanctuary
        </div>

        {/* Catchy Description */}
        <div
          style={{
            display: "flex",
            fontSize: "44px",
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "20px",
            maxWidth: "900px",
            color: "#ffffff",
          }}
        >
          An intelligent, edge-native archive of human reflection.
        </div>

        {/* Subtitle / Tech Stack Signature */}
        <div
          style={{
            display: "flex",
            fontSize: "15px",
            color: "#71717a",
            fontFamily: "sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          Powered by Workers AI • Cloudflare D1 & Vectorize • Next.js Edge
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
