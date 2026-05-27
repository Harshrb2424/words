async function sendQuotes() {
  // 1. Read the raw text from your file
  const rawText = await Bun.file('data.txt').text();

  // 2. Send it to your local API
  const response = await fetch('http://localhost:8787/api/quotes/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: rawText }) // Bun automatically escapes quotes and newlines!
  });

  // 3. Print the result
  const result = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${result}`);
}

sendQuotes();