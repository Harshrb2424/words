"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

function GithubMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

const linkClass =
  "inline-flex items-center gap-2 text-xs text-foreground/60 transition-colors hover:text-accent-custom";
const headingClass =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/40";

export default function Footer() {
  return (
    <footer className="border-t border-border-custom bg-card-custom/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="font-serif text-xl font-bold tracking-tight text-foreground transition-colors hover:text-accent-custom"
            >
              Words
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-foreground/55">
              A quiet archive for quotes, highlights, and the ideas worth returning to.
            </p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/35">
              words.harshrb.in
            </p>
          </div>

          <div>
            <h3 className={headingClass}>Archive</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/" className={linkClass}>Home</Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>About Us</Link>
              </li>
              <li>
                <Link href="/about-me" className={linkClass}>About Me</Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Legal</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/privacy" className={linkClass}>Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className={linkClass}>Terms of Use</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Connect</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="https://github.com/Harshrb2424/words"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <GithubMark className="h-3.5 w-3.5" />
                  GitHub Repo
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Harshrb2424"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <GithubMark className="h-3.5 w-3.5" />
                  GitHub Profile
                </a>
              </li>
              <li>
                <a
                  href="https://portfolio.harshrb.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Portfolio
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border-custom pt-6 text-[11px] text-foreground/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Words. Curated with care by Harsh RB.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Built with Next.js + Cloudflare</span>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
