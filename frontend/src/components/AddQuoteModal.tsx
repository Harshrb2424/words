"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

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
    { label: "Vector Ingestion", sublabel: "Generating 768d text embedding...", status: "idle" },
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

  const runMockProgress = async () => {
    // Elegant simulation of steps to coordinate with actual server request
    const updateStep = (index: number, status: StepStatus) => {
      setSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
    };

    updateStep(0, "loading");
    await new Promise(r => setTimeout(r, 800));
    updateStep(0, "success");
    
    updateStep(1, "loading");
    await new Promise(r => setTimeout(r, 900));
    updateStep(1, "success");
    
    updateStep(2, "loading");
    await new Promise(r => setTimeout(r, 1200));
    updateStep(2, "success");
    
    updateStep(3, "loading");
    await new Promise(r => setTimeout(r, 600));
    updateStep(3, "success");
  };

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
        // Find index of step where it failed
        if (response.status === 409) {
          // Deduplication step failed
          setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: "success" } : i === 1 ? { ...s, status: "error" } : { ...s, status: "idle" }));
          throw new Error(data.message || "A highly similar quote already exists in the archive.");
        } else {
          setSteps(prev => prev.map((s, i) => s.status === "loading" ? { ...s, status: "error" } : s));
          throw new Error(data.message || data.error || "Failed to process quote.");
        }
      }

      // Complete all steps positively
      setSteps(prev => prev.map(s => ({ ...s, status: "success" })));
      setSuccessQuote(data.quote);
      
      // Refresh Next.js server components
      router.refresh();
      
      // Auto close after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2500);

    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred during AI indexing.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-150 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Whisper a Quote
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isSubmitting && !successQuote && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-zinc-450 dark:text-zinc-550 mb-2">
                  Paste Raw Text or Clipping
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste a quote here... (e.g., 'In the midst of winter, I found there was, within me, an invincible summer. — Albert Camus')"
                  rows={6}
                  required
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 font-serif text-base leading-relaxed text-zinc-800 placeholder-zinc-400 focus:border-amber-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-150 dark:focus:border-amber-500"
                />
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/40 p-4 text-xs text-rose-700 dark:border-rose-950/10 dark:bg-rose-950/15 dark:text-rose-450">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error:</span> {errorMessage}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <span>Process with Cloudflare AI</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* AI Loader Pipeline Tracker */}
          {isSubmitting && !successQuote && (
            <div className="py-2 space-y-5">
              <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/20">
                  <Sparkles className="h-5 w-5 animate-pulse text-amber-500" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Pipeline Running
                </h4>
                <p className="mt-1 text-xs text-zinc-450 dark:text-zinc-500">
                  The quote is traversing Cloudflare edge AI endpoints...
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div key={step.label} className="flex items-start gap-3.5">
                    <div className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
                      {step.status === "idle" && (
                        <div className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                      )}
                      {step.status === "loading" && (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
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
                        step.status === "loading" ? "text-zinc-800 dark:text-zinc-200" :
                        step.status === "success" ? "text-zinc-500 dark:text-zinc-400" :
                        step.status === "error" ? "text-rose-500" :
                        "text-zinc-400 dark:text-zinc-650"
                      }`}>
                        {step.label}
                      </h5>
                      {step.status === "loading" && (
                        <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                          {step.sublabel}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {errorMessage && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/40 p-4 text-xs text-rose-700 dark:border-rose-950/10 dark:bg-rose-950/15 dark:text-rose-450">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error:</span> {errorMessage}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Screen */}
          {successQuote && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h4 className="mt-4 font-serif text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Enriched & Saved!
              </h4>
              <p className="mt-1.5 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
                Workers AI successfully cataloged this quote by <strong className="text-zinc-700 dark:text-zinc-300">{successQuote.author}</strong> from <strong className="text-zinc-700 dark:text-zinc-300">{successQuote.source}</strong>.
              </p>

              {/* Mini card preview */}
              <div className="mt-5 w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/20 text-left">
                <p className="line-clamp-2 font-serif text-sm italic text-zinc-650 dark:text-zinc-300">
                  “{successQuote.quote_text}”
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {successQuote.tags.map((tag: string) => (
                    <span key={tag} className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-400">
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
