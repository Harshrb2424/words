"use client";

import React, { useState, useEffect, useRef } from "react";
import { Quote } from "@/types";
import MasonryGrid from "./MasonryGrid";
import Header from "./Header";
import { Search, Sparkles, Loader2, ArrowDown } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

interface QuotesArchiveProps {
  initialQuotes: Quote[];
}

export default function QuotesArchive({ initialQuotes }: QuotesArchiveProps) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Pagination states
  const [offset, setOffset] = useState(initialQuotes.length);
  const [hasMore, setHasMore] = useState(initialQuotes.length === 30);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync state if initialQuotes changes (e.g. server refreshes)
  useEffect(() => {
    setQuotes(initialQuotes);
    setOffset(initialQuotes.length);
    setHasMore(initialQuotes.length === 30);
  }, [initialQuotes]);

  // Load locally user-submitted quotes and prepend them so they show instantly
  useEffect(() => {
    try {
      const localSubmitted = JSON.parse(localStorage.getItem("words_user_submitted_quotes") || "[]") as Quote[];
      if (localSubmitted.length > 0) {
        setQuotes((prev) => {
          const fetchedIds = new Set(prev.map((q) => q.id));
          const uniqueLocal = localSubmitted.filter((q) => !fetchedIds.has(q.id));
          return [...uniqueLocal, ...prev];
        });
      }
    } catch (e) {
      console.warn("Failed to load locally submitted quotes:", e);
    }
  }, []);

  // Extract unique tags for tag pill filters
  const allTags = Array.from(
    new Set(initialQuotes.flatMap((q) => q.tags || []))
  ).slice(0, 12);

  // Shared database query fetcher
  const queryDatabase = async (queryText: string, activeTag: string | null, currentOffset: number, isNewSearch: boolean) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
    
    // Combine search text and tag search
    let searchTerm = queryText;
    if (activeTag) {
      searchTerm = searchTerm ? `${searchTerm} ${activeTag}` : activeTag;
    }

    const limit = 30;
    const url = `${apiUrl}/api/quotes?limit=${limit}&offset=${currentOffset}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ""}`;

    try {
      const response = await fetch(url, {
        headers: { "Accept": "application/json" }
      });
      if (response.ok) {
        const data: Quote[] = await response.json();
        
        if (isNewSearch) {
          setQuotes(data);
          setOffset(data.length);
          setHasMore(data.length === limit);
        } else {
          setQuotes((prev) => [...prev, ...data]);
          setOffset((prev) => prev + data.length);
          setHasMore(data.length === limit);
        }
      }
    } catch (err) {
      console.warn("Failed to query quotes database:", err);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    // Skip initial run to avoid double-fetching what server already loaded
    const isInitialSearchEmpty = searchQuery === "" && selectedTag === null && quotes.length === initialQuotes.length;
    if (isInitialSearchEmpty) return;

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      await queryDatabase(searchQuery, selectedTag, 0, true);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedTag]);

  // Load more page handler
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await queryDatabase(searchQuery, selectedTag, offset, false);
    setIsLoadingMore(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation / Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Intro Hero Section */}
        <section className="mb-12 text-center sm:text-left">
          <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Save and organize quotes, highlights, and book notes.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-foreground/75 leading-relaxed">
            Words helps you build a searchable knowledge library from screenshots, reading highlights, book excerpts, and memorable ideas.
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
                className="w-full rounded-2xl border border-border-custom bg-card-custom py-3.5 pr-12 pl-11 text-sm text-foreground shadow-xs placeholder-foreground/45 outline-none transition-all focus:border-accent-custom"
              />
              {isSearching ? (
                <Loader2 className="absolute top-1/2 right-4 -translate-y-1/2 h-4 w-4 animate-spin text-accent-custom" />
              ) : searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-foreground/60 hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              ) : null}
            </div>

            {/* Quick Stats Panel (Desktop only) */}
            <div className="hidden items-center gap-4 rounded-2xl border border-border-custom bg-card-custom/50 px-5 py-3 sm:flex">
              <div className="flex items-center gap-1.5 text-xs text-foreground/75">
                <span className="font-semibold text-foreground">
                  {quotes.length}
                </span>
                <span>items loaded</span>
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
          <MasonryGrid quotes={quotes} />
        </section>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-12 flex justify-center pb-6">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="group inline-flex items-center gap-2 rounded-full border border-border-custom bg-card-custom px-6 py-3 text-xs font-bold uppercase tracking-wider text-foreground/75 hover:text-foreground hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-accent-custom" />
                  <span>Retrieving Whispers...</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                  <span>Show More Quotes</span>
                </>
              )}
            </button>
          </div>
        )}
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
