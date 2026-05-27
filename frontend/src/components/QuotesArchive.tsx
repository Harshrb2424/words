"use client";

import { useState } from "react";
import { Quote } from "@/types";
import MasonryGrid from "./MasonryGrid";
import AddQuoteModal from "./AddQuoteModal";
import { Search, Plus, Sparkles, BookOpen, Layers } from "lucide-react";

interface QuotesArchiveProps {
  initialQuotes: Quote[];
}

export default function QuotesArchive({ initialQuotes }: QuotesArchiveProps) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/70 backdrop-blur-md dark:border-zinc-900/60 dark:bg-[#08080a]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Words
              </h1>
              <p className="hidden text-[10px] font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-550 sm:block">
                AI Quote Archive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Whisper Quote</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Intro Hero Section */}
        <section className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50/60 px-3 py-1 text-[11px] font-bold text-amber-800 border border-amber-100/65 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/20">
            <Sparkles className="h-3 w-3" />
            <span>Intelligent Literary Curator</span>
          </div>
          <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            A sanctuary for quiet thoughts.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Words compiles scattered screenshots, highlights, and book excerpts into a beautifully indexed, relational database. Powerered by Cloudflare Workers AI for context enrichment and fuzzy duplicate detection.
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
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pr-4 pl-11 text-sm text-zinc-800 shadow-xs placeholder-zinc-400 outline-none transition-all focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-150 dark:focus:border-zinc-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-zinc-450 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Stats Panel (Desktop only) */}
            <div className="hidden items-center gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-5 py-3 dark:border-zinc-850 dark:bg-zinc-900/20 sm:flex">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Layers className="h-3.5 w-3.5 text-zinc-450" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {filteredQuotes.length}
                </span>
                <span>items shown</span>
              </div>
            </div>
          </div>

          {/* Tag Cloud */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mr-1.5">
                Popular Themes:
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  !selectedTag
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-650 hover:bg-zinc-200 dark:bg-zinc-850 dark:text-zinc-350 dark:hover:bg-zinc-800"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    selectedTag === tag
                      ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-650 hover:bg-zinc-200 dark:bg-zinc-850 dark:text-zinc-350 dark:hover:bg-zinc-800"
                  }`}
                >
                  #{tag}
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
      <footer className="border-t border-zinc-100 py-8 text-center dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-6 text-xs text-zinc-450 dark:text-zinc-500 space-y-1">
          <p>Words — AI Quote Archive & sanctuary.</p>
          <p>Built with Next.js, Cloudflare Workers, D1, Vectorize, and Workers AI.</p>
        </div>
      </footer>

      {/* Whisper Quote Creation Modal */}
      <AddQuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
