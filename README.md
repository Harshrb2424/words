# Words: An Edge-Native, AI-Driven Literary Sanctuary

Words is a highly optimized, production-grade quote archive and philosophical sanctuary designed for low-latency retrieval, semantic discovery, and typographic preservation. Built natively for the Cloudflare global edge network, the platform combines vector search, dynamic serverless relational storage, live web-search RAG retrieval, and custom HTML5 typography rendering.

This repository serves as a technical showcase for serverless engineering, edge database sharding, caching architectures, and robust React frontend components.

For step-by-step instructions on provisioning and running your own self-hosted deployment of the platform, refer to the [MAKE_YOUR_OWN.md](MAKE_YOUR_OWN.md) guide.

---

## Technical Documents Map

The development of the Words platform progressed through four key architectural phases. The detailed, phase-specific technical logs can be accessed here:

* [Phase 1: AI-Powered Ingestion Pipeline and Relational D1 Schema (P1.md)](P1.md)
* [Phase 2: Next.js Frontend Framework and Fluid Layout Transitions (P2.md)](P2.md)
* [Phase 3: Dual-Theming Architecture, Dynamic Router, and SVG Canvas (P3.md)](P3.md)
* [Phase 4: Anonymous Likes, Paginated Database Searches, and Caching Layers (P4.md)](P4.md)

---

## Global System Architecture

Words implements a clean separation between an Edge-rendered Next.js client application and a highly performant Cloudflare Workers REST API. All network data frames, database schemas, and shared interfaces are fully typed in TypeScript.

```mermaid
flowchart TB
    subgraph Client [Client Application - Next.js Edge Runtime]
        UX[Dynamic UI - Tailwind CSS v4]
        CS[Typographic Canvas Layout Engine]
        LC[(LocalStorage Buffer Cache)]
    end

    subgraph CDN [Cloudflare Edge CDN]
        Worker[Cloudflare Ingestion Worker]
        Cache[(Worker In-Memory Cache)]
    end

    subgraph AI [Workers AI Compute Isolation]
        BGE[@cf/baai/bge-base-en-v1.5]
        Llama[@cf/meta/llama-3-8b-instruct]
    end

    subgraph Data [Persistent Database Isolation]
        D1[(Cloudflare D1 Relational SQLite)]
        Vec[(Cloudflare Vectorize Index)]
    end

    UX -- GET /api/quotes (Sub-5ms) --> Worker
    Worker -- Cache Hit --> Cache
    Worker -- Cache Miss --> D1
    
    UX -- POST raw text --> Worker
    Worker -- 1. Web RAG Query --> DDG[DuckDuckGo HTML Parser]
    DDG -- Scraped Text Snippets --> Worker
    Worker -- 2. Vector Generation --> BGE
    Worker -- 3. Cosine Verification > 0.95 --> Vec
    Worker -- 4. Metadata Mapping --> Llama
    Worker -- 5. Database Commit --> D1
    Worker -- 6. Vector Upsert --> Vec
    Worker -- 7. Invalidate Memory --> Cache
    
    Worker -- Return Relational Quote Object --> UX
    UX -- Prepend Locally & Navigate --> LC
```

---

## Architectural Deep Dive: Phase-by-Phase Integration

### Phase 1: AI-Powered Ingestion Pipeline and Relational D1 Schema

The core storage and ingestion subsystem, detailed in [P1.md](P1.md), is deployed within a Cloudflare Worker container. When raw text is submitted, it is processed through a strict, multi-stage relational pipeline:

1. **Text Normalization:** Raw text payloads are parsed from standard JSON requests (`{ "text": "..." }`) or double-newline-separated plain text blocks (`\n\n`) for bulk execution.
2. **Vector Generation:** A 768-dimensional text embedding is generated using the `@cf/baai/bge-base-en-v1.5` model.
3. **Fuzzy Cosine Deduplication:** The generated vector is queried against the Cloudflare Vectorize index using a strict threshold (cosine score `>0.95`). If an identical or near-duplicate quote exists, the transaction is aborted with a `409 Conflict` error to prevent database pollution.
4. **Relational Ingestion and Similarities:** The top 3 closest database matches scoring `<0.95` are identified. Their primary keys are stored directly inside the parent quote record as a serialized integer array (`related_quote_ids`).
5. **Retrieval-Augmented Generation (RAG) and LLM Extraction:** To avoid "Unknown" author attributions, the Worker triggers an automated scrap of DuckDuckGo HTML. The resulting snippets are injected as search context into `@cf/meta/llama-3-8b-instruct`. The LLM extracts:
   * **Author:** Actual creator or "Unknown"
   * **Source:** Book title, movie, speech, website, or "Unknown"
   * **Language:** Restricted to "English", "Hindi", or "Hinglish"
   * **AI Context:** Exactly a 2-sentence philosophical commentary
   * **Tags:** Exactly 3 thematic tags (e.g. `["Freedom", "Rebellion", "Wisdom"]`)
   * **Color:** A representative, high-contrast, aesthetic color hex string based on the theme of the quote.
6. **SQL Transaction:** The quote and enriched metadata are written to Cloudflare D1.
7. **Vector Indexing:** The embedding vector is upserted into the Cloudflare Vectorize index under the D1 assigned auto-incrementing ID.

```sql
-- D1 Database Schema Configuration
CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_text TEXT UNIQUE NOT NULL,
    author TEXT NOT NULL,
    source TEXT NOT NULL,
    language TEXT NOT NULL,
    ai_context TEXT NOT NULL,
    tags TEXT NOT NULL,           -- JSON array of strings
    related_quote_ids TEXT NOT NULL, -- JSON array of integers
    color TEXT DEFAULT NULL,      -- Dynamic hex color string
    likes INTEGER DEFAULT 0       -- Aggregated anonymous likes
);
```

