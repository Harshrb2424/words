"use client";

import { useState } from "react";
import { Copy, Share2, Image, Check } from "lucide-react";
import { Quote } from "@/types";
import { getAccentStyles } from "@/utils/color";

interface QuoteActionsProps {
  quote: Quote;
  onOpenWallpaper: () => void;
}

export default function QuoteActions({ quote, onOpenWallpaper }: QuoteActionsProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const accent = getAccentStyles(quote.color);

  const handleCopyText = async () => {
    try {
      const formattedText = `“${quote.quote_text}” — ${quote.author || "Unknown"}`;
      await navigator.clipboard.writeText(formattedText);
      setCopiedText(true);
      setTimeout(() => {
        setCopiedText(false);
      }, 2000);
    } catch (err) {
      console.warn("Failed to copy quote text:", err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => {
        setCopiedUrl(false);
      }, 2000);
    } catch (err) {
      console.warn("Failed to copy link URL:", err);
    }
  };

  return (
    <div
      style={{
        ["--quote-accent" as any]: accent.textColor,
        ["--quote-accent-bg" as any]: accent.bgColor,
        ["--quote-accent-border" as any]: accent.borderColor,
      }}
      className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full mx-auto"
    >
      {/* Copy Quote Text Pill */}
      <button
        onClick={handleCopyText}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          copiedText
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-200/30"
            : "bg-card-custom border border-border-custom text-foreground/80 hover:bg-[var(--quote-accent-bg)] hover:text-[var(--quote-accent)] hover:border-[var(--quote-accent-border)] shadow-2xs"
        }`}
        title="Copy quote text to clipboard"
      >
        {copiedText ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Copied Quote</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Text</span>
          </>
        )}
      </button>

      {/* Share Page URL Pill */}
      <button
        onClick={handleCopyUrl}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          copiedUrl
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-200/30"
            : "bg-card-custom border border-border-custom text-foreground/80 hover:bg-[var(--quote-accent-bg)] hover:text-[var(--quote-accent)] hover:border-[var(--quote-accent-border)] shadow-2xs"
        }`}
        title="Copy page link for sharing"
      >
        {copiedUrl ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Copied Link</span>
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Link</span>
          </>
        )}
      </button>

      {/* Create Wallpaper Studio Trigger Pill */}
      <button
        onClick={onOpenWallpaper}
        style={{
          backgroundColor: accent.textColor,
          color: "#ffffff",
        }}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110 shadow-2xs cursor-pointer border border-transparent"
        title="Create custom canvas wallpaper"
      >
        <Image className="h-3.5 w-3.5" />
        <span>Download Wallpaper</span>
      </button>
    </div>
  );
}
