import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Words is a quiet, edge-native archive for quotes, highlights, book notes, and the ideas worth returning to.",
};

const buttonClass =
  "inline-flex items-center gap-2 rounded-full border border-border-custom bg-card-custom px-4 py-2 text-xs font-semibold text-foreground/75 transition-all hover:border-accent-custom/50 hover:text-accent-custom";

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="About Words"
      title="A quiet sanctuary for language."
      subtitle="Words is a searchable archive for the lines that stay with us: quotes, reading highlights, book notes, and small pieces of wisdom worth keeping close."
    >
      <p>
        The internet is excellent at giving us more to read and terrible at helping us remember
        what mattered. Words exists to slow that down. It is a personal library for the sentences
        that change the temperature of a day, gathered in one calm, typographic place.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Why it exists</h2>
      <p>
        Most quote sites are crowded with ads, clumsy galleries, and unattributed screenshots.
        Words takes the opposite approach: a clean reading surface, generous type, useful themes,
        and a search that actually finds the line you half-remember. Every quote keeps its author
        and source close at hand.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">What you can do</h2>
      <ul className="list-disc space-y-2 pl-5 marker:text-accent-custom">
        <li>Browse a curated archive of anime, cinema, philosophy, and timeless popular quotes.</li>
        <li>Search by quote text, author, source, or theme, then filter with the tag pills.</li>
        <li>Submit a new quote and let the ingestion pipeline clean and enrich it.</li>
        <li>Export any quote as a high-resolution wallpaper for a phone or desktop.</li>
        <li>Share a dedicated quote page with a rich social preview.</li>
      </ul>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">How it is built</h2>
      <p>
        The interface is a Next.js application rendered at the edge and styled with Tailwind CSS.
        The API runs on Cloudflare Workers, with D1 for the relational archive, Vectorize for
        semantic similarity, and Workers AI for quote enrichment. The result is a small, fast
        system that stays out of the way of the words.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">A few principles</h2>
      <ul className="list-disc space-y-2 pl-5 marker:text-accent-custom">
        <li>Typography first: the quote should feel like the main event.</li>
        <li>Attribution always: credit the author and the source whenever they are known.</li>
        <li>No accounts, no tracking cookies, no noisy dashboards.</li>
        <li>Small and fast beats large and clever.</li>
      </ul>

      <div className="mt-8 rounded-2xl border border-border-custom bg-card-custom/60 p-6">
        <p className="font-serif text-lg font-semibold text-foreground">
          Read the source, or explore more of my work.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/55">
          Words is an open personal project. The code, deployment notes, and design decisions
          live on GitHub.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="https://github.com/Harshrb2424/words"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            GitHub Repository
          </a>
          <a
            href="https://portfolio.harshrb.in"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            Portfolio
          </a>
          <Link href="/about-me" className={buttonClass}>
            About Me
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
