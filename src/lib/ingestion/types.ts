export interface InlineQuestion {
  id: string;
  insertAfterParagraph: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface ParsedArticle {
  title: string;
  url: string;
  slug: string;
  author: string | null;
  publishedAt: Date | null;
  category: string | null;
  difficulty?: "easy" | "medium" | "hard";
  imageUrl: string | null;
  fullText: string;
  paragraphs: {
    position: number;
    text: string;
    connectorWords: string[];
  }[];
  inlineQuestions?: InlineQuestion[];
}
