"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Bookmark, User, Share2, Layers, Calendar } from "lucide-react";
import { Quote } from "@/types";
import { getQuoteSlug } from "@/utils/slug";
import { getAccentStyles } from "@/utils/color";
import QuoteActions from "./QuoteActions";
import WallpaperModal from "@/components/WallpaperModal";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Header from "@/components/Header";

interface QuoteDetailContentProps {
  quote: Quote;
  relatedQuotes: Quote[];
}

export default function QuoteDetailContent({ quote, relatedQuotes }: QuoteDetailContentProps) {
  const [isWallpaperOpen, setIsWallpaperOpen] = useState(false);
  const accent = getAccentStyles(quote.color);

  return (
    <div
      style={{
        ["--quote-accent" as any]: accent.textColor,
        ["--quote-accent-bg" as any]: accent.bgColor,
        ["--quote-accent-border" as any]: accent.borderColor,
      }}
      className="flex flex-col min-h-screen transition-colors duration-300 relative overflow-hidden"
    >
      {/* Subtle dynamic background glow spot */}
      {quote.color && (
        <div 
          style={{
            backgroundImage: `radial-gradient(circle at 50% 0%, rgba(${parseInt(quote.color.substring(1,3), 16) || 217}, ${parseInt(quote.color.substring(3,5), 16) || 119}, ${parseInt(quote.color.substring(5,7), 16) || 6}, 0.08) 0%, transparent 65%)`
          }}
          className="absolute top-0 left-0 right-0 h-[480px] pointer-events-none z-0"
        />
      )}

      {/* Header Bar */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8 md:py-12 relative z-10">
        {/* Minimal Back Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border-custom bg-card-custom px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground hover:border-zinc-400 dark:hover:border-zinc-650 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </Link>
        </div>

        <article className="space-y-10 animate-fade-in">
          {/* Immersive Quote Box */}
          <div 
            style={{
              backgroundColor: quote.color 
                ? `rgba(${parseInt(quote.color.substring(1,3), 16) || 217}, ${parseInt(quote.color.substring(3,5), 16) || 119}, ${parseInt(quote.color.substring(5,7), 16) || 6}, 0.04)`
                : undefined,
              borderColor: quote.color
                ? `rgba(${parseInt(quote.color.substring(1,3), 16) || 217}, ${parseInt(quote.color.substring(3,5), 16) || 119}, ${parseInt(quote.color.substring(5,7), 16) || 6}, 0.25)`
                : undefined,
              boxShadow: quote.color
                ? `0 12px 30px -10px rgba(${parseInt(quote.color.substring(1,3), 16) || 217}, ${parseInt(quote.color.substring(3,5), 16) || 119}, ${parseInt(quote.color.substring(5,7), 16) || 6}, 0.08)`
                : undefined,
            }}
            className="relative rounded-3xl border border-border-custom bg-card-custom p-8 md:p-12 shadow-sm"
          >
            <span className="absolute top-6 left-6 select-none font-serif text-4xl sm:text-8xl text-zinc-300/40 dark:text-zinc-400">
              “
            </span>
            <blockquote className="relative z-10 font-serif text-2xl md:text-3.5xl font-medium leading-relaxed tracking-wide text-foreground">
              &nbsp;&nbsp;&nbsp;{quote.quote_text}
            </blockquote>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-dashed border-border-custom pt-6">
              <div className="flex items-center gap-2.5">
                <span className="font-serif text-lg italic font-medium text-foreground/90">
                  - {quote.author || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Interactive Action Suite */}
          <QuoteActions quote={quote} onOpenWallpaper={() => setIsWallpaperOpen(true)} />

          {/* Details & Insights Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Meta facts */}
            <div className="rounded-2xl border border-border-custom bg-card-custom/50 p-5 space-y-4 md:col-span-1">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-foreground/60">
                Provenance
              </h3>
              
              <div className="space-y-3.5 text-xs text-foreground/80">
                <div className="flex items-start gap-2">
                  <Bookmark className="mt-0.5 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <div>
                    <span className="block font-semibold text-foreground">Source</span>
                    <span className="italic dark:text-zinc-400">{quote.source || "Unknown"}</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Layers className="mt-0.5 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <div>
                    <span className="block font-semibold text-foreground">Language</span>
                    <span className="dark:text-zinc-400">{quote.language || "English"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <div>
                    <span className="block font-semibold text-foreground">Archive Index</span>
                    <span className="font-mono dark:text-zinc-400">#000{quote.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Deeper Meaning */}
            <div className="rounded-2xl border border-[var(--quote-accent-border)] bg-[var(--quote-accent-bg)] p-5 md:col-span-2 relative overflow-hidden">
              <div className="absolute top-4 right-4 select-none">
                <Sparkles className="h-4.5 w-4.5 text-[var(--quote-accent)] animate-pulse" />
              </div>

              <h3 className="text-[10px] font-bold tracking-widest uppercase text-[var(--quote-accent)] flex items-center gap-1">
                <span>AI Literary Insight</span>
              </h3>

              <p className="mt-3.5 text-sm leading-relaxed text-foreground/90">
                {quote.ai_context || "This quote invites deep reflection on the nature of existence and the quiet spaces within human experience."}
              </p>

              {/* Tags Pills inside Insight card */}
              {quote.tags && quote.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5 pt-3 border-t border-dashed border-border-custom">
                  {quote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-[var(--quote-accent-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--quote-accent)] border border-[var(--quote-accent-border)]/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Similar Reflections Section */}
          {relatedQuotes && relatedQuotes.length > 0 && (
            <section className="space-y-4 pt-6 border-t border-border-custom">
              <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/60 flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                <span>Resonant Whispers</span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {relatedQuotes.map((simQuote) => (
                  <Link
                    key={simQuote.id}
                    href={`/quote/${getQuoteSlug(simQuote)}`}
                    className="group block rounded-2xl border border-border-custom bg-card-custom p-5 transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:-translate-y-0.5"
                  >
                    <p className="line-clamp-3 font-serif text-base italic leading-relaxed text-foreground/80 group-hover:text-accent-custom">
                      “{simQuote.quote_text}”
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-foreground/60">
                      <span className="font-serif italic group-hover:text-accent-custom">
                        - {simQuote.author}
                      </span>
                      <span className="font-mono">#000{simQuote.id}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-custom py-10 text-center">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-4 text-xs text-zinc-550 dark:text-zinc-450">
          <ThemeSwitcher />
          <div className="space-y-1">
            <p>Words - AI Quote Archive & sanctuary.</p>
            <p>Built with Next.js, Cloudflare Workers, D1, Vectorize, and Workers AI.</p>
          </div>
        </div>
      </footer>


      {/* Wallpaper Creator Overlay Modal - Rendered at direct root of the page! */}
      <WallpaperModal
        isOpen={isWallpaperOpen}
        onClose={() => setIsWallpaperOpen(false)}
        quote={quote}
      />
    </div>
  );
}
