async function run() {
  const payload = {
    title: "Test Manual Import Essay",
    author: "Jane Doe",
    url: "https://aeon.co/essays/test-manual-import-essay",
    sourceSlug: "aeon",
    category: "Philosophy",
    fullText: "This is the first paragraph of our manual import.\n\nThis is the second paragraph. It should be split perfectly.\n\nAnd here is the final third paragraph, concluding our test."
  };

  const res = await fetch('http://localhost:3000/api/admin/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}
run();
