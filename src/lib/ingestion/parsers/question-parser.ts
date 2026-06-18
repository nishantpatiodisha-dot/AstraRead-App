export type ParsedOption = {
  key: "A" | "B" | "C" | "D";
  text: string;
};

export type ParsedQuestion = {
  questionNumber: number;
  prompt: string;
  options: ParsedOption[];
};

export function parseQuestions(rawText: string): ParsedQuestion[] {
  if (!rawText.trim()) return [];

  // Capture the question number
  const tokens = rawText.split(/(?:^|\n)\s*(?:Q)?(\d+)[\.\)]\s+/i);

  const questions: ParsedQuestion[] = [];
  
  // tokens[0] is text before the first question.
  // Then pairs of (questionNumber, block)
  for (let i = 1; i < tokens.length; i += 2) {
    const qNum = parseInt(tokens[i], 10);
    const block = tokens[i + 1] || "";
    
    // Split by A), B), C), D), or A., B., C., D. or A , B , C , D 
    const parts = block.split(/(?:^|\n)\s*\(?([A-Da-d])\)?(?:[.)]\s+|\s+)/);
    
    const prompt = parts[0].trim();
    if (!prompt) continue;

    const options: ParsedOption[] = [];
    
    for (let j = 1; j < parts.length; j += 2) {
      const letterMatch = parts[j].toUpperCase();
      const text = (parts[j + 1] || "").trim();
      
      let key: "A" | "B" | "C" | "D" = "A";
      if (["A", "B", "C", "D"].includes(letterMatch)) {
        key = letterMatch as "A" | "B" | "C" | "D";
      }

      if (!options.find(o => o.key === key)) {
        options.push({ key, text });
      }
    }

    const keys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
    const paddedOptions: ParsedOption[] = keys.map(k => {
      const existing = options.find(o => o.key === k);
      return existing || { key: k, text: "" };
    });

    questions.push({
      questionNumber: qNum,
      prompt,
      options: paddedOptions,
    });
  }

  return questions;
}

export type ParsedExplanation = {
  questionNumber: number;
  correctOptionKey: "A" | "B" | "C" | "D";
  overallExplanation: string;
  optionExplanations: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
};

export function parseExplanations(rawText: string): ParsedExplanation[] {
  if (!rawText.trim()) return [];

  const explanations: ParsedExplanation[] = [];
  
  // Match lines like "2.D" or "2. D" or "2) D" or "2."
  // Use lookahead (?=\s|:|$) instead of non-capturing group to avoid consuming the next question's newline!
  const regex = /(?:^|\n)\s*(?:Q|Question|Sol|Solution)?\s*(\d+)[\.\)]\s*([A-Da-d])?(?=\s|:|$)/g;
  
  const matches = [...rawText.matchAll(regex)];
  
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const qNum = parseInt(m[1], 10);
    const letter = (m[2] || "").toUpperCase();
    
    const startIndex = m.index! + m[0].length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index! : rawText.length;
    
    const content = rawText.substring(startIndex, endIndex).trim();
    
    // Determine correct option
    let correctOptionKey: "A" | "B" | "C" | "D" = "A";
    if (["A", "B", "C", "D"].includes(letter)) {
      correctOptionKey = letter as "A" | "B" | "C" | "D";
    } else {
      const answerMatch = content.match(/(?:Answer|Option|Correct|Ans)[\s:.-]*\(?([A-D])\)?/i);
      if (answerMatch && answerMatch[1]) {
        correctOptionKey = answerMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
      }
    }

    // Parse per-option explanations like "Option A: ..." or "Option B:"
    const optionExplRegex = /Option\s+([A-D])\s*:\s*([\s\S]*?)(?=Option\s+[A-D]\s*:|$)/gi;
    const optionExplanations: any = {};
    let overallExplanation = content;

    const optMatches = [...content.matchAll(optionExplRegex)];
    if (optMatches.length > 0) {
      // The overall explanation is the text before the first "Option A:"
      overallExplanation = content.substring(0, optMatches[0].index!).trim();
      
      for (const optMatch of optMatches) {
        const key = optMatch[1].toUpperCase();
        optionExplanations[key] = optMatch[2].trim();
      }
    }

    explanations.push({
      questionNumber: qNum,
      correctOptionKey,
      overallExplanation,
      optionExplanations
    });
  }

  return explanations;
}
