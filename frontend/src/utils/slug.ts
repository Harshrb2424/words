/**
 * Standard utility to generate SEO-friendly slugs for quotes.
 * It removes special characters, converts to lowercase, limits the length, and appends the quote ID.
 */
export function getQuoteSlug(quote: { id: number; quote_text: string }): string {
  const cleanText = quote.quote_text
    .toLowerCase()
    // Remove non-alphanumeric except spaces, hyphens, and underscores
    .replace(/[^\w\s-]/g, "")
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Collapse multiple hyphens into a single hyphen
    .replace(/-+/g, "-")
    // Trim hyphens from ends
    .replace(/^-+|-+$/g, "")
    .trim()
    .substring(0, 50); // limit length to keep URLs concise
  
  return `${cleanText || "quote"}-${quote.id}`;
}

/**
 * Extracts the dynamic quote ID from a slug string.
 */
export function extractIdFromSlug(slug: string): number {
  const parts = slug.split("-");
  const idStr = parts[parts.length - 1];
  const id = parseInt(idStr, 10);
  return isNaN(id) ? -1 : id;
}
