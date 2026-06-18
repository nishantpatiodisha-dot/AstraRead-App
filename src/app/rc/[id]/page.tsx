import { getDb } from "@/db";
import { rcPassages, rcQuestions, rcOptions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import RCPracticeClient from "../components/RCPracticeClient";


export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const db = getDb();
  const [passage] = await db
    .select()
    .from(rcPassages)
    .where(eq(rcPassages.id, params.id))
    .limit(1);

  if (!passage) return { title: "Passage Not Found" };

  let title = passage.title;
  if (passage.examType === "CAT" && passage.year) {
    title = `CAT ${passage.year} ${passage.slot ? passage.slot + " " : ""}RC Solutions`;
  } else {
    title = `RC Practice - ${passage.title}`;
  }

  return {
    title,
    description: `Detailed solutions and explanations for ${title}. Improve your CAT VARC accuracy with AstraRead's deep analysis.`,
  };
}

export default async function RCPracticePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const db = getDb();

  // Fetch passage
  const [passage] = await db
    .select()
    .from(rcPassages)
    .where(eq(rcPassages.id, params.id))
    .limit(1);

  if (!passage) {
    notFound();
  }

  // Fetch questions
  const questions = await db
    .select()
    .from(rcQuestions)
    .where(eq(rcQuestions.passageId, passage.id))
    .orderBy(rcQuestions.sortOrder);

  // Fix N+1 query
  const questionIds = questions.map(q => q.id);
  const allOptions = questionIds.length > 0 
    ? await db.select().from(rcOptions).where(inArray(rcOptions.questionId, questionIds))
    : [];

  // Hydrate questions with options
  const populatedQuestions = questions.map(q => ({
    ...q,
    options: allOptions.filter(o => o.questionId === q.id).sort((a, b) => a.optionKey.localeCompare(b.optionKey))
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": passage.examType === "CAT" && passage.year
      ? `CAT ${passage.year} ${passage.slot ? passage.slot + " " : ""}RC — ${passage.title}`
      : `RC Practice — ${passage.title}`,
    "about": {
      "@type": "Thing",
      "name": "CAT VARC Reading Comprehension"
    },
    "educationalLevel": "Graduate",
    "numberOfQuestions": populatedQuestions.length,
    "provider": {
      "@type": "Organization",
      "name": "AstraRead",
      "url": "https://astraread.com"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RCPracticeClient passage={passage} questions={populatedQuestions} />
    </>
  );
}
