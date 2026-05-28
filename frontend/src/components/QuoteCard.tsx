"use client";

import { Quote } from "@/types";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { getQuoteSlug } from "@/utils/slug";
import { getAccentStyles } from "@/utils/color";

interface QuoteCardProps {
  quote: Quote;
  relatedQuotes?: Quote[];
  onSelectQuote?: (id: number) => void;
  isHighlighted?: boolean;
}

export default function QuoteCard({
  quote,
  isHighlighted = false,
}: QuoteCardProps) {
  const accent = getAccentStyles(quote.color);
  
  const colorHex = quote.color || "#d97706";
  const r = parseInt(colorHex.substring(1, 3), 16) || 217;
  const g = parseInt(colorHex.substring(3, 5), 16) || 119;
  const b = parseInt(colorHex.substring(5, 7), 16) || 6;

  return (
    <div
      id={`quote-${quote.id}`}
      style={{
        ["--quote-accent" as any]: accent.textColor,
        ["--quote-accent-bg" as any]: accent.bgColor,
        ["--quote-accent-border" as any]: accent.borderColor,
        backgroundColor: isHighlighted
          ? accent.bgColor
          : (quote.color
              ? `rgba(${r}, ${g}, ${b}, 0.035)`
              : undefined),
        borderColor: isHighlighted
          ? accent.textColor
          : (quote.color
              ? `rgba(${r}, ${g}, ${b}, 0.18)`
              : undefined),
        boxShadow: isHighlighted ? `0 0 0 2px ${accent.borderColor}` : undefined,
      }}
      className="break-inside-avoid mb-6 w-full rounded-2xl border p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md bg-card-custom border-border-custom hover:border-zinc-400 dark:hover:border-zinc-650 animate-fade-in"
    >
      {/* Quote Body - clickable link to dynamic slug page */}
      <Link href={`/quote/${getQuoteSlug(quote)}`} className="group/quote block relative">
        <span className="absolute -top-3 -left-2 select-none font-serif text-6xl text-zinc-300 dark:text-zinc-850/30 transition-colors group-hover/quote:text-[var(--quote-accent)]">
          “
        </span>
        <blockquote className="relative z-10 font-serif text-xl font-medium leading-relaxed tracking-wide text-foreground transition-colors group-hover/quote:text-[var(--quote-accent)] sm:text-2xl">
          &nbsp;&nbsp;&nbsp;&nbsp;{quote.quote_text}
        </blockquote>
      </Link>

      {/* Quote Footer containing Author signature and dynamic page Link */}
      <div className="mt-5 flex items-center justify-between border-t border-dashed border-border-custom pt-4">
        <div className="flex items-center gap-3">
          <span className="font-serif text-sm italic text-foreground/80">
            - {quote.author || "Unknown"}
          </span>
        </div>
        
        <Link
          href={`/quote/${getQuoteSlug(quote)}`}
          className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-zinc-450 hover:bg-[var(--quote-accent-bg)] hover:text-[var(--quote-accent)] dark:text-zinc-400 transition-all"
          title="Deconstruct quote insight"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
