import { getDb } from "@/db";
import { rcPassages, rcQuestions, rcOptions } from "@/db/schema";
import { eq, inArray, and, or, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import RCFullSlotClient from "../../../../components/RCFullSlotClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ exam: string, year: string, slot: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const decodedSlot = decodeURIComponent(params.slot);
  const title = `${params.exam} ${params.year} ${decodedSlot} RC Solutions`;

  return {
    title,
    description: `Take the full ${title} reading comprehension mock test with AstraRead's deep analysis.`,
  };
}

export default async function RCFullSlotPage(props: { params: Promise<{ exam: string, year: string, slot: string }> }) {
  const params = await props.params;
  const decodedSlot = decodeURIComponent(params.slot);
  const db = getDb();

  // Fetch all passages for this slot
  const passages = await db
    .select()
    .from(rcPassages)
    .where(
      and(
        eq(rcPassages.examType, params.exam as "CAT" | "XAT" | "SNAP" | "NMAT" | "CUSTOM"),
        eq(rcPassages.year, parseInt(params.year, 10)),
        decodedSlot === "Slot Unspecified" 
          ? or(isNull(rcPassages.slot), eq(rcPassages.slot, "")) 
          : or(eq(rcPassages.slot, decodedSlot), eq(rcPassages.sourceLabel, decodedSlot))
      )
    )
    .orderBy(rcPassages.sourceLabel);

  if (passages.length === 0) {
    // If no exact match on slot column, maybe sourceLabel was used as fallback
    // In a real app we'd do an OR condition, but here we enforce slot column.
    notFound();
  }

  // Fetch all questions for these passages
  const passageIds = passages.map(p => p.id);
  const questions = await db
    .select()
    .from(rcQuestions)
    .where(inArray(rcQuestions.passageId, passageIds))
    .orderBy(rcQuestions.sortOrder);

  // Fetch all options
  const questionIds = questions.map(q => q.id);
  const allOptions = questionIds.length > 0 
    ? await db.select().from(rcOptions).where(inArray(rcOptions.questionId, questionIds))
    : [];

  // Group questions by passage and hydrate options
  const populatedPassages = passages.map(passage => {
    const passageQuestions = questions.filter(q => q.passageId === passage.id);
    const populatedQuestions = passageQuestions.map(q => ({
      ...q,
      options: allOptions.filter(o => o.questionId === q.id).sort((a, b) => a.optionKey.localeCompare(b.optionKey))
    }));
    return {
      ...passage,
      questions: populatedQuestions
    };
  });

  const totalQuestions = populatedPassages.reduce((sum, p) => sum + p.questions.length, 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": `${params.exam} ${params.year} ${decodedSlot} RC Mock Test`,
    "about": {
      "@type": "Thing",
      "name": "CAT VARC Reading Comprehension"
    },
    "educationalLevel": "Graduate",
    "numberOfQuestions": totalQuestions,
    "provider": {
      "@type": "Organization",
      "name": "AstraRead",
      "url": "https://astraread.com"
    },
    "hasPart": populatedPassages.map((p, idx) => ({
      "@type": "CreativeWork",
      "name": p.title || `Passage ${idx + 1}`,
      "position": idx + 1,
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RCFullSlotClient groupedPassages={populatedPassages} title={`${params.exam} ${params.year} ${decodedSlot}`} />
    </>
  );
}
