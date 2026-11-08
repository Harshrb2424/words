import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that apply when you browse Words, submit a quote, or download a wallpaper.",
};

export default function TermsPage() {
  return (
    <StaticPage
      eyebrow="Terms"
      title="Terms of Use"
      subtitle="By using Words, you agree to the simple rules below. The short version: read, share, and be kind."
    >
      <p className="text-xs uppercase tracking-widest text-foreground/40">
        Last updated: November 2026
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">A personal project</h2>
      <p>
        Words is a personal, non-commercial quote archive. The application source code is released
        under the Personal Use License included in the repository. You are welcome to browse the
        archive, share links to quote pages, and download wallpapers for personal use.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Quotes and attribution</h2>
      <p>
        Quotes, excerpts, and related metadata remain the work of their original authors and rights
        holders. Words provides attribution to the best of its ability but does not claim ownership
        of any quoted material. If you believe a quote is misattributed or should be removed,
        please contact me and I will review the request.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Submitting quotes</h2>
      <p>
        When you submit a quote, you confirm that you have the right to share it and that it does
        not violate the law or another person&apos;s rights. Submitted quotes may be edited for
        grammar, formatting, attribution, or clarity before appearing in the archive.
      </p>
      <p>
        Please do not submit spam, abusive content, private information, or material that infringes
        copyright. I may remove any submission at any time.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Acceptable use</h2>
      <ul className="list-disc space-y-2 pl-5 marker:text-accent-custom">
        <li>Do not attempt to disrupt, overload, or gain unauthorized access to the service.</li>
        <li>Do not scrape the archive at a rate that degrades service for other readers.</li>
        <li>Do not use the site to distribute unlawful, hateful, or harmful material.</li>
        <li>Respect the attribution and licensing of quoted works.</li>
      </ul>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">No warranty</h2>
      <p>
        Words is provided “as is” without warranties of any kind. The archive may contain mistakes,
        interruptions, or inaccuracies. I do not guarantee that the service will always be
        available or that every attribution is correct.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, I am not liable for any loss or damage arising from
        your use of Words, including reliance on quotes, metadata, or downloaded images.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Changes</h2>
      <p>
        These terms may be updated as the project evolves. The latest version will always be
        available on this page. Continued use of the site after an update means you accept the
        revised terms.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Contact</h2>
      <p>
        For corrections, removal requests, or licensing questions, please open an issue on the{" "}
        <a
          href="https://github.com/Harshrb2424/words/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-custom underline decoration-accent-custom/30 underline-offset-4 hover:decoration-accent-custom"
        >
          GitHub repository
        </a>{" "}
        or reach out through{" "}
        <a
          href="https://portfolio.harshrb.in"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-custom underline decoration-accent-custom/30 underline-offset-4 hover:decoration-accent-custom"
        >
          my portfolio
        </a>
        .
      </p>
    </StaticPage>
  );
}
