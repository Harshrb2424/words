import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Ways to reach Harsh RB about Words: GitHub issues, the repository, or the portfolio.",
};

const linkClass =
  "inline-flex items-center gap-2 rounded-full border border-border-custom bg-card-custom px-4 py-2 text-xs font-semibold text-foreground/75 transition-all hover:border-accent-custom/50 hover:text-accent-custom";

export default function ContactPage() {
  return (
    <StaticPage
      eyebrow="Contact"
      title="Let’s talk about words."
      subtitle="Corrections, quote removals, collaborations, or a line you think belongs in the archive — all of it is welcome."
    >
      <p>
        Words is a small personal project, so the fastest way to reach me is through GitHub or my
        portfolio. If something is broken, misattributed, or missing, an issue with a link and a
        short description is perfect.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="https://github.com/Harshrb2424/words/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-border-custom bg-card-custom/60 p-5 transition-all hover:border-accent-custom/50 hover:-translate-y-0.5"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/40">
            Best for fixes
          </p>
          <p className="mt-2 font-serif text-lg font-semibold text-foreground group-hover:text-accent-custom">
            Open a GitHub issue
          </p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/55">
            Bug reports, attribution corrections, quote removal requests, and feature ideas.
          </p>
        </a>

        <a
          href="https://portfolio.harshrb.in"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-border-custom bg-card-custom/60 p-5 transition-all hover:border-accent-custom/50 hover:-translate-y-0.5"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/40">
            Best for projects
          </p>
          <p className="mt-2 font-serif text-lg font-semibold text-foreground group-hover:text-accent-custom">
            Visit my portfolio
          </p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/55">
            Collaboration, design and development work, or a longer conversation.
          </p>
        </a>
      </div>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Elsewhere</h2>
      <div className="flex flex-wrap gap-3">
        <a
          href="https://github.com/Harshrb2424"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          GitHub Profile
        </a>
        <a
          href="https://github.com/Harshrb2424/words"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Words Repository
        </a>
        <a
          href="https://portfolio.harshrb.in"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          portfolio.harshrb.in
        </a>
      </div>

      <p className="pt-4 text-xs leading-relaxed text-foreground/45">
        Please include the quote ID or page URL when writing about a specific entry. It makes
        corrections much easier to trace.
      </p>
    </StaticPage>
  );
}
