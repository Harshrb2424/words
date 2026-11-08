/**
 * Repairs legacy quote rows that were stored as gzip/binary data.
 *
 * Usage:
 *   bun run repair:quotes
 *   WORDS_API_URL=http://localhost:8787 bun run repair:quotes
 */

async function repairQuotes() {
  const baseUrl = (process.env.WORDS_API_URL || "https://api.words.harshrb.in").replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/maintenance/repair`;

  console.log(`Calling ${endpoint} ...`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "x-words-internal": "words-frontend",
      },
    });

    const result = await response.json();

    console.log(`Status Code: ${response.status}`);
    console.log("-----------------------------------------");
    console.log(result.message || result.error || "No message returned.");

    if (result.summary) {
      console.log(`Rows scanned: ${result.summary.scanned}`);
      console.log(`Recovered: ${result.summary.recovered}`);
      console.log(`Unrecoverable: ${result.summary.unrecoverable}`);

      if (result.summary.recovered_ids?.length) {
        console.log(`Recovered IDs: ${result.summary.recovered_ids.join(", ")}`);
      }
      if (result.summary.unrecoverable_ids?.length) {
        console.log(`Unrecoverable IDs: ${result.summary.unrecoverable_ids.join(", ")}`);
        console.log(
          "These rows are hidden from the archive because their original text was lost before it reached D1."
        );
      }
    }
  } catch (error) {
    console.error(
      `Failed to reach the Words API at ${endpoint}. Make sure the Worker is deployed or running locally.`,
      error
    );
  }
}

repairQuotes();
