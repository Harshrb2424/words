"use client";

import { useState } from "react";
import { Quote } from "@/types";
import QuoteCard from "./QuoteCard";

interface MasonryGridProps {
  quotes: Quote[];
}

export default function MasonryGrid({ quotes }: MasonryGridProps) {
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  // Map quotes by ID for fast O(1) lookup
  const quotesMap = new Map(quotes.map((q) => [q.id, q]));

  const handleSelectRelatedQuote = (id: number) => {
    // Scroll targeted quote into view
    const targetElement = document.getElementById(`quote-${id}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Temporarily highlight the quote card
      setHighlightedId(id);
      setTimeout(() => {
        setHighlightedId(null);
      }, 3000);
    }
  };

  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-serif text-lg text-zinc-500 dark:text-zinc-400">
          No whispers in the archive yet.
        </p>
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          Be the first to submit a quote above.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:_balance]">
      {quotes.map((quote) => {
        // Resolve the actual quote objects for the related IDs
        const relatedQuotes = (quote.related_quote_ids || [])
          .map((id) => quotesMap.get(id))
          .filter((q): q is Quote => !!q);

        return (
          <QuoteCard
            key={quote.id}
            quote={quote}
            relatedQuotes={relatedQuotes}
            onSelectQuote={handleSelectRelatedQuote}
            isHighlighted={highlightedId === quote.id}
          />
        );
      })}
    </div>
  );
}
