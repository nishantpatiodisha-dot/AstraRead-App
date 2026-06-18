export type Source = "Aeon" | "The Guardian" | "The Hindu";
export type Difficulty = "Moderate" | "Advanced" | "CAT+" | "Easy" | "CAT Level" | "Hard";
export type Category =
  | "Philosophy"
  | "Science"
  | "Politics"
  | "Economics"
  | "Psychology"
  | "Literature";

export type Paragraph = {
  text: string;
  /** Structural function: Introduction, New topic, Expansion, Expansion with example, Key insight, Conclusion, etc. */
  purpose: string;
  /** Detailed explanation of what the paragraph is doing */
  simplifiedMeaning: string;
  /** One-sentence central idea / main focus */
  centralIdea: string;
  structure: string;
  keywords: string[];
};

export type InlineQuestion = {
  id: string;
  insertAfterParagraph: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

export type VocabEntry = {
  term: string;
  meaning: string;
};

export type Article = {
  slug: string;
  title: string;
  source: Source;
  category: Category;
  difficulty: Difficulty;
  imageUrl?: string | null;
  readingTimeMinutes: number;
  progress: number;
  lastOpened: string | null;
  author: string;
  paragraphs: Paragraph[];
  inlineQuestions?: InlineQuestion[];
  overallSummary: string;
  toneOfPassage: string;
  difficultVocabulary: VocabEntry[];
  newPhrases: VocabEntry[];
  readingDifficultyScore: number;
  isLocked?: boolean;
};

export const articles: Article[] = [];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
