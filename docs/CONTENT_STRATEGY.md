# CONTENT_STRATEGY.md — AstraRead

> Last updated: 2026-06-09

---

## Content Philosophy

AstraRead's content strategy is built on one principle: **every piece of content should make the student a better reader**, not just a faster test-taker. This means:

1. Content is curated, not aggregated — every essay and passage is chosen for its ability to teach reading skills
2. Explanations are pedagogical, not justificatory — they teach *how to think*, not just *what the answer is*
3. Content gets harder gradually — difficulty progression is intentional, not random
4. AI generates structure, humans ensure quality — AI is a tool for speed, not a replacement for editorial judgment

---

## The Four Content Pillars

### 1. Grammar Foundations

**Philosophy:** Grammar is not a subject to memorise. It is a **toolkit for reading**. A student who understands how articles, modifiers, and conjunctions work will parse complex CAT passages more accurately — not because they can identify parts of speech, but because they understand how meaning is constructed.

**What makes this different from other platforms:**
- We don't teach "rules to memorise." We teach "how this grammatical structure changes meaning in context"
- Every grammar lesson connects back to reading — examples come from passages, not textbooks
- Exercises use sentence-level fill-in-the-blank with contextual explanations, not isolated rule drills

**Content Structure:**
```
Topic (e.g., "Articles")
  └── Lesson: Explanation text + contextual examples
      └── Exercises: easy → medium → hard
          └── Each exercise: prompt + choices + answer + explanation
```

**Quality Standards for Grammar Content:**

| Element | Standard |
|---------|----------|
| Lesson content | Must explain the *reading impact*, not just the rule. "Use 'the' when the noun is already known" is acceptable. "'The' signals to the reader that this noun was already established in the argument" is preferred. |
| Examples | Must come from reading contexts. Avoid generic sentences. Use sentences that could appear in a CAT passage. |
| Exercise prompts | Must test contextual understanding, not rule recall. The student should need to understand the *meaning* of the sentence to choose correctly. |
| Explanations | Must explain *why* the correct answer fits the context. "Use 'an' before vowel sounds" is insufficient. "'An' is required here because 'editor' begins with a vowel sound, and the article introduces a previously unknown noun" is the standard. |
| Difficulty progression | Easy: single-blank, clear context. Medium: double-blank, requires understanding relationships between words. Hard: multi-blank or complex sentences where context determines multiple choices. |

**Current State:** 1 topic (Articles), 1 lesson, 5 exercises (2 easy, 2 medium, 1 hard)

**Topic Roadmap (Grammar Foundations — sortOrder < 10):**
1. Articles (done)
2. Subject-Verb Agreement
3. Pronouns and Pronoun Reference
4. Modifiers (Dangling and Misplaced)
5. Parallelism
6. Tense Consistency

**Topic Roadmap (Reading Flow — sortOrder >= 10):**
1. Connector Words and Transitions
2. Tone and Register Shifts
3. Qualifier Words (always, never, most, some)
4. Argument Structure (claim → evidence → counterclaim → conclusion)
5. Scope and Specificity
6. Passive Voice and Attribution

---

### 2. Deep Reading (Reading Flow)

**Philosophy:** Deep reading is the core product. Every essay is a training exercise in **sustained comprehension** — following an argument paragraph by paragraph, understanding how each paragraph contributes to the whole, and recognising the structural patterns authors use.

**What makes this different:**
- Articles are broken into individual paragraphs, each with a prewritten explanation (simplified meaning, purpose, key idea)
- Connector words are highlighted to show how arguments flow between paragraphs
- Tone analysis explains the author's attitude, not just the content
- Difficult vocabulary is extracted with contextual definitions
- Inline questions test comprehension *while reading*, not after

