import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const articleStatus = pgEnum("article_status", [
  "draft",
  "published",
  "archived",
]);

export const subscriptionTier = pgEnum("subscription_tier", ["free", "premium"]);
export const grammarSection = pgEnum("grammar_section", ["foundations", "reading_patterns"]);
export const bookmarkType = pgEnum("bookmark_type", ["article", "rc_passage"]);

export const contentSourceType = pgEnum("content_source_type", [
  "rss",
  "scrape",
  "manual",
]);

export const explanationSource = pgEnum("explanation_source", [
  "manual",
  "generated_once",
]);

export const difficultyLevel = pgEnum("difficulty_level", [
  "easy",
  "medium",
  "hard",
]);

export const rcExamType = pgEnum("rc_exam_type", [
  "CAT",
  "XAT",
  "SNAP",
  "NMAT",
  "CUSTOM",
]);

export const rcQuestionTag = pgEnum("rc_question_tag", [
  "inference",
  "tone",
  "main_idea",
  "detail",
  "assumption",
  "vocabulary",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  authProviderUserId: varchar("auth_provider_user_id", { length: 191 })
    .notNull()
    .unique(),
  displayName: varchar("display_name", { length: 120 }),
  email: varchar("email", { length: 255 }),
  subscriptionTier: subscriptionTier("subscription_tier").default("free").notNull(),
  customGoalLabel: varchar("custom_goal_label", { length: 21 }),
  customGoalDate: date("custom_goal_date"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articleSources = pgTable("article_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  homepageUrl: text("homepage_url"),
  feedUrl: text("feed_url"),
  sourceType: contentSourceType("source_type").notNull().default("rss"),
  isActive: boolean("is_active").default(true).notNull(),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .references(() => articleSources.id, { onDelete: "restrict" }),
    externalId: varchar("external_id", { length: 255 }),
    url: text("url"),
    slug: varchar("slug", { length: 255 }).unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    author: varchar("author", { length: 160 }),
    category: varchar("category", { length: 120 }),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
    status: articleStatus("status").default("draft").notNull(),
    wordCount: integer("word_count").default(0).notNull(),
    estimatedReadMinutes: integer("estimated_read_minutes").default(0).notNull(),
    difficultyScore: integer("difficulty_score"),
    gradeLevel: varchar("grade_level", { length: 40 }),
    fullText: text("full_text"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  },
  (table) => [
    // Partial unique index — only enforces uniqueness when url is not null
    uniqueIndex("articles_url_unique").on(table.url),
    index("articles_source_status_idx").on(table.sourceId, table.status),
    index("articles_published_at_idx").on(table.publishedAt),
  ],
);

export const articleParagraphs = pgTable(
  "article_paragraphs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    text: text("text").notNull(),
    connectorWords: jsonb("connector_words").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("article_paragraphs_article_position_unique").on(
      table.articleId,
      table.position,
    ),
  ],
);

export const paragraphExplanations = pgTable("paragraph_explanations", {
  id: uuid("id").defaultRandom().primaryKey(),
  paragraphId: uuid("paragraph_id")
    .notNull()
    .unique()
    .references(() => articleParagraphs.id, { onDelete: "cascade" }),
  simplifiedMeaning: text("simplified_meaning").notNull(),
  paragraphPurpose: text("paragraph_purpose").notNull(),
  keyIdea: text("key_idea").notNull(),
  source: explanationSource("source").default("manual").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articleAnalyses = pgTable("article_analyses", {
  articleId: uuid("article_id")
    .primaryKey()
    .references(() => articles.id, { onDelete: "cascade" }),
  passageSummary: text("passage_summary").notNull(),
  tone: varchar("tone", { length: 120 }).notNull(),
  difficultVocabulary: jsonb("difficult_vocabulary")
    .$type<Array<{ term: string; meaning: string }>>()
    .default([]),
  newPhrases: jsonb("new_phrases").$type<string[]>().default([]),
  centralIdeas: jsonb("central_ideas")
    .$type<Array<{ paragraph: number; idea: string }>>()
    .default([]),
  readingDifficultyScore: integer("reading_difficulty_score"),
  readingGradeLevel: varchar("reading_grade_level", { length: 40 }),
  source: explanationSource("source").default("manual").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userArticleReads = pgTable(
  "user_article_reads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow().notNull(),
    timeSpentSeconds: integer("time_spent_seconds").default(0).notNull(),
  },
  (table) => [
    index("user_article_reads_user_idx").on(table.userId, table.readAt),
  ],
);

export const grammarTopics = pgTable("grammar_topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  section: grammarSection("section").default("foundations").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const grammarLessons = pgTable(
  "grammar_lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => grammarTopics.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    content: text("content").notNull(),
    examples: jsonb("examples").$type<string[]>().default([]),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    index("grammar_lessons_topic_idx").on(table.topicId),
    uniqueIndex("grammar_lessons_topic_title_unique").on(
      table.topicId,
      table.title,
    ),
  ],
);

export const grammarExercises = pgTable(
  "grammar_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => grammarTopics.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => grammarLessons.id, {
      onDelete: "set null",
    }),
    difficulty: difficultyLevel("difficulty").notNull(),
    prompt: text("prompt").notNull(),
    answer: text("answer").notNull(),
    explanation: text("explanation").notNull(),
    choices: jsonb("choices").$type<string[]>().default([]),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    index("grammar_exercises_topic_difficulty_idx").on(
      table.topicId,
      table.difficulty,
    ),
    uniqueIndex("grammar_exercises_topic_prompt_unique").on(
      table.topicId,
      table.prompt,
    ),
  ],
);

export const grammarAttempts = pgTable(
  "grammar_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => grammarExercises.id, { onDelete: "cascade" }),
    answer: text("answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("grammar_attempts_user_idx").on(table.userId)],
);

export const rcPassages = pgTable(
  "rc_passages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examType: rcExamType("exam_type").notNull(),
    year: integer("year").default(0).notNull(),
    slot: varchar("slot", { length: 80 }),
    title: text("title").notNull(),
    passage: text("passage").notNull(),
    sourceLabel: varchar("source_label", { length: 160 }),
    difficulty: difficultyLevel("difficulty").notNull().default("medium"),
    estimatedMinutes: integer("estimated_minutes").default(10).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("rc_passages_exam_title_year_unique").on(
      table.examType,
      table.title,
      table.year,
    ),
  ],
);

export const rcQuestions = pgTable(
  "rc_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    passageId: uuid("passage_id")
      .notNull()
      .references(() => rcPassages.id, { onDelete: "cascade" }),
    tag: rcQuestionTag("tag").notNull(),
    prompt: text("prompt").notNull(),
    correctOptionKey: varchar("correct_option_key", { length: 4 }).notNull(),
    explanation: text("explanation").notNull(),
    toneClues: jsonb("tone_clues").$type<string[]>().default([]),
    trapWords: jsonb("trap_words").$type<string[]>().default([]),
    inferenceLogic: text("inference_logic"),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    index("rc_questions_passage_idx").on(table.passageId),
    uniqueIndex("rc_questions_passage_prompt_unique").on(
      table.passageId,
      table.prompt,
    ),
  ],
);

