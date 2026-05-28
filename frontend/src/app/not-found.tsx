import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center select-none relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent-custom/5 dark:bg-accent-custom/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center max-w-md animate-fade-in">
        {/* Elegant Animated Compass Icon */}
        <div className="relative mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent-bg-custom border border-border-custom text-accent-custom animate-pulse shadow-sm">
          <Compass className="h-10 w-10 stroke-[1.25] animate-[spin_10s_linear_infinite]" />
        </div>

        {/* 404 Heading */}
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-custom mb-3">
          Error 404
        </span>
        
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
          Lost in the Sanctuary
        </h1>
        
        {/* Poetic Quote */}
        <p className="font-serif italic text-base leading-relaxed text-foreground/60 mb-8 border-l-2 border-border-custom pl-4 py-1 text-left">
          “Not all those who wander are lost.” <br />
          <span className="text-xs font-sans tracking-wide uppercase font-bold text-foreground/45 not-italic mt-1.5 block">— J.R.R. Tolkien</span>
        </p>

        <p className="text-sm leading-relaxed text-foreground/50 mb-10 max-w-sm">
          The words you are seeking have drifted beyond the boundaries of this collection. Perhaps they will find their way back in another whisper.
        </p>

        {/* Return Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Return to Sanctuary</span>
        </Link>
      </div>
    </div>
  );
}