**Content Structure:**
```
Article
  ├── Metadata: title, author, source, category, difficulty, reading time
  ├── Paragraphs (ordered by position)
  │   ├── text (raw paragraph)
  │   ├── connector_words (highlighted transitions)
  │   └── Explanation
  │       ├── simplified_meaning (plain-language paraphrase)
  │       ├── paragraph_purpose (why this paragraph exists)
  │       └── key_idea (central idea)
  ├── Analysis
  │   ├── passage_summary (overall summary)
  │   ├── tone (author's attitude)
  │   ├── difficult_vocabulary [{term, meaning}]
  │   ├── new_phrases [string]
  │   └── central_ideas [{paragraph, idea}]
  └── Inline Questions (optional, inserted between paragraphs)
      ├── prompt
      ├── options
      ├── correct_answer
      └── explanation
```

**Quality Standards for Deep Reading Content:**

| Element | Standard |
|---------|----------|
| Article selection | Must be intellectually challenging, well-structured, and relevant to topics CAT tests (philosophy, science, politics, economics, psychology, literature). Avoid clickbait, listicles, or opinion pieces without argumentative structure. |
| Simplified meaning | Must capture the *functional* meaning, not just paraphrase. "The author is saying X" is acceptable. "This paragraph establishes the central premise by arguing X, which the rest of the essay will complicate" is preferred. |
| Paragraph purpose | Must describe the paragraph's role in the argument: "Introduces the thesis", "Provides experimental evidence", "Offers a counterargument", "Concludes with practical implications." |
| Key idea | One sentence. Must be specific enough that a student who reads only the key ideas gets the argument's skeleton. |
| Connector words | Only include words that serve a logical function: "however", "nevertheless", "therefore", "although", "despite", "consequently." Do not include common prepositions or articles. |
| Difficulty score | 0-100. Based on vocabulary complexity, sentence length, argument density, and domain knowledge required. CAT passage difficulty is typically 60-90. |
| Tone description | Must be a multi-sentence description, not a single word. "Analytical" is insufficient. "Analytical and gently corrective, with an undercurrent of scientific curiosity. The author presents evidence without condescension, guiding the reader toward self-awareness" is the standard. |

**Difficulty Progression:**

| Difficulty | Score Range | Characteristics | Sources |
|-----------|------------|-----------------|---------|
| Moderate | 50-65 | Clear argument, accessible vocabulary, linear structure | The Guardian features, The Hindu editorials |
| Advanced | 65-80 | Complex vocabulary, multi-layered argument, requires inference | Aeon essays, academic journalism |
| CAT+ | 80-95 | Dense philosophical reasoning, embedded counterarguments, specialised vocabulary | Aeon deep essays, Indian intellectual editorials |

---

### 3. CAT Verbal Ability (RC Practice)

**Philosophy:** CAT RC is not about reading speed — it's about **reading loyalty**. A strong reader tracks the author's logic, notices when options subtly distort the passage, and identifies trap words that make wrong answers sound right. Every RC passage in AstraRead trains this specific skill.