export const rcOptions = pgTable(
  "rc_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => rcQuestions.id, { onDelete: "cascade" }),
    optionKey: varchar("option_key", { length: 4 }).notNull(),
    text: text("text").notNull(),
    explanation: text("explanation").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("rc_options_question_key_unique").on(
      table.questionId,
      table.optionKey,
    ),
  ],
);

export const rcAttempts = pgTable(
  "rc_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    passageId: uuid("passage_id")
      .notNull()
      .references(() => rcPassages.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    totalSeconds: integer("total_seconds").default(0).notNull(),
    scorePercent: integer("score_percent"),
  },
  (table) => [index("rc_attempts_user_started_idx").on(table.userId, table.startedAt)],
);

export const rcAnswers = pgTable(
  "rc_answers",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => rcAttempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => rcQuestions.id, { onDelete: "cascade" }),
    selectedOptionKey: varchar("selected_option_key", { length: 4 }),
    isCorrect: boolean("is_correct"),
  },
  (table) => [
    primaryKey({ columns: [table.attemptId, table.questionId] }),
    index("rc_answers_question_idx").on(table.questionId),
  ],
);

export const vocabularyItems = pgTable(
  "vocabulary_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleId: uuid("article_id").references(() => articles.id, {
      onDelete: "set null",
    }),
    term: varchar("term", { length: 160 }).notNull(),
    meaning: text("meaning"),
    contextSentence: text("context_sentence"),
    reviewCount: integer("review_count").default(0).notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("vocabulary_user_term_unique").on(table.userId, table.term),
    index("vocabulary_user_review_idx").on(table.userId, table.lastReviewedAt),
  ],
);

export const dailyChecklistTemplates = pgTable(
  "daily_checklist_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    uniqueIndex("daily_checklist_templates_category_title_unique").on(
      table.category,
      table.title,
    ),
  ],
);

export const userDailyTasks = pgTable(
  "user_daily_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => dailyChecklistTemplates.id, {
      onDelete: "set null",
    }),
    taskDate: date("task_date").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    isComplete: boolean("is_complete").default(false).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("user_daily_tasks_user_date_idx").on(table.userId, table.taskDate),
  ],
);

export const userBookmarks = pgTable(
  "user_bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleId: uuid("article_id").references(() => articles.id, { onDelete: "cascade" }),
    rcPassageId: uuid("rc_passage_id").references(() => rcPassages.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_bookmarks_user_idx").on(table.userId),
  ],
);

export const userStreaks = pgTable(
  "user_streaks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    streakType: varchar("streak_type", { length: 40 }).notNull(),
    currentCount: integer("current_count").default(0).notNull(),
    bestCount: integer("best_count").default(0).notNull(),
    lastActivityDate: date("last_activity_date"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_streaks_user_type_unique").on(table.userId, table.streakType),
  ],
);

export const progressSnapshots = pgTable(
  "progress_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    snapshotDate: date("snapshot_date").notNull(),
    readingMinutes: integer("reading_minutes").default(0).notNull(),
    completedArticles: integer("completed_articles").default(0).notNull(),
    grammarCompletionPercent: integer("grammar_completion_percent")
      .default(0)
      .notNull(),
    rcAccuracyPercent: integer("rc_accuracy_percent").default(0).notNull(),
    vocabularyCount: integer("vocabulary_count").default(0).notNull(),
    studyMinutes: integer("study_minutes").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("progress_snapshots_user_date_unique").on(
      table.userId,
      table.snapshotDate,
    ),
  ],
);
