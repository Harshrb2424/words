"use client";

import { useState, useEffect } from "react";
import { Copy, Share2, Image, Check, Heart } from "lucide-react";
import { Quote } from "@/types";
import { getAccentStyles } from "@/utils/color";

interface QuoteActionsProps {
  quote: Quote;
  onOpenWallpaper: () => void;
}

export default function QuoteActions({ quote, onOpenWallpaper }: QuoteActionsProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(quote.likes || 0);

  const accent = getAccentStyles(quote.color);

  useEffect(() => {
    try {
      const likedQuotes = JSON.parse(localStorage.getItem("words_liked_quotes") || "[]");
      if (Array.isArray(likedQuotes) && likedQuotes.includes(quote.id)) {
        setLiked(true);
      }
    } catch (e) {
      // ignore
    }
  }, [quote.id]);

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

  const handleLike = async () => {
    if (liked) return;

    setLiked(true);
    setLikesCount((prev) => prev + 1);

    try {
      const likedQuotes = JSON.parse(localStorage.getItem("words_liked_quotes") || "[]");
      if (!likedQuotes.includes(quote.id)) {
        likedQuotes.push(quote.id);
        localStorage.setItem("words_liked_quotes", JSON.stringify(likedQuotes));
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
      const res = await fetch(`${apiUrl}/api/quotes/${quote.id}/like`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.likes === "number") {
          setLikesCount(data.likes);
        }
      }
    } catch (err) {
      console.warn("Failed to update likes on server:", err);
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
      {/* Heart / Like Quote Pill */}
      <button
        onClick={handleLike}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          liked
            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-200/30 scale-105"
            : "bg-card-custom border border-border-custom text-foreground/80 hover:bg-rose-50/50 hover:text-rose-600 dark:hover:bg-rose-950/10 dark:hover:text-rose-400 hover:border-rose-300/40 shadow-2xs"
        }`}
        title={liked ? "You liked this quote" : "Like this quote"}
      >
        <Heart className={`h-3.5 w-3.5 transition-transform active:scale-135 duration-300 ${liked ? "fill-rose-500 stroke-rose-600 dark:stroke-rose-400" : ""}`} />
        <span>{likesCount} Likes</span>
      </button>

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