### Phase 2: Next.js Frontend Framework and Fluid Layout Transitions

The user interface, detailed in [P2.md](P2.md), is architected for structural clarity, performance, and responsive layout calculations.

* **Layout Transition Engine:** When expanding a quote card, the interface utilizes a pure CSS Grid Row Transition method rather than absolute sizing calculations. Transitioning from `grid-rows-[0fr]` to `grid-rows-[1fr]` slides details smoothly without layout pops.
* **Symmetrical Memory Caching:** The homepage fetches the top 30 quotes via a Server Component. On load, the client builds an `in-memory Map` of the complete catalog:
  ```typescript
  const quotesMap = new Map(quotes.map(q => [q.id, q]));
  ```
  This map allows instant, client-side O(1) resolution of similar quotes without initiating extra HTTP queries.
* **Interactive Highlights:** Clicking on a related quote ID in an expanded card smoothly scrolls the target quote card into view and blinks a golden focus ring around the target container.

### Phase 3: Dual-Theming Architecture, Dynamic Router, and SVG Canvas

Phase 3, documented in [P3.md](P3.md), focused on dynamic user experiences, dynamic route indexing, and media export controls.

* **Anti-Flicker Injection (No FOUC):** To eliminate system-theme light/dark flashes, a blocking script is injected directly into the HTML `<head>`. This script reads local storage and evaluates prefers-color-scheme, classing the `documentElement` *before* the first browser painting pass.
* **SEO Dynamic Routing:** Moved deep details into a dedicated dynamic route (`/quote/[slug]/page.tsx`). Computes readable, browser-safe slugs matching `/quote/quote-snippet-id` for crawler indexing.
* **Aura Theme Calculations:** Custom quote accent colors generated by the LLM are parsed dynamically. The client resolves hex strings into RGB format to render 8% opacity top-center radial background glow spots and 3.5% opacity card backgrounds.
* **HTML5 Canvas Typographic Creator:** Renders high-resolution downloadable wallpapers:
  * **Aspect Ratio Presets:** Phone HD (1080x1920), Phone 4K (1440x3200), PC Full HD (1920x1080), and PC 4K Ultra (3840x2160).
  * **Social Presets:** Instagram Square (1080x1080), Instagram Portrait (1080x1350), and Twitter/X Landscape (1200x675).
  * **Dynamic Centering and Word-Wrapping:** Utilizes layout loops to calculate line breaks, padding, source signatures, and index indicators safely.

### Phase 4: Anonymous Likes, Paginated Database Searches, and Caching Layers

Phase 4, detailed in [P4.md](P4.md), introduced high-performance optimization layers and engagement engines.

* **Dual-Layer Caching Strategy:**
  1. **Worker Isolates In-Memory Cache (1 Hour):** GET requests (search, listings, paginations) are cached in the Worker's global isolate memory. Writes (`POST`, `DELETE`, `PUT`) instantly invoke `readCache.clear()`, invalidating the cache and ensuring data consistency.
  2. **Next.js Static Revalidation:** Dynamic quote pages implement `revalidate: 3600` (1-hour cache) at the fetch layer, protecting the database from high concurrent lookups.
* **LocalStorage Synchronization:** Successfully submitted quotes are saved in local storage. On mount, the homepage feed reads `words_user_submitted_quotes` and prepends them, avoiding network lag.
* **Anonymous Likes System:** Implemented an anonymous likes system using LocalStorage tracking. Submitting a like increments D1 values atomically (`UPDATE quotes SET likes = likes + 1 WHERE id = ?`), saving the quote ID locally under `words_liked_quotes` to restrict duplicate votes.
* **Server-to-Server Authentication Handshake:** Because server-side dynamic page rendering (`/quote/[slug]`) executes fetches on the Next.js server side without standard client browser headers (`Origin`, `Referer`), the backend would reject them with a 403 Forbidden error. To resolve this, server-side fetch calls pass a secure identification handshake header:
  ```typescript
  headers: {
    "Accept": "application/json",
    "x-words-internal": "words-frontend"
  }
  ```
  The Worker validates this header to authorize the Next.js server-side render dynamically.

---

## Developer Environment Controls

Execute the following commands to install dependencies and run the local development stack:

```bash
# Install workspace packages
bun install

# Run the local API Worker (defaults to http://localhost:8787)
bun run start:worker

# Run the Next.js Client Dev Server (defaults to http://localhost:3000)
bun run dev
```

---

## Technical Performance Profile

| Metric | Target / Measured | Source |
| :--- | :--- | :--- |
| **Initial Page Load (Edge CDN)** | < 50ms | Cloudflare Pages Edge Serverless Rendering |
| **Search Debouncing Time** | 400ms | Client-side input event debounce handler |
| **API Cache Hit Latency** | < 8ms | Cloudflare Worker isolate-level global memory caching |
| **Vector Embedding Vector Size** | 768 dimensions | `@cf/baai/bge-base-en-v1.5` text embedding |
| **Deduplication Threshold** | > 0.95 (Cosine Similarity) | Vectorize metadata query filter matching |

---

## Personal Use License

This software is released under the Personal Use License.

### Permissions
* You are granted permission to download, run, host, modify, and utilize this project for private, personal, non-commercial, and educational purposes.

### Conditions and Limitations
* **Attribution Requirement:** You must retain the original author's attribution and link back to this original repository (`https://github.com/Harshrb2424/words`) in any derived versions, distributions, or self-hosted instances of this software.
* **No Commercial Use:** You may not sell, rent, lease, sublicense, or utilize this software, its database schemas, or its deployment models for any commercial services, startup applications, or money-making ventures.
* **Project Heritage:** Any modification or self-hosted deployment of this project must explicitly acknowledge this repository as the original source code foundation.
