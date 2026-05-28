"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

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
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successQuote, setSuccessQuote] = useState<any>(null);
  
  // Custom pipeline steps to show active AI operations
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: "Vector Ingestion", sublabel: "Generating 768-dimensional text embedding...", status: "idle" },
    { label: "Fuzzy Deduplication", sublabel: "Scanning Vectorize index at >95% threshold...", status: "idle" },
    { label: "AI Enrichment", sublabel: "Instructing Llama 3 to analyze author, context, and tags...", status: "idle" },
    { label: "Relational Storage", sublabel: "Saving SQL records in Cloudflare D1...", status: "idle" },
  ]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form states when modal closes
      setText("");
      setIsSubmitting(false);
      setErrorMessage("");
      setSuccessQuote(null);
      setSteps(prev => prev.map(s => ({ ...s, status: "idle" })));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessQuote(null);
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
      
      await delay(700);
      if (completedSteps) return;
      setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: "success" } : i === 2 ? { ...s, status: "loading" } : s));
      
      await delay(1000);
      if (completedSteps) return;
      setSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: "success" } : i === 3 ? { ...s, status: "loading" } : s));
    })();

    try {
      const response = await fetch(`${apiUrl}/api/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      completedSteps = true;
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Deduplication step failed
          setSteps(prev => prev.map((s, i) => 
            i === 0 ? { ...s, status: "success" } : 
            i === 1 ? { ...s, status: "error" } : 
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
      setSuccessQuote(data.quote);
      
      // Refresh Next.js server components
      router.refresh();
      
      // Auto close after 2.5 seconds on success
      setTimeout(() => {
        onClose();
      }, 2500);

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
              Whisper a Quote
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
          {!isSubmitting && !successQuote && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-foreground/60 mb-2">
                  Paste Raw Text or Clipping
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste a quote here... (e.g., 'In the midst of winter, I found there was, within me, an invincible summer. - Albert Camus')"
                  rows={6}
                  required
                  className="w-full rounded-2xl border border-border-custom bg-background/50 p-4 font-serif text-base leading-relaxed text-foreground placeholder-foreground/35 focus:border-accent-custom focus:bg-card-custom focus:outline-none transition-all"
                />
              </div>

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
          {isSubmitting && !successQuote && (
            <div className="py-2 space-y-5">
              <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-border-custom">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent-bg-custom">
                  <Sparkles className="h-5 w-5 animate-spin text-accent-custom" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-foreground">
                  Pipeline Running
                </h4>
                <p className="mt-1 text-xs text-foreground/60">
                  The quote is traversing Cloudflare edge AI endpoints...
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((step, idx) => (
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
                    <span>Go Back & Edit Clipping</span>
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Success Screen */}
          {successQuote && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
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
        </div>
      </div>
    </div>
  );
}
