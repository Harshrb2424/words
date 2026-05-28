# Words / AI-Powered Quote Archive

An intelligent, minimalist quote archive built on the Cloudflare ecosystem. This project transforms scattered screenshots, book clippings, and raw text into a beautifully structured, searchable database. It utilizes AI to automatically identify authors, provide philosophical context, categorize tags, and prevent duplicate entries.

## The Tech Stack

This project is built for speed, affordability, and zero-maintenance scaling using the Cloudflare ecosystem:

- **Frontend:** Next.js (App Router) / React - Hosted on **Cloudflare Pages** for edge-network speed.
- **Database:** **Cloudflare D1** - Serverless SQL database for storing quotes, authors, and AI contexts.
- **Backend/API:** **Cloudflare Workers** - Serverless functions handling form submissions, AI processing, and vector logic.
- **AI Integration:** **Cloudflare Workers AI** - Used to auto-enrich quotes with context, metadata, and tags.
- **Vector Engine:** **Cloudflare Vectorize** - Used for fuzzy-matching (duplicate prevention) and generating "Similar Quotes."

---

## Core Features

- **AI Auto-Enrichment:** Submit raw text, and the backend LLM pipeline automatically extracts the author, source, language, generates 3 tags, and writes a 2-3 sentence philosophical context.
- **Smart Duplicate Prevention (Fuzzy Match):** Converts incoming quotes into vector embeddings. If a submission mathematically matches an existing quote by >95%, it is blocked as a duplicate.
- **Pre-Compiled "Similar Quotes":** Uses Cloudflare Vectorize to find the top 3 related quotes (scoring between 75% and 94% similarity) and links their IDs directly in the database for instant, zero-latency rendering on the frontend.
- **Minimalist UI:** A distraction-free masonry layout with a "Dive Deeper" card flip/expand mechanic to reveal the AI context without cluttering the main feed.

---

## Database Structure (Cloudflare D1)

| Column Name         | Data Type | Description                                                        |
| ------------------- | --------- | ------------------------------------------------------------------ |
| `id`                | Integer   | Primary key (auto-incremented).                                    |
| `quote_text`        | Text      | The actual quote text (**UNIQUE** constraint applied).             |
| `author`            | Text      | E.g., "Haruki Murakami", "Rumi", or "Unknown".                     |
| `source`            | Text      | E.g., Book title, Movie, or Web.                                   |
| `language`          | Text      | 'English', 'Hindi', 'Hinglish'.                                    |
| `ai_context`        | Text      | The AI-generated background/meaning.                               |
| `tags`              | Text      | Stored as a JSON string (e.g., `["Love", "Grief", "Motivation"]`). |
| `related_quote_ids` | Text      | Stored as a JSON array of IDs for the "Similar Quotes" feature.    |

---

## The Backend Workflow

When a new quote is submitted via the admin dashboard, the Cloudflare Worker executes the following pipeline:

1. **Vectorization:** Embeds the raw text using `@cf/baai/bge-base-en-v1.5`.
2. **Duplicate Check:** Queries Vectorize. If the top match score is > 0.95, returns a `409 Duplicate Error`.
3. **Find Similar Posts:** Grabs the top 3 Vectorize matches scoring below 0.95 and maps their IDs.
4. **AI Enrichment:** Prompts `@cf/meta/llama-3-8b-instruct` to extract metadata and write the context.
5. **Storage:** Inserts the final JSON payload (including the `related_quote_ids`) into D1 and the new embedding into Vectorize.

---

## UI/UX Guidelines

- **Typography:** Playfair Display (or similar elegant serif) for the main quotes. Clean sans-serif (like Inter or Roboto) for UI elements, tags, and AI context.
- **Layout:** Pinterest-style masonry grid.
- **Interaction:** Cards display only the `quote_text` by default. Clicking expands the card to show the `ai_context`, tags, and the pre-compiled **Similar Quotes** list.

---

## Getting Started (Development)

**1. Clone the repository and install dependencies:**

```bash
bun install

```

**2. Authenticate with Cloudflare:**

```bash
bunx wrangler login

```

**3. Setup local databases:**

```bash
# Create local D1 database
bunx wrangler d1 create quote-db

# Create local Vectorize index
bunx wrangler vectorize create quote-index --dimensions=768 --metric=cosine

```

**4. Run the development server:**

```bash
# Start the Next.js frontend
bun run dev

# Start the Cloudflare Worker API (in a separate terminal)
bun run start:worker

```
