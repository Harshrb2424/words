"use client";

import { useState } from "react";
import { Quote } from "@/types";
import MasonryGrid from "./MasonryGrid";
import Header from "./Header";
import { Search, Sparkles, Layers } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

interface QuotesArchiveProps {
  initialQuotes: Quote[];
}

export default function QuotesArchive({ initialQuotes }: QuotesArchiveProps) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Sync state if props change (e.g., after router refresh on submit)
  if (initialQuotes.length !== quotes.length) {
    setQuotes(initialQuotes);
  }

  // Get all unique tags from quotes to build a tag cloud
  const allTags = Array.from(
    new Set(initialQuotes.flatMap((q) => q.tags || []))
  ).slice(0, 12); // display top 12 tags

  // Filter quotes based on search input and active tag selection
  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      searchQuery === "" ||
      quote.quote_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || quote.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation / Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Intro Hero Section */}
        <section className="mb-12 text-center sm:text-left">
          <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            A sanctuary for quiet thoughts.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-foreground/75 leading-relaxed">
            Words compiles scattered screenshots, highlights, and book excerpts into a beautifully indexed, relational database. Powered by Cloudflare Workers AI for context enrichment and fuzzy duplicate detection.
          </p>
        </section>

        {/* Filter Controls (Search + Tags) */}
        <section className="mb-10 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quotes, authors, source themes, or tags..."
                className="w-full rounded-2xl border border-border-custom bg-card-custom py-3.5 pr-4 pl-11 text-sm text-foreground shadow-xs placeholder-foreground/45 outline-none transition-all focus:border-accent-custom"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-foreground/60 hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Stats Panel (Desktop only) */}
            <div className="hidden items-center gap-4 rounded-2xl border border-border-custom bg-card-custom/50 px-5 py-3 sm:flex">
              <div className="flex items-center gap-1.5 text-xs text-foreground/75">
                <span className="font-semibold text-foreground">
                  {filteredQuotes.length}
                </span>
                <span>items shown</span>
              </div>
            </div>
          </div>

          {/* Tag Cloud */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/50 mr-1.5">
                Popular Themes:
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  !selectedTag
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "bg-card-custom border border-border-custom text-foreground/80 hover:bg-accent-bg-custom hover:text-accent-custom hover:border-accent-custom/50"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    selectedTag === tag
                      ? "bg-foreground text-background font-semibold shadow-xs"
                      : "bg-card-custom border border-border-custom text-foreground/80 hover:bg-accent-bg-custom hover:text-accent-custom hover:border-accent-custom/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Masonry Grid Display */}
        <section className="min-h-[300px]">
          <MasonryGrid quotes={filteredQuotes} />
        </section>
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

    </div>
  );
}
