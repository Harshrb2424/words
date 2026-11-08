import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "Harsh RB is a developer and designer who builds thoughtful, fast, and human web experiences. Words is one of them.",
};

const linkClass =
  "inline-flex items-center gap-2 rounded-full border border-border-custom bg-card-custom px-4 py-2 text-xs font-semibold text-foreground/75 transition-all hover:border-accent-custom/50 hover:text-accent-custom";

export default function AboutMePage() {
  return (
    <StaticPage
      eyebrow="About Me"
      title="Harsh RB"
      subtitle="Developer, designer, and collector of sentences. I build calm, useful things for the web."
    >
      <p>
        I am a developer and designer who cares about the small details that make a product feel
        human: clear typography, honest copy, quick interactions, and interfaces that respect the
        person on the other side of the screen.
      </p>

      <p>
        Words began as a personal answer to a simple problem: the lines that matter tend to
        disappear into screenshots, group chats, and forgotten notes. Building a proper home for
        them turned into an excuse to work with edge rendering, serverless data, and AI-assisted
        enrichment without letting any of that machinery become the point.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">What I care about</h2>
      <ul className="list-disc space-y-2 pl-5 marker:text-accent-custom">
        <li>Products that feel quiet, fast, and intentional.</li>
        <li>Design systems that make good typography the default.</li>
        <li>Performance as a form of respect for the reader.</li>
        <li>Privacy: fewer accounts, less tracking, more ownership.</li>
        <li>Storytelling, especially in small details.</li>
      </ul>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Elsewhere</h2>
      <p>
        My portfolio collects the projects, experiments, and case studies I have built. The Words
        source code and deployment notes live on GitHub. If you want to talk about a project,
        suggest a quote, or report something that needs fixing, the links below are the fastest
        way to reach me.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="https://portfolio.harshrb.in"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          portfolio.harshrb.in
        </a>
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
      </div>

      <div className="mt-10 rounded-2xl border border-border-custom bg-card-custom/60 p-6">
        <p className="font-serif text-lg font-semibold text-foreground">A note on the collection</p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/55">
          Words is a personal, non-commercial project. Quotes remain the work of their original
          authors and rights holders. If something is misattributed or you would like a quote
          removed, please open an issue on GitHub or reach out through my portfolio.
        </p>
      </div>
    </StaticPage>
  );
}
