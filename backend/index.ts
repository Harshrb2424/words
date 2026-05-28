/**
 * Words - AI-Powered Quote Archive Backend
 * Built on Cloudflare Workers, D1, Vectorize, and Workers AI.
 */

export interface Env {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  AI: any; // Workers AI binding
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

/**
 * Interface representing the structured response from LLM
 */
interface QuoteMetadata {
  author: string;
  source: string;
  language: string;
  ai_context: string;
  tags: string[];
  cleaned_text?: string;
  color?: string;
}

// Global in-memory cache for GET requests (purged on writes)
const readCache = new Map<string, { body: string; headers: [string, string][]; status: number; expiry: number }>();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Clear cache on any state mutation request
    if (request.method === "POST" || request.method === "DELETE" || request.method === "PUT") {
      console.log(`State-modifying request detected: ${request.method} ${url.pathname}. Invalidating in-memory cache.`);
      readCache.clear();
    }

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // Check in-memory cache for GET requests
    const cacheKey = `${request.method}:${url.pathname}:${url.search}`;
    if (request.method === "GET" && !url.pathname.includes("/api/quotes/bulk")) {
      const cached = readCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        console.log(`Cache HIT for key: ${cacheKey}`);
        const headersInit: Record<string, string> = {};
        for (const [k, v] of cached.headers) {
          headersInit[k] = v;
        }
        return new Response(cached.body, {
          status: cached.status,
          headers: headersInit,
        });
      }
      console.log(`Cache MISS for key: ${cacheKey}`);
    }

    // Process actual request
    const response = await this.handleActualFetch(request, env, ctx, url);

    // Cache successful GET responses for 1 hour
    if (request.method === "GET" && response.status === 200 && !url.pathname.includes("/api/quotes/bulk")) {
      const clone = response.clone();
      ctx.waitUntil((async () => {
        try {
          const bodyText = await clone.text();
          const headersList: [string, string][] = [];
          response.headers.forEach((value, key) => {
            headersList.push([key, value]);
          });
          readCache.set(cacheKey, {
            body: bodyText,
            headers: headersList,
            status: response.status,
            expiry: Date.now() + 3600000, // 1 hour
          });
          console.log(`Cached response successfully for key: ${cacheKey}`);
        } catch (e) {
          console.warn("Failed to cache response body:", e);
        }
      })());
    }

    return response;
  },

  async handleActualFetch(request: Request, env: Env, ctx: ExecutionContext, url: URL): Promise<Response> {
    try {
      // Route routing
      if (url.pathname === "/api/quotes" || url.pathname === "/") {
        if (request.method === "GET") {
          return await handleGetQuotes(env, url);
        } else if (request.method === "POST") {
          return await handlePostQuote(request, env);
        } else {
          return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }
      }

      // Bulk quotes creation
      if (url.pathname === "/api/quotes/bulk") {
        if (request.method === "POST") {
          return await handleBulkPostQuotes(request, env);
        } else {
          return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }
      }

      // Maintenance: Reindex database & polish grammar
      if (url.pathname === "/api/maintenance/reindex") {
        if (request.method === "POST" || request.method === "GET") {
          return await handleMaintenanceReindex(env);
        } else {
          return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }
      }

      // Liking quote: POST /api/quotes/:id/like
      if (url.pathname.startsWith("/api/quotes/") && url.pathname.endsWith("/like")) {
        const parts = url.pathname.split("/");
        const idStr = parts[3];
        const id = idStr ? parseInt(idStr) : NaN;
        if (isNaN(id)) {
          return new Response(JSON.stringify({ error: "Invalid ID for liking" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        if (request.method === "POST") {
          return await handleLikeQuote(id, env);
        } else {
          return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }
      }

      // Single quote retrieval by ID
      if (url.pathname.startsWith("/api/quotes/")) {
        const idStr = url.pathname.split("/").pop();
        const id = idStr ? parseInt(idStr) : NaN;
        if (isNaN(id)) {
          return new Response(JSON.stringify({ error: "Invalid ID" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        if (request.method === "GET") {
          return await handleGetQuoteById(id, env);
        } else if (request.method === "DELETE") {
          return await handleDeleteQuote(id, env);
        }
      }

      // 404 Not Found
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });

    } catch (err: any) {
      console.error("Global Error Handler:", err);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: err.message || String(err),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        }
      );
    }
  },
};

/**
 * Handle GET /api/quotes
 * Fetches all quotes from Cloudflare D1
 */
async function handleGetQuotes(env: Env, url: URL): Promise<Response> {
  try {
    const limit = parseInt(url.searchParams.get("limit") || "1000");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const q = url.searchParams.get("q") || "";

    let query = "SELECT * FROM quotes";
    const binds: any[] = [];

    if (q) {
      query += " WHERE quote_text LIKE ? OR author LIKE ? OR source LIKE ? OR tags LIKE ?";
      const searchWildcard = `%${q}%`;
      binds.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    query += " ORDER BY id DESC LIMIT ? OFFSET ?";
    binds.push(limit, offset);

    const { results } = await env.DB.prepare(query).bind(...binds).all();

    // Parse JSON fields in database results for standard frontend usage
    const parsedResults = results.map((row: any) => ({
      ...row,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
      related_quote_ids: typeof row.related_quote_ids === "string" ? JSON.parse(row.related_quote_ids) : row.related_quote_ids,
    }));

    return new Response(JSON.stringify(parsedResults), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (error: any) {
    console.error("Error fetching quotes from D1:", error);
    return new Response(
      JSON.stringify({ error: "Database error", message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }
}

/**
 * Handle GET /api/quotes/:id
 */
async function handleGetQuoteById(id: number, env: Env): Promise<Response> {
  try {
    const quote = await env.DB.prepare("SELECT * FROM quotes WHERE id = ?").bind(id).first();
    if (!quote) {
      return new Response(JSON.stringify({ error: "Quote not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const parsedQuote = {
      ...quote,
      tags: typeof quote.tags === "string" ? JSON.parse(quote.tags) : quote.tags,
      related_quote_ids: typeof quote.related_quote_ids === "string" ? JSON.parse(quote.related_quote_ids) : quote.related_quote_ids,
    };

    return new Response(JSON.stringify(parsedQuote), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (error: any) {
    console.error(`Error fetching quote with ID ${id}:`, error);
    return new Response(
      JSON.stringify({ error: "Database error", message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }
}

/**
 * Handle POST /api/quotes/:id/like
 * Increments the like count for a specific quote in Cloudflare D1
 */
async function handleLikeQuote(id: number, env: Env): Promise<Response> {
  try {
    // Check if quote exists
    const quote = await env.DB.prepare("SELECT id, likes FROM quotes WHERE id = ?")
      .bind(id)
      .first<{ id: number; likes: number }>();

    if (!quote) {
      return new Response(JSON.stringify({ error: "Quote not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const newLikesCount = (quote.likes || 0) + 1;
    await env.DB.prepare("UPDATE quotes SET likes = ? WHERE id = ?")
      .bind(newLikesCount, id)
      .run();

    return new Response(JSON.stringify({ success: true, likes: newLikesCount }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err: any) {
    console.error("Failed to like quote:", err);
    return new Response(
      JSON.stringify({ error: "Failed to increment likes", message: err.message || String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }
}

/**
 * Handle DELETE /api/quotes/:id
 * Removes from D1 and Vectorize
 */
async function handleDeleteQuote(id: number, env: Env): Promise<Response> {
  try {
    // 1. Delete from D1
    const { success } = await env.DB.prepare("DELETE FROM quotes WHERE id = ?").bind(id).run();
    if (!success) {
      return new Response(JSON.stringify({ error: "Failed to delete from database" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // 2. Delete from Vectorize
    try {
      await env.VECTORIZE.deleteByIds([String(id)]);
    } catch (vErr) {
      console.warn(`Vector deletion failed for ID ${id} (this is normal if it didn't exist in Vectorize):`, vErr);
    }

    return new Response(JSON.stringify({ message: "Quote deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (error: any) {
    console.error(`Error deleting quote with ID ${id}:`, error);
    return new Response(
      JSON.stringify({ error: "Delete operation failed", message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }
}

/**
 * Handle POST /api/quotes
 * Executes the full Quote Processing Pipeline:
 * 1. Generate Vector Embedding using @cf/baai/bge-base-en-v1.5
 * 2. Query Vectorize to verify no exact/near-duplicates (score > 0.95)
 * 3. Extract Metadata and generate 2-sentence philosophical context using Llama-3-8b-instruct
 * 4. Filter top 3 related quote IDs (scoring below 0.95)
 * 5. Insert enriched quote to Cloudflare D1
 * 6. Store vector embedding in Cloudflare Vectorize
 */
/**
/**
 * Helper to perform a zero-dependency web search on DuckDuckGo HTML 
 * to fetch context snippets for a quote, resolving real authors and origins.
 */
async function searchWeb(query: string): Promise<string> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      }
    });

    if (!response.ok) {
      console.warn(`DuckDuckGo Search returned status: ${response.status}`);
      return "No web search results available.";
    }

    const html = await response.text();
    
    // Extract snippets with result__snippet class
    const snippetRegex = /class="result__snippet"[^>]*>([\s\S]*?)<\//g;
    const snippets: string[] = [];
    let match;
    let count = 0;

    while ((match = snippetRegex.exec(html)) !== null && count < 6) {
      const cleanSnippet = match[1]
        .replace(/<[^>]*>/g, "") // Strip nested tags
        .replace(/\s+/g, " ")    // Normalize whitespace
        .trim();
      if (cleanSnippet) {
        snippets.push(cleanSnippet);
        count++;
      }
    }

    if (snippets.length === 0) {
      return "No web search context matches found.";
    }

    return snippets.map((s, idx) => `[Result ${idx + 1}]: ${s}`).join("\n\n");
  } catch (err: any) {
    console.error("DuckDuckGo search fetch error:", err);
    return `Search query failed: ${err.message || String(err)}`;
  }
}

/**
 * Core helper that processes a single raw text quote:
 * 1. Generates text embedding.
 * 2. Checks Vectorize for duplicates (>0.95).
 * 3. Enriches with LLM metadata.
 * 4. Resolves related quotes.
 * 5. Saves in D1.
 * 6. Upserts in Vectorize.
 */
async function processSingleQuote(
  rawText: string,
  env: Env
): Promise<{ success: boolean; status: number; quote?: any; error?: string }> {
  // Step 0: Perform Web Search RAG to identify real author/source
  console.log(`Performing web search to identify origin for quote: "${rawText.substring(0, 50)}..."`);
  const searchQuery = rawText.replace(/[\r\n]+/g, " ").substring(0, 150).trim();
  const webSearchContext = await searchWeb(searchQuery);
  console.log("Web Search Context retrieved length:", webSearchContext.length);

  // Step 1: LLM Information Enrichment & Ingestion Text Grammar Cleanup
  let llmData: QuoteMetadata;
  try {
    const systemPrompt = `You are a sophisticated literary curator and professional grammar editor AI.
Analyze the quote provided by the user. Clean it, correct spelling and capitalization mistakes, fix missing punctuation, ensure correct syntax, and extract the required metadata into a valid JSON object.

We have searched the web for matches of this quote. Use the following WEB SEARCH RESULTS context to accurately identify the real author, the book, poem, movie, play, television series, or origin of the quote. If the search results contain specific mentions of who said it or where it comes from, prioritize that information. Do NOT write "Unknown" if there are any clues in the search results context.

WEB SEARCH RESULTS CONTEXT:
${webSearchContext}

Rules for "cleaned_text":
- Correct spelling, grammar, and capitalization (e.g. if the input is "i just miss you and want to be with you", format it as "I just miss you and want to be with you.").
- Do NOT wrap the cleaned text in outer quotation marks (e.g., use 'Life is beautiful.' instead of '"Life is beautiful."').
- Preserve elegant poem-like linebreaks if they add poetic value, but ensure every line is grammatically polished with correct syntax.
- Ensure the syntax sounds professional, beautiful, and deeply resonant.

JSON Schema Output format:
1. "author": Extract the author's full name. If completely unknown, write "Unknown".
2. "source": Extract the book, poem, movie, play, speech, television series, or origin. If completely unknown, write "Unknown".
3. "language": Identify the language ("English", "Hindi", or "Hinglish").
4. "ai_context": Write a profound, beautifully articulated exactly 2-sentence philosophical context explaining the deeper existential or poetic meaning of this quote.
5. "tags": Exactly 3 relevant, highly descriptive one-word tags (capitalized) summarizing its core themes (e.g., ["Mortality", "Solitude", "Nostalgia"]).
6. "cleaned_text": The polished, grammatically perfect, beautifully punctuated quote text with no surrounding outer double-quotes.
7. "color": Generate a representative hex color code (e.g., "#d97706", "#2563eb", "#db2777", "#059669", "#7c3aed") based on the mood, category, and theme of the quote. The hex code must be a valid 6-character hex string starting with "#" and should be a solid, rich medium-tone color (avoiding pure white, pure black, or extremely washed-out tones) that works elegantly.

Output MUST be strictly valid JSON. Do not write any markdown code block wrap, introduction, or explanation outside the JSON format.`;

    const userPrompt = `Quote text: "${rawText}"`;

    const llmResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 512,
    });

    const rawResponse = llmResponse.response;
    console.log("Raw LLM Response:", rawResponse);
    llmData = parseRobustJSON(rawResponse);
  } catch (err: any) {
    console.error("LLM enrichment and cleanup failed. Using fallback metadata:", err);
    llmData = {
      author: "Unknown",
      source: "Unknown",
      language: "English",
      ai_context: "This quote invites deep reflection on the nature of existence and the quiet spaces within human experience.",
      tags: ["Reflection", "Wisdom", "Existential"],
      cleaned_text: rawText,
      color: "#d97706",
    };
  }

  // Finalize cleaned text (remove outer quotes just in case)
  let finalizedText = (llmData.cleaned_text || rawText).trim();
  finalizedText = finalizedText.replace(/^["']|["']$/g, "").trim();

  // Step 2: Generate Vector Embedding of the finalized cleaned text
  let embedding: number[];
  try {
    const embeddingResponse = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: [finalizedText],
    });

    if (!embeddingResponse || !embeddingResponse.data || !embeddingResponse.data[0]) {
      throw new Error("Invalid embedding response structure from Workers AI.");
    }
    embedding = embeddingResponse.data[0];
  } catch (err: any) {
    console.error("AI Embedding generation failed:", err);
    return {
      success: false,
      status: 500,
      error: "AI Pipeline Error: Failed to generate text embedding.",
    };
  }

  // Step 3: Query Cloudflare Vectorize for near duplicates
  let vectorizeMatches: any = { matches: [] };
  try {
    vectorizeMatches = await env.VECTORIZE.query(embedding, {
      topK: 10,
      returnValues: false,
      returnMetadata: true,
    });
  } catch (err: any) {
    // Vectorize index might be brand new or empty, log and proceed if it's a first-run issue
    console.warn("Vectorize index query encountered an error or is uninitialized. Proceeding with empty matches.", err);
  }

  // Duplicate Quote detection (score > 0.95)
  if (vectorizeMatches.matches && vectorizeMatches.matches.length > 0) {
    const topMatch = vectorizeMatches.matches[0];
    if (topMatch.score > 0.95) {
      console.log(`Duplicate detected! Match ID: ${topMatch.id}, Match Score: ${topMatch.score}`);
      return {
        success: false,
        status: 409,
        error: "Duplicate Quote: A highly similar quote already exists in the archive (score > 0.95).",
      };
    }
  }

  // Step 4: Map top 3 related quote IDs (scoring below 0.95)
  const relatedQuoteIds = (vectorizeMatches.matches || [])
    .filter((m: any) => m.score <= 0.95)
    .slice(0, 3)
    .map((m: any) => parseInt(m.id))
    .filter((id: number) => !isNaN(id));

  console.log("Identified related quote IDs:", relatedQuoteIds);

  // Step 5: Insert everything into the D1 Database using finalizedText
  let insertedId: number;
  try {
    const d1Result = await env.DB.prepare(
      `INSERT INTO quotes (quote_text, author, source, language, ai_context, tags, related_quote_ids, color) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      finalizedText,
      llmData.author || "Unknown",
      llmData.source || "Unknown",
      llmData.language || "English",
      llmData.ai_context || "",
      JSON.stringify(llmData.tags || []),
      JSON.stringify(relatedQuoteIds),
      llmData.color || null
    ).run();

    if (!d1Result.meta || !d1Result.meta.last_row_id) {
      throw new Error("D1 failed to return the inserted quote row ID.");
    }
    insertedId = d1Result.meta.last_row_id;
    console.log(`Successfully stored quote in D1 with ID: ${insertedId}`);
  } catch (err: any) {
    console.error("Failed to insert quote into D1:", err);
    if (err.message && err.message.includes("UNIQUE constraint failed")) {
      return {
        success: false,
        status: 409,
        error: "Duplicate Quote: An identical text snippet already exists in the SQL database.",
      };
    }
    return {
      success: false,
      status: 500,
      error: `Database Insertion Error: ${err.message}`,
    };
  }

  // Step 6: Upsert the new vector embedding into Cloudflare Vectorize
  try {
    await env.VECTORIZE.upsert([
      {
        id: String(insertedId),
        values: embedding,
      },
    ]);
    console.log(`Successfully upserted vector embedding for ID ${insertedId} into Vectorize.`);
  } catch (err: any) {
    console.error(`Vectorize indexing failed for ID ${insertedId}:`, err);
  }

  return {
    success: true,
    status: 201,
    quote: {
      id: insertedId,
      quote_text: finalizedText,
      author: llmData.author,
      source: llmData.source,
      language: llmData.language,
      ai_context: llmData.ai_context,
      tags: llmData.tags,
      related_quote_ids: relatedQuoteIds,
      color: llmData.color || null,
    },
  };
}

/**
 * Handle POST /api/quotes
 * Ingests a single quote and runs it through the processing pipeline.
 */
async function handlePostQuote(request: Request, env: Env): Promise<Response> {
  let rawText = "";

  const contentType = request.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    try {
      const body = await request.json() as any;
      rawText = body.text || body.quote_text || body.quote || "";
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
  } else {
    rawText = await request.text();
  }

  rawText = rawText.trim();

  if (!rawText) {
    return new Response(
      JSON.stringify({ error: "Bad Request: Raw quote text must not be empty." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }

  console.log(`Processing single quote upload: "${rawText.substring(0, 60)}..."`);
  const result = await processSingleQuote(rawText, env);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error }),
      {
        status: result.status,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Quote created and indexed successfully.",
      quote: result.quote,
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
}

/**
 * Handle POST /api/quotes/bulk
 * Ingests a raw body containing multiple quotes separated by double newlines (\n\n).
 * Runs each quote through the processing pipeline sequentially to ensure rate-limiting compliance.
 */
async function handleBulkPostQuotes(request: Request, env: Env): Promise<Response> {
  let rawText = "";

  const contentType = request.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    try {
      const body = await request.json() as any;
      rawText = body.text || body.quotes || body.quote || "";
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
  } else {
    rawText = await request.text();
  }

  if (!rawText.trim()) {
    return new Response(
      JSON.stringify({ error: "Bad Request: Raw bulk quotes text must not be empty." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }

  // Split by double newlines (\n\n) or double newlines with optional spaces/carriage returns
  const rawQuotes = rawText
    .split(/\r?\n\s*\r?\n/)
    .map((q) => q.trim())
    .filter((q) => q.length > 0);

  if (rawQuotes.length === 0) {
    return new Response(
      JSON.stringify({ error: "Bad Request: No valid non-empty quotes found in submission." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }

  console.log(`Processing bulk quote upload pipeline for ${rawQuotes.length} quotes...`);

  const results: any[] = [];
  let successful = 0;
  let failed = 0;

  for (const quoteText of rawQuotes) {
    try {
      console.log(`Bulk processing item: "${quoteText.substring(0, 45)}..."`);
      const result = await processSingleQuote(quoteText, env);
      
      if (result.success) {
        successful++;
        results.push({
          quote_text: quoteText,
          status: "success",
          quote: result.quote,
        });
      } else {
        failed++;
        results.push({
          quote_text: quoteText,
          status: "failed",
          error: result.error,
        });
      }
    } catch (err: any) {
      failed++;
      results.push({
        quote_text: quoteText,
        status: "failed",
        error: err.message || String(err),
      });
    }
  }

  return new Response(
    JSON.stringify({
      message: "Bulk quote processing complete.",
      summary: {
        total: rawQuotes.length,
        successful,
        failed,
      },
      results,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
}

/**
 * Handle POST or GET /api/maintenance/reindex
 * Updates and cleans the grammar/formatting of existing D1 quotes,
 * regenerates vector embeddings, indexes them in Vectorize,
 * and updates related_quote_ids dynamically.
 */
async function handleMaintenanceReindex(env: Env): Promise<Response> {
  try {
    console.log("Starting full database grammar polish & reindexing...");

    // 1. Fetch all quotes from D1
    const { results: quotes } = await env.DB.prepare(
      "SELECT * FROM quotes"
    ).all();

    if (!quotes || quotes.length === 0) {
      return new Response(
        JSON.stringify({ message: "No quotes in database to reindex." }),
        { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    console.log(`Found ${quotes.length} quotes to process.`);
    const reports: any[] = [];
    const updatedEmbeddings: Map<number, number[]> = new Map();

    // 2. Loop and polish grammar + regenerate embeddings
    for (const quote of quotes as any[]) {
      try {
        console.log(`Polishing quote ID ${quote.id}: "${quote.quote_text.substring(0, 40)}..."`);
        
        // Let's call Llama model to clean the grammar, spelling, punctuation, capitalization and syntax
        const systemPrompt = `You are a professional literary editor. Clean and correct the grammar, spelling, punctuation, capitalization and syntax of the following quote.
Do NOT return any JSON, metadata, explanation or surrounding double-quotes. Just return the polished plain text quote itself.`;

        const llmResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Quote: "${quote.quote_text}"` },
          ],
          max_tokens: 256,
        });

        let polishedText = llmResponse.response.trim();
        // Remove surrounding outer double or single quotes
        polishedText = polishedText.replace(/^["']|["']$/g, "").trim();

        if (!polishedText) {
          polishedText = quote.quote_text; // Fallback if LLM failed
        }

        console.log(`Polished ID ${quote.id}: "${polishedText.substring(0, 40)}..."`);

        // Update D1 text
        await env.DB.prepare("UPDATE quotes SET quote_text = ? WHERE id = ?")
          .bind(polishedText, quote.id)
          .run();

        // Generate new embedding of the polished text
        const embeddingResponse = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
          text: [polishedText],
        });

        if (embeddingResponse && embeddingResponse.data && embeddingResponse.data[0]) {
          const embedding = embeddingResponse.data[0];
          updatedEmbeddings.set(quote.id, embedding);

          // Upsert into Vectorize
          await env.VECTORIZE.upsert([
            {
              id: String(quote.id),
              values: embedding,
            },
          ]);
        }

        reports.push({
          id: quote.id,
          original: quote.quote_text,
          polished: polishedText,
          status: "success",
        });
      } catch (err: any) {
        console.error(`Error processing quote ID ${quote.id}:`, err);
        reports.push({
          id: quote.id,
          original: quote.quote_text,
          status: "failed",
          error: err.message || String(err),
        });
      }
    }

    // 3. Loop quotes again to calculate related_quote_ids using the newly updated Vectorize index
    console.log("Recalculating related_quote_ids for all quotes...");
    let relatedUpdatesCount = 0;

    for (const quote of quotes as any[]) {
      try {
        const embedding = updatedEmbeddings.get(quote.id);
        if (!embedding) continue;

        // Query Vectorize using newly generated embedding
        const vectorizeMatches = await env.VECTORIZE.query(embedding, {
          topK: 10,
          returnValues: false,
          returnMetadata: true,
        });

        // Filter top 3 related quote IDs (excluding current quote itself, and score must be <= 0.95)
        const relatedIds = (vectorizeMatches.matches || [])
          .filter((m: any) => m.id !== String(quote.id) && m.score <= 0.95)
          .slice(0, 3)
          .map((m: any) => parseInt(m.id))
          .filter((id: number) => !isNaN(id));

        // Update D1 related_quote_ids
        await env.DB.prepare("UPDATE quotes SET related_quote_ids = ? WHERE id = ?")
          .bind(JSON.stringify(relatedIds), quote.id)
          .run();

        // Update our report with resolved links
        const report = reports.find(r => r.id === quote.id);
        if (report) {
          report.related_quote_ids = relatedIds;
        }
        relatedUpdatesCount++;
      } catch (rErr: any) {
        console.error(`Error updating related quotes for ID ${quote.id}:`, rErr);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Full database grammar polish & reindexing completed successfully.",
        summary: {
          total_quotes: quotes.length,
          polished_successfully: reports.filter(r => r.status === "success").length,
          failed_polishing: reports.filter(r => r.status === "failed").length,
          related_links_recalculated: relatedUpdatesCount,
        },
        reports,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (error: any) {
    console.error("Full Maintenance Reindexing crashed:", error);
    return new Response(
      JSON.stringify({ error: "Maintenance operation failed", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
}

/**
 * Robust JSON extraction utility.
 * Cleans markdown wrappers and captures JSON structures safely.
 */
function parseRobustJSON(text: string): QuoteMetadata {
  let cleaned = text.trim();

  // Remove markdown code blocks if the LLM wrapped it in ```json ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }

  try {
    return JSON.parse(cleaned) as QuoteMetadata;
  } catch (e) {
    console.warn("Standard JSON parsing failed. Attempting regular expression regex fallback extraction on:", cleaned);
    
    // Fallback using manual regex extraction
    const authorMatch = cleaned.match(/"author"\s*:\s*"([^"]+)"/);
    const sourceMatch = cleaned.match(/"source"\s*:\s*"([^"]+)"/);
    const langMatch = cleaned.match(/"language"\s*:\s*"([^"]+)"/);
    const contextMatch = cleaned.match(/"ai_context"\s*:\s*"([^"]+)"/);
    const cleanedTextMatch = cleaned.match(/"cleaned_text"\s*:\s*"([^"]+)"/);
    
    // Extract tags array
    let tags: string[] = [];
    const tagsMatch = cleaned.match(/"tags"\s*:\s*\[([^\]]+)\]/);
    if (tagsMatch && tagsMatch[1]) {
      tags = tagsMatch[1]
        .split(",")
        .map(t => t.replace(/["'\s]/g, ""))
        .filter(t => t.length > 0);
    }

    if (contextMatch && contextMatch[1]) {
      return {
        author: authorMatch ? authorMatch[1] : "Unknown",
        source: sourceMatch ? sourceMatch[1] : "Unknown",
        language: langMatch ? langMatch[1] : "English",
        ai_context: contextMatch[1],
        tags: tags.length > 0 ? tags : ["Reflection", "Wisdom"],
        cleaned_text: cleanedTextMatch ? cleanedTextMatch[1] : undefined,
      };
    }

    throw new Error("Could not parse LLM response as JSON even with fallback regex.");
  }
}
