"use client";

import { useState } from "react";
import { Quote } from "@/types";
import { Sparkles, Bookmark, User, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";

interface QuoteCardProps {
  quote: Quote;
  relatedQuotes: Quote[];
  onSelectQuote?: (id: number) => void;
  isHighlighted?: boolean;
}

export default function QuoteCard({
  quote,
  relatedQuotes,
  onSelectQuote,
  isHighlighted = false,
}: QuoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      id={`quote-${quote.id}`}
      className={`break-inside-avoid mb-6 w-full rounded-2xl border bg-white p-6 shadow-xs transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900/60 dark:backdrop-blur-md ${
        isHighlighted
          ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20 dark:border-amber-500 dark:ring-amber-500/20"
          : "border-zinc-200/80 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700"
      } animate-fade-in`}
    >
      {/* Quote Body */}
      <div className="relative">
        <span className="absolute -top-3 -left-2 select-none font-serif text-6xl text-zinc-150 dark:text-zinc-800/40">
          “
        </span>
        <blockquote className="relative z-10 font-serif text-xl font-medium leading-relaxed tracking-wide text-zinc-850 dark:text-zinc-100 sm:text-2xl">
          {quote.quote_text}
        </blockquote>
      </div>

      {/* Expand Trigger Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className="font-serif text-sm italic text-zinc-500 dark:text-zinc-400">
            — {quote.author || "Unknown"}
          </span>
        </div>
        <button
          onClick={handleToggle}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-zinc-600 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-450 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
        >
          {isExpanded ? (
            <>
              <span>Collapse</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <span>Dive Deeper</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Smooth Expansion Content */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-5 border-t border-dashed border-zinc-200 pt-5 dark:border-zinc-800">
            
            {/* Meta: Author & Source */}
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Author:</span>
                <span>{quote.author || "Unknown"}</span>
              </div>
              {quote.source && quote.source !== "Unknown" && (
                <div className="flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Source:</span>
                  <span className="italic">{quote.source}</span>
                </div>
              )}
            </div>

            {/* AI Insights & Context */}
            {quote.ai_context && (
              <div className="relative overflow-hidden rounded-xl border border-amber-100 bg-amber-50/30 p-4 dark:border-amber-950/20 dark:bg-amber-950/10">
                <div className="absolute top-3 right-3 select-none">
                  <Sparkles className="h-4 w-4 text-amber-500/60 dark:text-amber-500/40" />
                </div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-amber-800 dark:text-amber-400">
                  AI Context
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-750 dark:text-zinc-300">
                  {quote.ai_context}
                </p>
              </div>
            )}

            {/* Tags Pills */}
            {quote.tags && quote.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {quote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-650 dark:bg-zinc-800/80 dark:text-zinc-350"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Similar Quotes Section */}
            {relatedQuotes && relatedQuotes.length > 0 && (
              <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800/50">
                <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-zinc-550 dark:text-zinc-400">
                  <LinkIcon className="h-3 w-3" />
                  Similar Quotes
                </h4>
                <div className="mt-2.5 space-y-2">
                  {relatedQuotes.map((simQuote) => (
                    <button
                      key={simQuote.id}
                      onClick={() => onSelectQuote?.(simQuote.id)}
                      className="group flex w-full flex-col rounded-lg border border-zinc-100/60 bg-zinc-50/50 p-3 text-left transition-all duration-300 hover:border-zinc-200 hover:bg-zinc-100/60 dark:border-zinc-800/40 dark:bg-zinc-950/20 dark:hover:border-zinc-750 dark:hover:bg-zinc-900/60"
                    >
                      <p className="line-clamp-2 font-serif text-sm italic text-zinc-700 group-hover:text-zinc-950 dark:text-zinc-300 dark:group-hover:text-zinc-100">
                        “{simQuote.quote_text}”
                      </p>
                      <span className="mt-1.5 self-end text-[10px] text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-450">
                        — {simQuote.author}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
