# 🛠️ Self-Hosting Guide: Build Your Own Words Sanctuary

This step-by-step blueprint details how to provision, configure, and self-host a private, production-grade instance of the **Words Sanctuary** on your own Cloudflare infrastructure. 

---

## 🏗️ Prerequisites & Tools

Ensure the following tools are installed on your machine:
* **Node.js** (v22+) or **Bun** (v1.1+) — *Bun is highly recommended for speed.*
* **Cloudflare CLI (Wrangler):** Install globally or run via `bunx wrangler`.
* **A Cloudflare Account:** A free-tier account is sufficient to start!

---

## 📦 1. Cloudflare Storage & Database Provisioning

Run these commands in your terminal inside the `backend/` directory to configure your serverless storage engines:

### A. Create Cloudflare D1 Relational SQL Database
```bash
# In backend/ folder:
bunx wrangler d1 create quote-db
```
* **Output Example:**
  ```text
  ✅ Successfully created database 'quote-db' with ID 'your-d1-database-uuid-here'
  ```
* Copy the `database_id` value. You will paste this into `wrangler.toml`.

### B. Create Cloudflare Vectorize Index
We set up a Vectorize index that matches the dimensions and distance metric of our text embedding model (`@cf/baai/bge-base-en-v1.5` which produces 768 dimensions):
```bash
bunx wrangler vectorize create quote-index --dimensions=768 --metric=cosine
```

---

## ⚙️ 2. Configuration Settings (`wrangler.toml`)

Open your `backend/wrangler.toml` file and paste the database IDs generated in the previous step:

```toml
name = "words-backend"
main = "index.ts"
compatibility_date = "2024-05-24"

[ai]
binding = "AI"
remote = true

[[d1_databases]]
binding = "DB"
database_name = "quote-db"
database_id = "your-d1-database-uuid-here"

[[vectorize]]
binding = "VECTORIZE"
index_name = "quote-index"
remote = true
```

---

## ⚡ 3. Schema Ingestion & Migrations

Now, push the database schema and initialize your SQL structure:

### A. Local Development SQL Migration
```bash
# Push schema to local development SQLite database
bunx wrangler d1 execute quote-db --file=schema.sql --local
```

### B. Production Cloudflare SQL Migration
```bash
# Push schema to production live Cloudflare D1 instance
bunx wrangler d1 execute quote-db --file=schema.sql --remote
```

---

## 🧑‍💻 4. Local Development Workflow

Run both front and back dev servers concurrently to test features:

### A. Start the API Worker (Port 8787)
```bash
# Inside words/backend:
bun run dev
```

### B. Start the Next.js Client (Port 3000)
Configure your local environment variables in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

Now launch the development server:
```bash
# Inside words/frontend:
bun run dev
```

---

## 🚀 5. Production Ingestion & Cloudflare Deployments

### A. Deploy Backend Cloudflare Worker
Deploy your AI pipeline and edge logic into Cloudflare’s global serverless network:
```bash
# Inside words/backend:
bunx wrangler deploy
```
* Make a note of your deployed Worker URL (e.g. `https://words-backend.yourname.workers.dev`).

### B. Deploy Frontend next-on-pages on Cloudflare Pages
1. Go to your **Cloudflare Dashboard** -> **Workers & Pages** -> **Create Application** -> **Pages**.
2. Connect your GitHub repository containing the **Words** repository.
3. Configure the build parameters:
   * **Framework preset:** `Next.js`
   * **Build command:** `npx @cloudflare/next-on-pages@1`
   * **Build output directory:** `/.vercel/output/static`
   * **Root directory:** `/frontend/`
4. **Environment Variables:**
   Add `NEXT_PUBLIC_API_URL` pointing to your deployed Backend Worker URL (e.g., `https://api.words.harshrb.in`).
5. **Node.js Compatibility Flag:**
   Go to your Pages project -> **Settings** -> **Functions** -> **Compatibility Flags** -> click **Configure compatibility flags** for both Production and Preview environments, and add the flag:
   ```text
   nodejs_compat
   ```
6. Trigger the build. Your Pages website is now live!

---

## 🩺 6. Debugging & Common Failure Cases

> [!IMPORTANT]
> **Issue: "Node.JS Compatibility Error" in Pages Build**
> Next.js relies on Node.js standard APIs which are disabled by default. Ensure the `nodejs_compat` compatibility flag is enabled under **Settings** -> **Functions** in your Cloudflare Pages Dashboard.

> [!WARNING]
> **Issue: 403 Forbidden / "This is not a public API..."**
> If you make fetches to single quote detail pages or search endpoints outside of the allowed domains, you'll receive a `403 Forbidden` error. Make sure your server-side fetches pass the custom handshake header:
> ```typescript
> headers: {
>   "x-words-internal": "words-frontend"
> }
> ```

> [!CAUTION]
> **Issue: LLM Output Serialization Mismatches**
> If the Workers AI Llama model formats JSON with trailing commas or wrapping markdown blocks, the custom regex JSON parser in `backend/index.ts` (`parseRobustJSON()`) automatically handles cleaning it. If metadata extractions fail, check your `wrangler tail` logs.

---

## 🎨 7. Tailoring & Building Your Own Custom Literary Engine

Want to customize your repository or adapt it for specialized collections? Here’s how:

### A. Swap out the AI Processing Pipeline
To replace `@cf/meta/llama-3-8b-instruct` with a different model (e.g. `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` or an external OpenAI node):
* Open `backend/index.ts`.
* Locate the `env.AI.run(...)` block in `processSingleQuote()`.
* Replace the model identifier with your chosen endpoint:
```typescript
const llmResponse = await env.AI.run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", {
  prompt: systemPrompt + "\n" + userPrompt
});
```

### B. Extend Quote Ingestion with Custom Prompts
To extract additional parameters (e.g., an exact *historical date*, *emotional valence score*, or *curator notes*):
1. Add columns to the database schema in `backend/schema.sql`.
2. Update the system prompt JSON schema structure inside `backend/index.ts` to request these parameters from Llama 3.
3. Bind the fields in the D1 SQL insert statement:
```typescript
// Example database prepare addition
env.DB.prepare(
  `INSERT INTO quotes (quote_text, author, source, custom_field) VALUES (?, ?, ?, ?)`
).bind(finalizedText, llmData.author, llmData.source, llmData.custom_field);
```

### C. Restructuring the Visual Design System
To modify the core aesthetic layout:
* Open `frontend/src/app/globals.css` and customize color variables under `:root` and `.dark` selectors.
* Modify the layout presets in `frontend/src/components/WallpaperModal.tsx` to add your own personal branding, typographic presets, or wallpaper watermark logos.
