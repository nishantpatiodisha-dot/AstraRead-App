export type BulkParsedOption = {
  key: "A" | "B" | "C" | "D";
  text: string;
  explanation: string;
};

export type BulkParsedQuestion = {
  prompt: string;
  correctOptionKey: "A" | "B" | "C" | "D";
  options: BulkParsedOption[];
};

export type BulkParsedPassage = {
  passageText: string;
  questions: BulkParsedQuestion[];
};

export function parseBulkMarkdown(rawText: string): BulkParsedPassage[] {
  if (!rawText.trim()) return [];
  
  const passages: BulkParsedPassage[] = [];
  
  // Split by "### **Passage" or "### Passage"
  const passageBlocks = rawText.split(/(?:^|\r?\n)###\s*\**Passage\s*\d+\**(?:$|\r?\n)/i).filter(b => b.trim());

  for (const block of passageBlocks) {
    if (!block.trim()) continue;

    // Extract "**Passage Text:**" up to "**Questions:**"
    const textMatch = block.match(/\**Passage Text:\**\s*([\s\S]*?)(?=\r?\n\**Questions:\**)/i);
    const questionsMatch = block.match(/\**Questions:\**\s*([\s\S]*)$/i);

    if (!textMatch && !questionsMatch) {
      continue;
    }

    const passageText = textMatch ? textMatch[1].trim() : "";
    const questionsText = questionsMatch ? questionsMatch[1].trim() : "";

    const questions: BulkParsedQuestion[] = [];

    if (questionsText) {
      // Split by "**7. ", "7. ", "**12. " etc.
      const qRegex = /(?:^|\r?\n)\**(\d+)[\.\)]\s*([\s\S]*?)(?=(?:^|\r?\n)\**\d+[\.\)]\s+|$)/g;
      const qMatches = [...questionsText.matchAll(qRegex)];

      for (const qm of qMatches) {
        const qContent = qm[2].trim();

        // Extract Correct Option and Explanation
        let correctOptionMatch = qContent.match(/\**Correct Option:\**\s*([A-D])/i);
        let explanationMatch = qContent.match(/\**Explanation:\**([\s\S]*)/i);

        let correctOptionKey: "A" | "B" | "C" | "D" = "A";
        if (correctOptionMatch) {
          correctOptionKey = correctOptionMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
        }

        let fullExplanation = "";
        if (explanationMatch) {
          fullExplanation = explanationMatch[1].trim();
        }

        // Remove Correct Option and Explanation to parse prompt and options A,B,C,D
        let promptAndOptionsText = qContent;
        const correctOptIndex = qContent.search(/\**Correct Option:\**/i);
        if (correctOptIndex !== -1) {
          promptAndOptionsText = qContent.substring(0, correctOptIndex).trim();
        }

        // Parse prompt and A), B), C), D)
        const parts = promptAndOptionsText.split(/(?:^|\r?\n)\s*([A-D])[\.\)]\s+/i);
        const prompt = parts[0].trim();
        
        const options: { key: "A" | "B" | "C" | "D"; text: string }[] = [];
        for (let j = 1; j < parts.length; j += 2) {
          const key = parts[j].toUpperCase() as "A" | "B" | "C" | "D";
          const text = (parts[j+1] || "").trim();
          options.push({ key, text });
        }

        // Pad to ensure 4 options
        const keys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
        const paddedOptions = keys.map(k => {
          const existing = options.find(o => o.key === k);
          return existing || { key: k, text: "" };
        });

        // Map explanations to specific options
        const parsedOptions: BulkParsedOption[] = paddedOptions.map(opt => {
          let explanation = "";
          
          if (correctOptionKey === opt.key) {
             // General explanation before the first bullet point
             const specificOptMatchIndex = fullExplanation.search(/(?:^|\r?\n)\s*\*\s*\**(?:Option\s+)?[A-D]\**/i);
             if (specificOptMatchIndex !== -1) {
                 explanation = fullExplanation.substring(0, specificOptMatchIndex).trim();
             } else {
                 explanation = fullExplanation;
             }
          }

          // Extract all bullet points
          const bulletRegex = /(?:^|\r?\n)\s*\*\s*([\s\S]*?)(?=(?:^|\r?\n)\s*\*\s*|$)/g;
          const bullets = [...fullExplanation.matchAll(bulletRegex)].map(m => m[1].trim());

          for (const bullet of bullets) {
             // Check if bullet mentions this option in its prefix
             const prefix = bullet.split(/is incorrect|are incorrect|because/i)[0];
             if (prefix.includes(`Option ${opt.key}`) || prefix.includes(`**${opt.key}**`)) {
                let cleanBullet = bullet.replace(/^(?:\**(?:Option|Options)?\s*(?:[A-D]\**\s*(?:and|,)?\s*)+\**\s*(?:is|are)\s*incorrect\s*because\s*)/i, "");
                cleanBullet = cleanBullet.replace(/^(?:\**Option[s]?\s*[A-D]\**\s*(?:is|are)\s*incorrect\s*)/i, "");
                // remove leftover leading asterisks if any
                cleanBullet = cleanBullet.replace(/^\*\*(?:Option[s]?\s*)?[A-D](?:\s*and\s*\**[A-D])?\**\s*/i, "").trim();
                
                explanation += (explanation ? "\n\n" : "") + cleanBullet;
             }
          }
          
          return {
             key: opt.key,
             text: opt.text,
             explanation: explanation.trim()
          };
        });

        questions.push({
           prompt,
           correctOptionKey,
           options: parsedOptions
        });
      }
    }

    passages.push({
      passageText,
      questions
    });
  }

  return passages;
}
