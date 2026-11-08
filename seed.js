/**
 * Seeds the curated Words collection (anime, cinema, philosophy, popular).
 *
 * Usage:
 *   bun run seed:quotes
 *   WORDS_API_URL=http://localhost:8787 bun run seed:quotes
 *
 * By default this also removes the 20 legacy rows whose binary data could not
 * be recovered. Set WORDS_KEEP_CORRUPTED=1 to keep them hidden instead.
 * Set WORDS_SEED_EMBEDDINGS=1 to also create Vectorize embeddings (slower).
 */

async function seedQuotes() {
  const baseUrl = (process.env.WORDS_API_URL || "https://api.words.harshrb.in").replace(/\/+$/, "");
  const purge = process.env.WORDS_KEEP_CORRUPTED === "1" ? "0" : "1";
  const embeddings = process.env.WORDS_SEED_EMBEDDINGS === "1" ? "1" : "0";
  const endpoint = `${baseUrl}/api/maintenance/seed?purge_unrecoverable=${purge}&embeddings=${embeddings}`;

  console.log(`Calling ${endpoint} ...`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "x-words-internal": "words-frontend",
      },
    });

    const rawBody = await response.text();
    let result;
    try {
      result = JSON.parse(rawBody);
    } catch {
      console.error(`Status Code: ${response.status}`);
      console.error(
        "The API did not return JSON. Deploy the updated Worker first, then run this command again."
      );
      console.error(rawBody.slice(0, 300));
      return;
    }

    console.log(`Status Code: ${response.status}`);
    console.log("-----------------------------------------");
    console.log(result.message || result.error || "No message returned.");

    if (result.summary) {
      console.log(`Seed quotes available: ${result.summary.seed_total}`);
      console.log(`Inserted: ${result.summary.inserted}`);
      console.log(`Skipped duplicates: ${result.summary.skipped}`);
      console.log(`Purged unrecoverable rows: ${result.summary.purged}`);
      console.log(`Embeddings created: ${result.summary.embeddings_created}`);

      if (result.summary.inserted_ids?.length) {
        console.log(`Inserted IDs: ${result.summary.inserted_ids.join(", ")}`);
      }
      if (result.summary.purged_ids?.length) {
        console.log(`Purged IDs: ${result.summary.purged_ids.join(", ")}`);
      }
    }
  } catch (error) {
    console.error(
      `Failed to reach the Words API at ${endpoint}. Make sure the Worker is deployed or running locally.`,
      error
    );
  }
}

seedQuotes();
