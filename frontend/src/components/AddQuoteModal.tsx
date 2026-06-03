"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { getQuoteSlug } from "@/utils/slug";

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StepStatus = "idle" | "loading" | "success" | "error";

interface ProgressStep {
  label: string;
  sublabel: string;
  status: StepStatus;
}

export default function AddQuoteModal({ isOpen, onClose }: AddQuoteModalProps) {
  const router = useRouter();
  const [quotesList, setQuotesList] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successQuote, setSuccessQuote] = useState<any>(null);
  const [successBulk, setSuccessBulk] = useState<{
    total: number;
    successful: number;
    failed: number;
    results: any[];
  } | null>(null);
  
  // Custom pipeline steps to show active AI operations
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: "Web Search RAG Retrieval", sublabel: "Scraping search indexes to resolve origin and provenance context...", status: "idle" },
    { label: "AI Enrichment & Cleanup", sublabel: "Running Llama 3 to polish grammar, assign tags, and generate mood colors...", status: "idle" },
    { label: "Embedding Vector Generation", sublabel: "Generating 768-dimensional mathematical text embedding...", status: "idle" },
    { label: "Fuzzy Deduplication Scan", sublabel: "Comparing cosine similarity against Vectorize index at >0.95 threshold...", status: "idle" },
    { label: "Relational SQL Storage", sublabel: "Committing enriched metadata and related quotes to Cloudflare D1...", status: "idle" },
    { label: "Vector Vectorize Ingest", sublabel: "Upserting final embedding indices into Vectorize database...", status: "idle" },
  ]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form states when modal closes
      setQuotesList([""]);
      setIsSubmitting(false);
      setErrorMessage("");
      setSuccessQuote(null);
      setSuccessBulk(null);
      setSteps(prev => prev.map(s => ({ ...s, status: "idle" })));
    }
  }, [isOpen]);

  const handleQuoteChange = (idx: number, val: string) => {
    setQuotesList(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const addQuoteField = () => {
    setQuotesList(prev => [...prev, ""]);
  };

  const removeQuoteField = (idx: number) => {
    if (quotesList.length <= 1) return;
    setQuotesList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeQuotes = quotesList.map(q => q.trim()).filter(Boolean);
    if (activeQuotes.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessQuote(null);
    setSuccessBulk(null);
    setSteps(prev => prev.map(s => ({ ...s, status: "idle" })));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
    
    // Create parallel tracking controller
    let completedSteps = false;
    const progressPromise = (async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: "loading" } : s));
      await delay(600);
      if (completedSteps) return;
      setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: "success" } : i === 1 ? { ...s, status: "loading" } : s));
      
      await delay(800);
      if (completedSteps) return;
      setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: "success" } : i === 2 ? { ...s, status: "loading" } : s));
      
      await delay(600);
      if (completedSteps) return;
      setSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: "success" } : i === 3 ? { ...s, status: "loading" } : s));
      
      await delay(700);
      if (completedSteps) return;
      setSteps(prev => prev.map((s, i) => i === 3 ? { ...s, status: "success" } : i === 4 ? { ...s, status: "loading" } : s));
      
      await delay(600);
      if (completedSteps) return;
      setSteps(prev => prev.map((s, i) => i === 4 ? { ...s, status: "success" } : i === 5 ? { ...s, status: "loading" } : s));
    })();

    try {
      const isBulk = activeQuotes.length > 1;
      const endpoint = isBulk ? `${apiUrl}/api/quotes/bulk` : `${apiUrl}/api/quotes`;
      const payload = isBulk ? { text: activeQuotes.join("\n\n") } : { text: activeQuotes[0] };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-words-internal": "words-frontend"
        },
        body: JSON.stringify(payload),
      });

      completedSteps = true;
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Deduplication step failed
          setSteps(prev => prev.map((s, i) => 
            i < 3 ? { ...s, status: "success" } : 
            i === 3 ? { ...s, status: "error" } : 
            { ...s, status: "idle" }
          ));
          throw new Error("Duplicate Conflict: A highly similar or identical quote already exists in the archive.");
        } else {
          setSteps(prev => prev.map(s => s.status === "loading" ? { ...s, status: "error" } : s));
          throw new Error(data.message || data.error || "An unexpected error occurred during processing.");
        }
      }

      // Complete all steps positively
      setSteps(prev => prev.map(s => ({ ...s, status: "success" })));

      if (isBulk) {
        setSuccessBulk({
          total: data.summary.total,
          successful: data.summary.successful,
          failed: data.summary.failed,
          results: data.results,
        });

        const successfulQuotes = data.results
          .filter((r: any) => r.status === "success")
          .map((r: any) => r.quote);

        if (successfulQuotes.length > 0) {
          try {
            const localSubmitted = JSON.parse(localStorage.getItem("words_user_submitted_quotes") || "[]");
            localStorage.setItem("words_user_submitted_quotes", JSON.stringify([...successfulQuotes, ...localSubmitted]));
          } catch (e) {
            console.warn("Failed to store quotes locally:", e);
          }
        }

        // Refresh Next.js server components
        router.refresh();

        // Redirect to the first newly created quote page after a slightly longer delay
        setTimeout(() => {
          if (successfulQuotes.length > 0) {
            const slug = getQuoteSlug(successfulQuotes[0]);
            router.push(`/quote/${slug}`);
          }
          onClose();
        }, 3500);

      } else {
        setSuccessQuote(data.quote);
        
        // Save newly created quote to local storage so homepage displays it instantly
        try {
          const localSubmitted = JSON.parse(localStorage.getItem("words_user_submitted_quotes") || "[]");
          localSubmitted.unshift(data.quote);
          localStorage.setItem("words_user_submitted_quotes", JSON.stringify(localSubmitted));
        } catch (e) {
          console.warn("Failed to store quote locally:", e);
        }

        // Refresh Next.js server components
        router.refresh();
        
        // Redirect to the newly created quote page after a brief delay
        setTimeout(() => {
          if (data.quote) {
            const slug = getQuoteSlug(data.quote);
            router.push(`/quote/${slug}`);
          }
          onClose();
        }, 1500);
      }

    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred during AI indexing.");
    }
  };

  const handleGoBack = () => {
    setErrorMessage("");
    setIsSubmitting(false);
    setSteps(prev => prev.map(s => ({ ...s, status: "idle" })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border-custom bg-card-custom shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-custom px-6 py-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-custom animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-foreground">
              Whisper Quotes
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-foreground/50 hover:bg-accent-bg-custom hover:text-accent-custom transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isSubmitting && !successQuote && !successBulk && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                <label className="block text-xs font-bold tracking-widest uppercase text-foreground/60">
                  Paste Raw Texts or Clippings
                </label>
                {quotesList.map((quote, idx) => (
                  <div key={idx} className="relative group space-y-2 border border-border-custom rounded-2xl p-4 bg-background/50 focus-within:border-accent-custom focus-within:bg-card-custom transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-accent-custom">
                        Quote #{idx + 1}
                      </span>
                      {quotesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuoteField(idx)}
                          className="text-foreground/45 hover:text-rose-500 rounded p-1 transition-all cursor-pointer"
                          title="Remove this quote"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={quote}
                      onChange={(e) => handleQuoteChange(idx, e.target.value)}
                      placeholder="Paste your quote here... (e.g., 'In the midst of winter... - Albert Camus')"
                      rows={3}
                      required
                      className="w-full bg-transparent font-serif text-sm leading-relaxed text-foreground placeholder-foreground/35 focus:outline-none resize-none"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuoteField}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border-custom py-3 text-xs font-bold tracking-wider uppercase text-foreground/75 hover:border-accent-custom hover:text-accent-custom hover:bg-accent-bg-custom/30 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Another Quote</span>
              </button>

              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200/50 bg-rose-50/20 p-4 text-xs text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error:</span> {errorMessage}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-background py-3.5 text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
              >
                <span>Process with Cloudflare AI</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* AI Loader Pipeline Tracker */}
          {isSubmitting && !successQuote && !successBulk && (
            <div className="py-2 space-y-5">
              <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-border-custom">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent-bg-custom">
                  <Sparkles className="h-5 w-5 text-accent-custom animate-pulse" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-foreground">
                  Pipeline Running
                </h4>
                <p className="mt-1 text-xs text-foreground/60">
                  {quotesList.filter(q => q.trim()).length > 1 
                    ? `Processing ${quotesList.filter(q => q.trim()).length} quotes sequentially on Cloudflare edge...`
                    : "The quote is traversing Cloudflare edge AI endpoints..."
                  }
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.label} className="flex items-start gap-3.5">
                    <div className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
                      {step.status === "idle" && (
                        <div className="h-2 w-2 rounded-full bg-border-custom" />
                      )}
                      {step.status === "loading" && (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent-custom border-t-transparent" />
                      )}
                      {step.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      {step.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      )}
                    </div>
                    <div>
                      <h5 className={`text-xs font-semibold ${
                        step.status === "loading" ? "text-foreground" :
                        step.status === "success" ? "text-foreground/50" :
                        step.status === "error" ? "text-rose-600 dark:text-rose-450" :
                        "text-foreground/40"
                      }`}>
                        {step.label}
                      </h5>
                      {step.status === "loading" && (
                        <p className="mt-0.5 text-[10px] text-foreground/75 leading-snug">
                          {step.sublabel}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {errorMessage ? (
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-200/50 bg-rose-50/20 p-4 text-xs text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400 animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Error encountered:</span> {errorMessage}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleGoBack}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border-custom bg-card-custom py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-accent-bg-custom hover:text-accent-custom transition-all cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Go Back & Edit Clippings</span>
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Single Success Screen */}
          {successQuote && (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/25">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h4 className="mt-4 font-serif text-lg font-bold text-foreground">
                Enriched & Saved!
              </h4>
              <p className="mt-1.5 max-w-sm text-xs text-foreground/70">
                Workers AI successfully cataloged this quote by <strong className="text-foreground font-semibold">{successQuote.author}</strong> from <strong className="text-foreground font-semibold">{successQuote.source}</strong>.
              </p>

              {/* Mini card preview */}
              <div className="mt-5 w-full rounded-2xl border border-border-custom bg-background/50 p-4 text-left">
                <p className="line-clamp-2 font-serif text-sm italic text-foreground/80">
                  “{successQuote.quote_text}”
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {successQuote.tags.map((tag: string) => (
                    <span key={tag} className="rounded bg-card-custom px-1.5 py-0.5 text-[10px] font-semibold text-accent-custom border border-border-custom">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Success Screen */}
          {successBulk && (
            <div className="flex flex-col items-center py-4 animate-fade-in">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/25">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h4 className="mt-3 font-serif text-lg font-bold text-foreground text-center">
                Bulk Processing Complete
              </h4>
              <p className="mt-1 max-w-sm text-xs text-foreground/70 text-center">
                Successfully processed <strong className="text-emerald-600 font-semibold">{successBulk.successful}</strong> out of <strong className="text-foreground font-semibold">{successBulk.total}</strong> quotes.
              </p>

              {/* List of processed quotes */}
              <div className="mt-5 w-full max-h-[220px] overflow-y-auto space-y-3.5 pr-1">
                {successBulk.results.map((res, index) => (
                  <div 
                    key={index} 
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      res.status === "success" 
                        ? "border-emerald-500/20 bg-emerald-500/5" 
                        : "border-rose-500/20 bg-rose-500/5"
                    }`}
                  >
                    <p className="line-clamp-2 font-serif text-xs italic text-foreground/80">
                      “{res.quote_text}”
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      {res.status === "success" ? (
                        <>
                          <span className="font-semibold text-emerald-600">
                            Saved — {res.quote?.author || "Unknown"}
                          </span>
                          <span className="text-foreground/40 font-semibold">
                            Enriched
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-rose-500 line-clamp-1">
                          Failed: {res.error || "Duplicate Conflict"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
