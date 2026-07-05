import { ImageResponse } from "next/og";
import { extractIdFromSlug } from "@/utils/slug";
import { Quote } from "@/types";

export const runtime = "edge";

export const alt = "Words Sanctuary - Quote Detail";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Resolve params safely for Next.js async params compatibility
  const resolvedParams = typeof (params as any).then === "function" || "then" in params 
    ? await params 
    : params as { slug: string };
    
  const { slug } = resolvedParams;
  const id = extractIdFromSlug(slug);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

  let quote: Quote | null = null;

  if (id !== -1) {
    try {
      const res = await fetch(`${apiUrl}/api/quotes/${id}`, {
        next: { revalidate: 0 },
        headers: {
          "Accept": "application/json",
          "x-words-internal": "words-frontend",
        },
      });
      if (res.ok) {
        quote = await res.json();
      }
    } catch (err) {
      console.error("Failed to fetch quote for OG image generation:", err);
    }
  }

  const quoteText = quote ? quote.quote_text : "Not all those who wander are lost.";
  const authorText = quote ? quote.author : "J.R.R. Tolkien";
  const sourceText = quote && quote.source && quote.source !== "Unknown" ? quote.source : "";
  const accentColor = quote && quote.color ? quote.color : "#d97706";

  // Parse color hex to rgba glow color
  const hex = accentColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 217;
  const g = parseInt(hex.substring(2, 4), 16) || 119;
  const b = parseInt(hex.substring(4, 6), 16) || 6;
  const glowRgba = `rgba(${r}, ${g}, ${b}, 0.1)`;

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
        {/* Dynamic accent color top glow */}
        <div
          style={{
            position: "absolute",
            top: "0%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "350px",
            background: glowRgba,
            borderRadius: "50%",
            filter: "blur(100px)",
          }}
        />

        {/* Brand Header */}
        <div
          style={{
            display: "flex",
            fontSize: "14px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "#71717a",
            marginBottom: "40px",
            fontFamily: "sans-serif",
          }}
        >
          Words Sanctuary
        </div>

        {/* Quote Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "1000px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: quoteText.length > 180 ? "28px" : quoteText.length > 100 ? "34px" : "42px",
              fontFamily: "serif",
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: 1.4,
              color: "#ffffff",
            }}
          >
            “{quoteText}”
          </div>
        </div>

        {/* Author / Source Attribution */}
        <div
          style={{
            display: "flex",
            fontSize: "20px",
            fontFamily: "sans-serif",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <span style={{ fontWeight: "bold", color: accentColor }}>{authorText}</span>
          {sourceText && (
            <span style={{ color: "#a1a1aa", marginLeft: "8px" }}>
              — {sourceText}
            </span>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
