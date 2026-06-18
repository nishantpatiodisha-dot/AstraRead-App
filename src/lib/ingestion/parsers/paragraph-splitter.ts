/**
 * Detects connector words in a paragraph to help with reading comprehension.
 */
const CONNECTOR_WORDS = [
  "however", "therefore", "moreover", "furthermore", "consequently",
  "nevertheless", "meanwhile", "subsequently", "additionally", "conversely",
  "thus", "hence", "accordingly", "otherwise", "instead", "similarly",
  "in contrast", "on the other hand", "for example", "for instance",
  "as a result", "in conclusion", "to summarize", "in addition"
];

export function extractParagraphs(fullText: string) {
  // Split by double newline (or single newline if that's how it's formatted)
  const rawParagraphs = fullText.split(/\n\s*\n|\n/);
  
  const paragraphs = [];
  let position = 1;

  for (const p of rawParagraphs) {
    const text = p.trim();
    if (text.length < 50) continue; // Skip very short paragraphs (likely artifacts)

    const connectorWords: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const connector of CONNECTOR_WORDS) {
      // Check if paragraph starts with connector or has it after a period
      if (lowerText.startsWith(connector) || lowerText.includes(`. ${connector}`)) {
        connectorWords.push(connector);
      }
    }

    paragraphs.push({
      position: position++,
      text,
      connectorWords,
    });
  }

  return paragraphs;
}
