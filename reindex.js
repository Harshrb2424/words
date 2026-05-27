async function triggerReindexing() {
  console.log("Triggering global database grammar polishing & reindexing maintenance pipeline...");
  
  try {
    const response = await fetch('http://localhost:8787/api/maintenance/reindex', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    console.log(`\nStatus Code: ${response.status}`);
    console.log("-----------------------------------------");
    console.log(`Message: ${result.message}`);
    if (result.summary) {
      console.log(`Total Quotes: ${result.summary.total_quotes}`);
      console.log(`Polished Successfully: ${result.summary.polished_successfully}`);
      console.log(`Failed: ${result.summary.failed_polishing}`);
      console.log(`Related Quote Connections Recalculated: ${result.summary.related_links_recalculated}`);
    }
    console.log("-----------------------------------------");
    if (result.reports && result.reports.length > 0) {
      console.log("\nPolishing Details:");
      result.reports.forEach(r => {
        if (r.status === "success") {
          console.log(`[ID ${r.id}] Success:`);
          console.log(`  - Original: "${r.original}"`);
          console.log(`  - Polished: "${r.polished}"`);
          console.log(`  - Related Connections: ${JSON.stringify(r.related_quote_ids)}`);
        } else {
          console.log(`[ID ${r.id}] Failed: "${r.original}" - Error: ${r.error}`);
        }
      });
    }
  } catch (error) {
    console.error("Failed to connect to local API worker. Make sure 'bunx wrangler dev' is running on http://localhost:8787!", error);
  }
}

triggerReindexing();
