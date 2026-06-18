import { getDb } from "@/db";
import { grammarTopics, grammarLessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import GrammarPracticeClient from "../../components/GrammarPracticeClient";
import { asc } from "drizzle-orm";
import { grammarExercises } from "@/db/schema";
import ImmersiveShell from "@/components/layout/ImmersiveShell";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const db = getDb();
  const [topic] = await db
    .select({ title: grammarTopics.title, description: grammarTopics.description })
    .from(grammarTopics)
    .where(eq(grammarTopics.slug, params.slug))
    .limit(1);

  if (!topic) return { title: "Topic Not Found" };

  return {
    title: `Grammar & Reading Patterns: ${topic.title}`,
    description: topic.description || `Master ${topic.title} for CAT VARC.`,
  };
}

function renderSimpleMarkdown(content: string) {
  // Handle bold and italic inline formatting
  const formatText = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return content.split('\n\n').map((paragraph, index) => {
    // --- horizontal rule
    if (paragraph.trim() === '---') {
      return <hr key={index} className="my-6 border-[var(--color-border)]" />;
    }

    // ## h2 heading
    if (paragraph.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-semibold text-[var(--color-text)] mt-8 mb-3 tracking-tight">{paragraph.replace('## ', '')}</h2>;
    }

    // ### h3 heading
    if (paragraph.startsWith('### ')) {
      return <h3 key={index} className="text-lg font-semibold text-[var(--color-text)] mt-6 mb-2 tracking-tight">{paragraph.replace('### ', '')}</h3>;
    }

    // > blockquote
    if (paragraph.startsWith('> ')) {
      const quoteText = paragraph.replace(/^> /gm, '');
      return (
        <blockquote key={index} className="my-4 pl-4 border-l-2 border-[var(--color-accent)] text-[var(--color-text)] italic leading-relaxed bg-[var(--color-bg-subtle)] py-3 pr-4 rounded-r-lg text-[0.938rem]">
          {formatText(quoteText)}
        </blockquote>
      );
    }

    // - bullet lists
    if (paragraph.match(/^- /m)) {
      const items = paragraph.split('\n').filter(line => line.trim());
      return (
        <ul key={index} className="space-y-2 my-4">
          {items.map((item, i) => {
            const text = item.replace(/^- /, '');
            return (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--color-accent)] mt-1.5 text-xs">●</span>
                <span className="text-[var(--color-text-subtle)] leading-relaxed text-[0.938rem]">{formatText(text)}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    // Numbered lists
    if (paragraph.match(/^\d+\.\s/)) {
      const items = paragraph.split('\n');
      return (
        <ul key={index} className="space-y-3 my-4">
          {items.map((item, i) => {
            const isNumbered = item.match(/^\d+\.\s/);
            const text = item.replace(/^\d+\.\s(-\s)?/, '').replace(/^-\s/, '');
            return (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--color-accent)] mt-1 font-semibold text-sm">
                  {isNumbered ? `${i + 1}.` : "◦"}
                </span>
                <span className="text-[var(--color-text-subtle)] leading-relaxed text-[0.938rem]">{formatText(text)}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    // Regular paragraph
    return <p key={index} className="text-[var(--color-text-subtle)] leading-[1.8] text-[0.938rem] mb-4">{formatText(paragraph)}</p>;
  });
}

export default async function GrammarLessonPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const db = getDb();
  
  const [topic] = await db.select()
    .from(grammarTopics)
    .where(eq(grammarTopics.slug, params.slug))
    .limit(1);

  if (!topic) {
    notFound();
  }

  const [lesson] = await db.select()
    .from(grammarLessons)
    .where(eq(grammarLessons.topicId, topic.id))
    .limit(1);

  if (!lesson) {
    notFound();
  }

  const examples = (lesson.examples as string[]) || [];

  const exercises = await db.select()
    .from(grammarExercises)
    .where(eq(grammarExercises.topicId, topic.id))
    .orderBy(asc(grammarExercises.sortOrder));

  const user = await getCurrentUser();
  // Premium check bypassed for now (easy toggle later)
  const isPremium = true; // process.env.NODE_ENV === 'development' || user?.dbUser?.subscriptionTier === 'premium';
  
  // Topic with sortOrder > 1 are locked for free users
  const isLocked = !isPremium && topic.sortOrder > 1;

  if (isLocked) {
    return (
      <ImmersiveShell>
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[var(--color-bg)]/90 backdrop-blur-md border border-[var(--color-border)] p-8 rounded-3xl max-w-md mx-auto shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[var(--color-text)] mb-3">
              Unlock the full grammar syllabus
            </h3>
            <p className="text-[var(--color-text-subtle)] mb-8">
              This topic is part of AstraRead Premium. Upgrade to get access to all deep structural analysis lessons and practice questions.
            </p>
            <Link
              href="/pricing"
              className="block w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
            >
              View Premium Plans
            </Link>
            <Link
              href="/grammar"
              className="block w-full py-4 mt-2 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors"
            >
              Back to Topics
            </Link>
          </div>
        </div>
      </ImmersiveShell>
    );
  }

  return (
    <ImmersiveShell>
      <div className="max-w-4xl mx-auto py-8 px-6 fade-in">
        <Link 
          href="/grammar" 
          className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Topics
        </Link>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] rounded-full text-xs font-medium mb-3 uppercase tracking-wider">
            <BookOpen size={12} />
            Lesson {topic.sortOrder}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] mb-2">
            {topic.title}
          </h1>
          <p className="text-base text-[var(--color-text-subtle)]">
            {lesson.title}
          </p>
        </header>

        <div className="prose-container bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-6 md:p-8 shadow-sm mb-8">
          {renderSimpleMarkdown(lesson.content)}
          
          {examples.length > 0 && (
            <div className="mt-8 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Examples in Practice</h4>
              <div className="space-y-3">
                {examples.map((ex, i) => (
                  <div key={i} className="pl-3 border-l-2 border-[var(--color-accent)] text-[var(--color-text)] italic text-[0.875rem] leading-relaxed">
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {exercises.length > 0 && (
          <div className="mt-10 pt-10 border-t border-[var(--color-border)]">
            <GrammarPracticeClient topic={topic} exercises={exercises} />
          </div>
        )}
      </div>
    </ImmersiveShell>
  );
}