**What makes this different:**
- Per-option explanations (not just "A is correct because X")
- Trap word identification (words designed to mislead)
- Tone clues (phrases that reveal the author's attitude)
- Inference logic (the logical step required to reach the answer)
- Question tags (inference, tone, main idea, detail, assumption, vocabulary)
- Deferred feedback — no right/wrong during the attempt, comprehensive review after submission

**Content Structure:**
```
RC Passage
  ├── Metadata: exam_type, year, title, difficulty, estimated_minutes, source_label
  ├── passage (full text)
  └── Questions (ordered by sort_order)
      ├── prompt
      ├── tag (inference/tone/main_idea/detail/assumption/vocabulary)
      ├── correct_option_key
      ├── explanation (overall)
      ├── tone_clues [string] (max 3)
      ├── trap_words [string] (max 3)
      ├── inference_logic (text)
      └── Options (4 per question: A, B, C, D)
          ├── text
          ├── explanation (why correct/incorrect)
          └── is_correct
```

**Two RC Sub-Sections:**

| Section | Content | Access |
|---------|---------|--------|
| **PYQ Practice** | Past CAT exam passages (2020–2025), grouped by year → slot | Free for all users |
| **RC Practice** | Daily-added passages from various sources | 2 free, then paywall |

**Quality Standards for RC Content:**

| Element | Standard |
|---------|----------|
| Passage source | Must be from actual CAT exams (for PYQs) or from high-quality editorial sources (for practice). No synthetic passages. |
| Question prompts | Must test comprehension, not recall. "What does the author mean by X?" is acceptable. "In which paragraph does the author mention X?" is too simple. |
| Per-option explanations | Must explain why each option is correct OR incorrect. Not just the correct one. "Option A is wrong because it overstates the claim — the passage says 'most' but the option says 'all'" is the standard. |
| Trap words | Must identify specific words in wrong options that make them tempting. "always", "never", "only", "fundamentally" are common trap words that overstate cautious claims. |
| Tone clues | Must quote 1-3 short phrases from the passage that reveal the author's attitude. These help students learn to detect tone, not just answer tone questions. |
| Inference logic | One sentence describing the logical step. "The passage states X and implies Y; the correct answer combines both without overstating either." |

---

### 4. Vocabulary

**Philosophy:** Vocabulary is not a separate study topic. It is a **natural byproduct of deep reading**. When a student encounters a difficult word in an essay, they should be able to save it with one click, along with its meaning and the sentence it appeared in. Over time, this builds a personalised vocabulary that is contextually grounded, not abstractly memorised.

**How vocabulary content is generated:**

1. **During article analysis:** Difficult vocabulary is extracted and stored in `article_analyses.difficult_vocabulary` as `[{term, meaning}]`
2. **During reading:** Student clicks "Save to vocab" → word saved to `vocabulary_items` with the article reference and context sentence
3. **Spaced review (future):** Student reviews saved words on `/vocabulary` page, `review_count` increments

**Quality Standards for Vocabulary Content:**

| Element | Standard |
|---------|----------|
| Term selection | Only words that genuinely affect passage comprehension. Not every uncommon word — focus on words that change meaning if misunderstood. |
| Definitions | Must be contextual, not dictionary. "Veneer: A thin decorative covering" is a dictionary definition. "Veneer: Used here to mean a superficial appearance that hides the reality underneath" is contextual. |
| Context sentences | Must be the actual sentence from the article where the word appears. Never fabricate context. |

---

## Content Generation Workflow

### Manual Article Import
1. Find a high-quality essay from Aeon, The Guardian, or The Hindu
2. Open `/admin/import` in AstraRead
3. Fill in metadata: title, author, source slug, category, original URL, cover image
4. Paste full article text (paragraphs separated by blank lines)
5. Optionally add inline questions between paragraphs
6. Submit → paragraphs auto-extracted with connector words
7. (Later) Add paragraph explanations, vocabulary, tone analysis via DB or future admin UI

### AI-Assisted RC Import
1. Obtain a CAT PYQ PDF (from coaching institute materials)
2. Open `/admin/import-rc` in AstraRead
3. Upload PDF + paste answer key (if available)
4. AI extracts passage + questions + options + explanations
5. Review the extracted JSON in the preview panel
6. Save to database

### Grammar Content Creation
1. Define the topic in `src/db/seed.ts`
2. Write the lesson content (supports basic markdown)
3. Create exercises with difficulty progression (easy → medium → hard)
4. Run `npm run db:seed`

---

## Explanation Quality Standards (Universal)

These standards apply across ALL content types:

1. **Never just state the rule — explain the impact on meaning.** A grammar explanation that says "use 'the' for specific nouns" is incomplete. Say "use 'the' when the reader already knows which noun you're referring to — this signals that this noun was established earlier in the argument."

2. **Always connect back to reading.** Every grammar lesson, every vocabulary definition, every RC explanation should help the student become a better reader — not just a better test-taker.

3. **Use precise language.** Avoid vague phrases like "the author feels strongly about this." Instead: "The author's use of 'nevertheless' signals a concession — she acknowledges the counterargument before returning to her thesis."

4. **Show the thinking process.** Explanations should model how a skilled reader thinks: "First, identify the claim. Then, check if the option preserves the claim's scope — does it say 'most' (like the passage) or 'all' (overstating the claim)?"

5. **Be pedagogical, not academic.** Write for a 22-year-old engineering graduate studying for CAT, not for a linguistics professor. Clear, direct, confident tone.
