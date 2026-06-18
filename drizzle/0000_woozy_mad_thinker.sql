CREATE TYPE "public"."article_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."content_source_type" AS ENUM('rss', 'scrape', 'manual');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."explanation_source" AS ENUM('manual', 'generated_once');--> statement-breakpoint
CREATE TYPE "public"."rc_exam_type" AS ENUM('CAT', 'XAT', 'SNAP', 'NMAT', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."rc_question_tag" AS ENUM('inference', 'tone', 'main_idea', 'detail', 'assumption', 'vocabulary');--> statement-breakpoint
CREATE TABLE "article_analyses" (
	"article_id" uuid PRIMARY KEY NOT NULL,
	"passage_summary" text NOT NULL,
	"tone" varchar(120) NOT NULL,
	"difficult_vocabulary" jsonb DEFAULT '[]'::jsonb,
	"new_phrases" jsonb DEFAULT '[]'::jsonb,
	"central_ideas" jsonb DEFAULT '[]'::jsonb,
	"reading_difficulty_score" integer,
	"reading_grade_level" varchar(40),
	"source" "explanation_source" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_paragraphs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"text" text NOT NULL,
	"connector_words" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"homepage_url" text,
	"feed_url" text,
	"source_type" "content_source_type" DEFAULT 'rss' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_fetched_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article_sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"external_id" varchar(255),
	"url" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"author" varchar(160),
	"published_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"estimated_read_minutes" integer DEFAULT 0 NOT NULL,
	"difficulty_score" integer,
	"grade_level" varchar(40),
	"full_text" text,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "daily_checklist_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(180) NOT NULL,
	"category" varchar(80) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"lesson_id" uuid,
	"difficulty" "difficulty_level" NOT NULL,
	"prompt" text NOT NULL,
	"answer" text NOT NULL,
	"explanation" text NOT NULL,
	"choices" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"title" varchar(180) NOT NULL,
	"content" text NOT NULL,
	"examples" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grammar_topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "paragraph_explanations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paragraph_id" uuid NOT NULL,
	"simplified_meaning" text NOT NULL,
	"paragraph_purpose" text NOT NULL,
	"key_idea" text NOT NULL,
	"source" "explanation_source" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "paragraph_explanations_paragraph_id_unique" UNIQUE("paragraph_id")
);
--> statement-breakpoint
CREATE TABLE "paragraph_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"paragraph_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"snapshot_date" date NOT NULL,
	"reading_minutes" integer DEFAULT 0 NOT NULL,
	"completed_articles" integer DEFAULT 0 NOT NULL,
	"grammar_completion_percent" integer DEFAULT 0 NOT NULL,
	"rc_accuracy_percent" integer DEFAULT 0 NOT NULL,
	"vocabulary_count" integer DEFAULT 0 NOT NULL,
	"study_minutes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rc_answers" (
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_key" varchar(4),
	"is_correct" boolean,
	CONSTRAINT "rc_answers_attempt_id_question_id_pk" PRIMARY KEY("attempt_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "rc_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"passage_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"total_seconds" integer DEFAULT 0 NOT NULL,
	"score_percent" integer
);
--> statement-breakpoint
CREATE TABLE "rc_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_key" varchar(4) NOT NULL,
	"text" text NOT NULL,
	"explanation" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rc_passages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_type" "rc_exam_type" NOT NULL,
	"year" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"passage" text NOT NULL,
	"source_label" varchar(160),
	"difficulty" "difficulty_level" DEFAULT 'medium' NOT NULL,
	"estimated_minutes" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rc_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"passage_id" uuid NOT NULL,
	"tag" "rc_question_tag" NOT NULL,
	"prompt" text NOT NULL,
	"correct_option_key" varchar(4) NOT NULL,
	"explanation" text NOT NULL,
	"tone_clues" jsonb DEFAULT '[]'::jsonb,
	"trap_words" jsonb DEFAULT '[]'::jsonb,
	"inference_logic" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"total_seconds" integer DEFAULT 0 NOT NULL,
	"font_size" integer DEFAULT 18 NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_type" varchar(40) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"total_seconds" integer DEFAULT 0 NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "user_daily_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"task_date" date NOT NULL,
	"title" varchar(180) NOT NULL,
	"category" varchar(80) NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"streak_type" varchar(40) NOT NULL,
	"current_count" integer DEFAULT 0 NOT NULL,
	"best_count" integer DEFAULT 0 NOT NULL,
	"last_activity_date" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_provider_user_id" varchar(191) NOT NULL,
	"display_name" varchar(120),
	"email" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_provider_user_id_unique" UNIQUE("auth_provider_user_id")
);
--> statement-breakpoint
CREATE TABLE "vocabulary_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"article_id" uuid,
	"term" varchar(160) NOT NULL,
	"meaning" text,
	"context_sentence" text,
	"review_count" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_analyses" ADD CONSTRAINT "article_analyses_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_paragraphs" ADD CONSTRAINT "article_paragraphs_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_source_id_article_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."article_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_attempts" ADD CONSTRAINT "grammar_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_attempts" ADD CONSTRAINT "grammar_attempts_exercise_id_grammar_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."grammar_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_exercises" ADD CONSTRAINT "grammar_exercises_topic_id_grammar_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."grammar_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_exercises" ADD CONSTRAINT "grammar_exercises_lesson_id_grammar_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."grammar_lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_lessons" ADD CONSTRAINT "grammar_lessons_topic_id_grammar_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."grammar_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paragraph_explanations" ADD CONSTRAINT "paragraph_explanations_paragraph_id_article_paragraphs_id_fk" FOREIGN KEY ("paragraph_id") REFERENCES "public"."article_paragraphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paragraph_summaries" ADD CONSTRAINT "paragraph_summaries_session_id_reading_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reading_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paragraph_summaries" ADD CONSTRAINT "paragraph_summaries_paragraph_id_article_paragraphs_id_fk" FOREIGN KEY ("paragraph_id") REFERENCES "public"."article_paragraphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paragraph_summaries" ADD CONSTRAINT "paragraph_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_snapshots" ADD CONSTRAINT "progress_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rc_answers" ADD CONSTRAINT "rc_answers_attempt_id_rc_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."rc_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rc_answers" ADD CONSTRAINT "rc_answers_question_id_rc_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."rc_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rc_attempts" ADD CONSTRAINT "rc_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rc_attempts" ADD CONSTRAINT "rc_attempts_passage_id_rc_passages_id_fk" FOREIGN KEY ("passage_id") REFERENCES "public"."rc_passages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rc_options" ADD CONSTRAINT "rc_options_question_id_rc_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."rc_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rc_questions" ADD CONSTRAINT "rc_questions_passage_id_rc_passages_id_fk" FOREIGN KEY ("passage_id") REFERENCES "public"."rc_passages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_tasks" ADD CONSTRAINT "user_daily_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_tasks" ADD CONSTRAINT "user_daily_tasks_template_id_daily_checklist_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."daily_checklist_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_items" ADD CONSTRAINT "vocabulary_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_items" ADD CONSTRAINT "vocabulary_items_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "article_paragraphs_article_position_unique" ON "article_paragraphs" USING btree ("article_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "articles_url_unique" ON "articles" USING btree ("url");--> statement-breakpoint
CREATE INDEX "articles_source_status_idx" ON "articles" USING btree ("source_id","status");--> statement-breakpoint
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_checklist_templates_category_title_unique" ON "daily_checklist_templates" USING btree ("category","title");--> statement-breakpoint
CREATE INDEX "grammar_attempts_user_idx" ON "grammar_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "grammar_exercises_topic_difficulty_idx" ON "grammar_exercises" USING btree ("topic_id","difficulty");--> statement-breakpoint
CREATE UNIQUE INDEX "grammar_exercises_topic_prompt_unique" ON "grammar_exercises" USING btree ("topic_id","prompt");--> statement-breakpoint
CREATE INDEX "grammar_lessons_topic_idx" ON "grammar_lessons" USING btree ("topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grammar_lessons_topic_title_unique" ON "grammar_lessons" USING btree ("topic_id","title");--> statement-breakpoint
CREATE UNIQUE INDEX "paragraph_summaries_session_paragraph_unique" ON "paragraph_summaries" USING btree ("session_id","paragraph_id");--> statement-breakpoint
CREATE INDEX "paragraph_summaries_user_idx" ON "paragraph_summaries" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_snapshots_user_date_unique" ON "progress_snapshots" USING btree ("user_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "rc_answers_question_idx" ON "rc_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "rc_attempts_user_started_idx" ON "rc_attempts" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "rc_options_question_key_unique" ON "rc_options" USING btree ("question_id","option_key");--> statement-breakpoint
CREATE UNIQUE INDEX "rc_passages_exam_title_year_unique" ON "rc_passages" USING btree ("exam_type","title","year");--> statement-breakpoint
CREATE INDEX "rc_questions_passage_idx" ON "rc_questions" USING btree ("passage_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rc_questions_passage_prompt_unique" ON "rc_questions" USING btree ("passage_id","prompt");--> statement-breakpoint
CREATE INDEX "reading_sessions_user_started_idx" ON "reading_sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "study_sessions_user_started_idx" ON "study_sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "user_daily_tasks_user_date_idx" ON "user_daily_tasks" USING btree ("user_id","task_date");--> statement-breakpoint
CREATE UNIQUE INDEX "user_streaks_user_type_unique" ON "user_streaks" USING btree ("user_id","streak_type");--> statement-breakpoint
CREATE UNIQUE INDEX "vocabulary_user_term_unique" ON "vocabulary_items" USING btree ("user_id","term");--> statement-breakpoint
CREATE INDEX "vocabulary_user_review_idx" ON "vocabulary_items" USING btree ("user_id","last_reviewed_at");