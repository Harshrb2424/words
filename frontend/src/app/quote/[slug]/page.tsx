import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Quote } from "@/types";
import { extractIdFromSlug, getQuoteSlug } from "@/utils/slug";
import QuoteDetailContent from "./QuoteDetailContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

/**
 * Generate SEO-rich dynamic metadata for the quote details page.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

  if (id === -1) {
    return { title: "sanctuary - Words" };
  }

  try {
    const res = await fetch(`${apiUrl}/api/quotes/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const quote: Quote = await res.json();
      const cleanQuote = quote.quote_text.length > 50 
        ? `${quote.quote_text.substring(0, 48)}...` 
        : quote.quote_text;
      
      return {
        title: `“${cleanQuote}” — ${quote.author || "Unknown"} | Words Sanctuary`,
        description: quote.ai_context || `Reflections on a quote by ${quote.author}.`,
        openGraph: {
          title: `Quote by ${quote.author || "Unknown"}`,
          description: quote.quote_text,
        }
      };
    }
  } catch (err) {
    // ignore
  }

  return { title: "sanctuary - Words" };
}

export default async function QuotePage({ params }: PageProps) {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

  if (id === -1) {
    notFound();
  }

  let quote: Quote | null = null;
  try {
    const res = await fetch(`${apiUrl}/api/quotes/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      quote = await res.json();
    }
  } catch (err) {
    console.error("Failed to retrieve quote details:", err);
  }

  if (!quote) {
    notFound();
  }

  // Fetch similar quotes if available
  let relatedQuotes: Quote[] = [];
  if (quote.related_quote_ids && quote.related_quote_ids.length > 0) {
    try {
      relatedQuotes = await Promise.all(
        quote.related_quote_ids.map(async (rId: number) => {
          try {
            const res = await fetch(`${apiUrl}/api/quotes/${rId}`, { next: { revalidate: 3600 } });
            if (res.ok) return await res.json() as Quote;
          } catch (e) {
            // ignore
          }
          return null;
        })
      ).then((items) => items.filter((item): item is Quote => item !== null));
    } catch (err) {
      console.warn("Failed to retrieve related quotes details:", err);
    }
  }

  return <QuoteDetailContent quote={quote} relatedQuotes={relatedQuotes} />;
}
