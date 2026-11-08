import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Words handles data: no accounts, no tracking cookies, and a small amount of browser storage for preferences.",
};

export default function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Privacy"
      title="Privacy Policy"
      subtitle="Words is built to be read, not to profile you. This page explains the small amount of data the app touches."
    >
      <p className="text-xs uppercase tracking-widest text-foreground/40">
        Last updated: November 2026
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">The short version</h2>
      <p>
        There are no user accounts, no advertising trackers, and no third-party analytics scripts
        on Words. You can browse and search the archive without signing in or handing over an
        email address.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">What is stored</h2>
      <ul className="list-disc space-y-2 pl-5 marker:text-accent-custom">
        <li>
          <strong className="text-foreground">Quotes:</strong> quotes submitted through the app are
          stored in the archive and are publicly visible. They may be cleaned, enriched, or edited
          for formatting and attribution.
        </li>
        <li>
          <strong className="text-foreground">Anonymous likes:</strong> when you like a quote, the
          quote&apos;s like count is incremented. Your browser stores the quote ID locally so the
          same quote is not liked twice from that device.
        </li>
        <li>
          <strong className="text-foreground">Browser storage:</strong> the app uses localStorage
          for your theme preference, liked quote IDs, and quotes you recently submitted so they can
          appear immediately on your device.
        </li>
        <li>
          <strong className="text-foreground">Server logs:</strong> the app runs on Cloudflare,
          which may process standard request metadata (such as IP address, browser information, and
          timestamps) for security, abuse prevention, and reliability under Cloudflare&apos;s own
          policies.
        </li>
      </ul>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">AI processing</h2>
      <p>
        When a new quote is submitted, its text is sent to Cloudflare Workers AI for cleanup and
        metadata extraction. The submission flow may also query public sources such as Wikipedia
        and Mojeek to help identify an author or source. This processing is used to build the
        archive entry, not to create a personal profile.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Cookies and analytics</h2>
      <p>
        Words does not set advertising or analytics cookies. The site may rely on essential
        platform cookies or similar infrastructure mechanisms provided by Cloudflare for security
        and delivery.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">External links</h2>
      <p>
        Pages may link to GitHub, my portfolio, or other external sites. Once you leave Words,
        those sites have their own privacy practices and policies.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Your choices</h2>
      <p>
        You can clear your browser&apos;s localStorage at any time to remove local preferences and
        locally cached submissions. If you would like a quote removed or corrected, please open an
        issue on the GitHub repository or contact me through my portfolio.
      </p>

      <h2 className="pt-2 font-serif text-xl font-bold text-foreground">Contact</h2>
      <p>
        Questions about this policy can be raised through the{" "}
        <a
          href="https://github.com/Harshrb2424/words/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-custom underline decoration-accent-custom/30 underline-offset-4 hover:decoration-accent-custom"
        >
          Words GitHub repository
        </a>{" "}
        or through{" "}
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
