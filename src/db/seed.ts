import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { closeDb, getDb } from ".";
import {
  articleSources,
  dailyChecklistTemplates,
  grammarExercises,
  grammarLessons,
  grammarTopics,
  rcOptions,
  rcPassages,
  rcQuestions,
} from "./schema";

config({ path: ".env.local" });
config();

const db = getDb();

async function seedArticleSources() {
  const sources = [
    {
      name: "Aeon",
      slug: "aeon",
      homepageUrl: "https://aeon.co",
      feedUrl: "https://aeon.co/feed.rss",
      sourceType: "rss" as const,
    },
    {
      name: "The Guardian Long Reads",
      slug: "guardian-long-reads",
      homepageUrl: "https://www.theguardian.com/news/series/the-long-read",
      feedUrl: "https://www.theguardian.com/news/series/the-long-read/rss",
      sourceType: "rss" as const,
    },
    {
      name: "The Hindu Editorials",
      slug: "the-hindu-editorials",
      homepageUrl: "https://www.thehindu.com/opinion/editorial/",
      sourceType: "scrape" as const,
    },
  ];
  await db.insert(articleSources).values(sources).onConflictDoNothing({ target: articleSources.slug });
}

async function seedChecklist() {
  await db
    .insert(dailyChecklistTemplates)
    .values([
      { title: "Read one long paragraph slowly", category: "reading", sortOrder: 1 },
      { title: "Write 3 paragraph summaries", category: "reading", sortOrder: 2 },
      { title: "Finish one grammar micro-drill", category: "grammar", sortOrder: 3 },
      { title: "Attempt one inference question", category: "rc", sortOrder: 4 },
      { title: "Review today's vocabulary", category: "vocabulary", sortOrder: 5 },
    ])
    .onConflictDoNothing({ target: [dailyChecklistTemplates.category, dailyChecklistTemplates.title] });
}

// ─────────────────────────────────────────────────────────────
// HELPER — upsert a topic + one lesson + N exercises
// ─────────────────────────────────────────────────────────────
async function upsertTopic(
  topicData: { slug: string; title: string; description: string; sortOrder: number; section: "foundations" | "reading_patterns" },
  lessonData: { title: string; content: string; examples: string[] },
  exercises: { difficulty: "easy" | "medium" | "hard"; prompt: string; choices: string[]; answer: string; explanation: string }[]
) {
  await db.insert(grammarTopics).values({ ...topicData, isPublished: true }).onConflictDoUpdate({
    target: grammarTopics.slug,
    set: { title: topicData.title, description: topicData.description, sortOrder: topicData.sortOrder, section: topicData.section },
  });

  const [topic] = await db.select().from(grammarTopics).where(eq(grammarTopics.slug, topicData.slug)).limit(1);
  if (!topic) return;

  // Clean slate: delete old exercises and lessons for this topic, then re-insert
  await db.delete(grammarExercises).where(eq(grammarExercises.topicId, topic.id));
  await db.delete(grammarLessons).where(eq(grammarLessons.topicId, topic.id));

  const [lesson] = await db
    .insert(grammarLessons)
    .values({ topicId: topic.id, ...lessonData, sortOrder: 1 })
    .returning();

  let order = 1;
  for (const ex of exercises) {
    await db
      .insert(grammarExercises)
      .values({ topicId: topic.id, lessonId: lesson?.id, ...ex, sortOrder: order++ });
  }
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 1 — ARTICLES
// ═══════════════════════════════════════════════════════════════
async function seedArticles() {
  await upsertTopic(
    {
      slug: "articles",
      title: "Articles",
      description: "How a/an/the signal what the reader already knows — and what they're being introduced to.",
      sortOrder: 1,
      section: "foundations",
    },
    {
      title: "How Articles Signal Reader Knowledge",
      content: `## Why This Matters For Reading

When an author writes *a researcher*, they are introducing someone you have not met yet. When they switch to *the researcher* two sentences later, they are assuming you already know who they mean. This shift is deliberate — and if you miss it, you may lose track of whether the author is speaking generally or about a specific, already-established idea.

In complex essays and CAT RC passages, articles do heavy cognitive work. They tell you whether a concept is being introduced for the first time, or whether it is a concept the argument has already built up. Missing that signal means reading each sentence in isolation rather than as part of a flowing argument.

Consider what happens when you read a dense paragraph about economic policy. The author writes *a new framework for taxation* in paragraph two, and then in paragraph four refers to *the framework*. If you do not connect these two references — if you treat *the framework* as some other, unrelated idea — you have lost the argument's thread entirely. Articles are the stitches that hold an argument together across paragraphs.

---

## Core Idea

There are two fundamental jobs articles perform in English:

**Introducing** (a / an): Used when the noun is new to the reader. The reader has no prior knowledge of this specific thing. The author is saying: *here is something you have not encountered before in this text.*

**Referring Back** (the): Used when the noun is already known — either because it was mentioned before, because the context makes it uniquely identifiable, or because it is the only one of its kind. The author is saying: *you already know what I mean.*

*A* is used before consonant sounds. *An* before vowel sounds. This is about sound, not spelling — so it is *an hour* (silent h) and *a university* (sounds like "you").

There is also a third pattern that matters for reading: **no article at all** (the zero article). When an author writes *Democracy requires participation*, they are making a universal statement about democracy as a concept — not a specific democracy, not one particular instance, but the abstract idea itself. Contrast this with *The democracy requires participation*, which refers to a specific democratic system already established in the text.

---

## Reading Impact

### How Articles Change the Strength of a Claim

When an author uses *the*, they are making an assumption about shared knowledge. If you have not established that knowledge yet, the sentence will feel abrupt or confusing. This is why dense academic writing sometimes feels hard to follow — the author assumes you already know what *the argument* or *the framework* refers to.

Conversely, when you see *a* or *an*, the author is deliberately presenting something as new or unresolved. In an editorial, *a solution* suggests one possibility among many. *The solution* asserts there is one clear answer. This distinction completely changes the strength of the author's claim.

### How Articles Track Argument Progression

Articles create a pattern of introduction and reference that maps the flow of an argument:

> *A study published in 2019 examined the relationship between screen time and sleep quality. The study found that participants who reduced their screen time by one hour experienced measurably better sleep. These findings were replicated in a follow-up experiment, but the replication raised new questions about the mechanism involved.*

Notice the pattern: *a study* (new, introduced) → *the study* (now known) → *a follow-up experiment* (new) → *the replication* (referring back) → *the mechanism* (specific mechanism implied by context). Each article shift tells you whether you are meeting something new or reconnecting with something familiar.

### How Articles Signal Generalisation vs Specificity

In editorial and philosophical writing, the choice between *a* and *the* before abstract nouns signals whether the author is speaking broadly or narrowly:

- *A democratic government should protect minority rights.* → Any democratic government. A general principle.
- *The democratic government should protect minority rights.* → A specific government being discussed. A targeted claim.

Misreading this distinction leads to one of the most common errors in CAT RC: treating a specific claim as a universal one, or vice versa.

---

## Common Reader Mistakes

**Mistake 1: Treating *the* as a mere filler word.**
- Wrong reading: "The economy grew" = just a fact about the economy.
- Right reading: "The economy" refers to a *specific* economy already discussed — probably the one central to the author's argument.
- Why it happens: In everyday speech, we use *the* casually. In formal writing, every *the* points backward to something established.

**Mistake 2: Missing when an argument shifts from general to specific.**
- "A democratic government should represent its people. The government's failure in this regard is well-documented."
- The shift from *a* to *the* signals: we were speaking generally; now we are talking about a specific one. The reader who misses this shift does not realise the author has narrowed the scope of the argument.

**Mistake 3: Not noticing when *a* signals one-of-many.**
- "She proposed a solution to the housing crisis."
- *A solution* — one possibility among several. The author is not claiming this is the only answer. If you read it as *the* solution, you overstate the author's certainty.

**Mistake 4: Failing to track *the* across paragraphs.**
- Authors introduce a concept in paragraph one (*a tension between liberty and equality*) and refer to it in paragraph four (*the tension*). If the reader does not connect these, they treat paragraph four as introducing a new idea rather than developing the earlier one.

**Mistake 5: Ignoring the zero article in abstract claims.**
- "Education transforms societies" (zero article — universal, abstract claim about education as a concept).
- "The education transforms societies" would be wrong — *the education* implies a specific educational programme.
- Missing this distinction means confusing whether the author is speaking philosophically or referring to a specific policy.

---

## Contextual Examples

1. *A researcher at the University of Chicago proposed that cognitive biases are not errors but adaptive shortcuts.*
→ *A researcher* introduces this person for the first time. The author is not assuming you know who they are. *The University of Chicago* uses *the* because there is only one — it is uniquely identifiable.
→ **Reading takeaway:** When you see *a* before a person, they are being introduced. When you see *the* before an institution, it is assumed to be known.

2. *The crisis revealed deep structural weaknesses in the financial system.*
→ *The crisis* assumes the reader knows which crisis. In an essay about 2008, this refers to the financial crisis already established as the subject. *The financial system* is uniquely identifiable in context.
→ **Reading takeaway:** If you see *the* and cannot identify what it refers to, you have a comprehension gap — reread the preceding paragraphs.

3. *An assumption hidden in the argument is that economic growth inevitably reduces poverty.*
→ *An assumption* — one specific but newly identified assumption. The author is surfacing something the reader has not noticed before. *The argument* refers to the argument already under discussion.
→ **Reading takeaway:** *An* before abstract nouns often signals the author is introducing a new analytical point.

4. *Governments face a dilemma: invest in short-term relief or long-term infrastructure. The dilemma is not merely fiscal but fundamentally political.*
→ *A dilemma* introduces it. *The dilemma* in the next sentence refers back to the same one. The shift signals: now we are analysing the specific problem we just named.
→ **Reading takeaway:** Track article shifts across sentences — they trace the argument's focus.

5. *In a society where institutions are weak, the rule of law becomes aspirational rather than functional.*
→ *A society* — hypothetical, one type among many. *The rule of law* — a well-known, uniquely identifiable concept. The article choice tells you: the society is imagined, but the concept being discussed is specific and real.
→ **Reading takeaway:** *A* in conditional or hypothetical contexts signals the author is constructing a scenario, not describing reality.

6. *The author presents an alternative reading of the data — one that challenges the established consensus.*
→ *An alternative reading* — newly introduced. *The data* and *the established consensus* — already known from prior context.
→ **Reading takeaway:** When *an* appears before an analytical term, the author is opening a new interpretive path.

7. *A nation's identity is shaped by the stories it tells about itself. The story of progress, in particular, has proven remarkably resilient.*
→ *A nation's identity* — general claim about any nation. *The stories* — the specific category of stories that shape identity. *The story of progress* — a specific, well-known narrative being singled out.
→ **Reading takeaway:** Notice when *the* narrows from a general category to a specific instance within that category.

8. *Critics have pointed to a fundamental flaw in the methodology. The flaw — the absence of a control group — undermines the study's central finding.*
→ *A fundamental flaw* introduces it. *The flaw* refers back and then specifies what the flaw is. *A control group* is introduced as the missing element.
→ **Reading takeaway:** The pattern *a [noun]* → *the [noun]* → specification is how authors build explanations incrementally.

---

## Pattern Recognition

- **a / an** = first encounter. The author is introducing this noun for the first time. Pay attention — this is new information.
- **the** = already known. Look back a sentence or two — what was established that this refers to? If you cannot find the antecedent, reread.
- When you see **the** before an abstract noun (*the truth*, *the argument*, *the implication*), the author is being very specific about something they have already built up. Do not read it as a general statement.
- **Zero article** before abstract nouns (*Democracy*, *Education*, *Justice*) = universal, philosophical claim about the concept itself.
- When *a/an* appears in a conditional clause (*if a government*, *when a reader*), the author is constructing a hypothetical. Do not read it as referring to a specific case.
- The shift from *a* to *the* across sentences is the author saying: "I introduced this; now I am developing it." Track these shifts to follow the argument.

---

## Real RC Application

Consider this passage:

> *A growing body of research suggests that prolonged social isolation affects not only mental health but also physical wellbeing. The research, conducted across fourteen countries over a decade, found that individuals who reported fewer than two meaningful social interactions per week had significantly elevated cortisol levels. The implications of these findings extend beyond individual health: they suggest that social policy must treat isolation as a public health concern, not merely a personal one.*

Notice how articles map the argument:
- *A growing body of research* — introduces the research for the first time. The reader has not seen this before.
- *The research* — now refers back to the same body of research, adding specifics (fourteen countries, a decade).
- *The implications* — refers to the implications of *these findings* (just established). The reader is expected to connect this.

A weak reader might miss that *the implications* refers specifically to the cortisol findings, not to social isolation in general. A strong reader tracks the article shifts and knows exactly what *the* points to at each moment.

---

## Key Takeaways

- Articles are not decorative. Every *a*, *an*, and *the* carries information about whether something is new or already known.
- *A/an* introduces. *The* refers back. Track these shifts to follow an argument across paragraphs.
- When you see *the* and cannot identify what it refers to, that is a comprehension gap — do not keep reading. Go back.
- The difference between *a solution* and *the solution* is the difference between one possibility and the definitive answer. This changes the author's claim entirely.
- Zero article before abstract nouns signals a universal, philosophical claim — not a reference to something specific.
- In CAT RC, watch for answer options that swap *a* for *the* or vice versa. That single article change can overstate or understate the passage's claim.
- The pattern *a [noun]* → *the [noun]* across sentences is the skeleton of argumentative development. Learn to see it.`,
      examples: [
        "A researcher proposed a theory. The theory was later contested by her peers. → 'The theory' refers back to the same theory just introduced. The article shift signals continuity.",
        "'The democratic deficit' in an essay assumes the reader already understands which deficit is being discussed — if you don't, reread.",
        "'She offered a solution' (one possibility) vs 'She offered the solution' (the only or definitive one) — the article changes the claim's strength entirely.",
        "'An assumption hidden in the option' — 'an' signals this is one specific, newly identified assumption the reader hasn't noticed before.",
        "'The passage argues…' — 'the' refers to the specific passage you are reading, already established as the subject.",
        "'A crisis of legitimacy has emerged.' → introduces. 'The crisis deepened after the election.' → refers back. Track the shift.",
        "'Education is a fundamental right.' (zero article = universal) vs 'The education system needs reform.' (specific system).",
        "'In a country where institutions are fragile, the judiciary often becomes the last line of defence.' → 'a country' = hypothetical; 'the judiciary' = specific institution.",
      ],
    },
    [
      // ── EASY (5) ─────────────────────────────────────────────
      {
        difficulty: "easy",
        prompt: "She wanted to become ___ editor who could identify ___ tone of a passage.",
        choices: ["a, a", "a, the", "an, a", "an, the"],
        answer: "an, the",
        explanation: "Use 'an' before 'editor' because it begins with a vowel sound. Use 'the' before 'tone' because we're referring to the specific tone of that specific passage — already identified in context.",
      },
      {
        difficulty: "easy",
        prompt: "The philosopher proposed ___ argument that changed everything. ___ argument was later called the 'naturalistic fallacy'.",
        choices: ["a, A", "the, The", "a, The", "an, The"],
        answer: "an, The",
        explanation: "The first blank introduces the argument for the first time, so 'an' is correct (vowel sound). The second blank refers back to that same argument, now known to the reader — so 'The' is correct.",
      },
      {
        difficulty: "easy",
        prompt: "When reading ___ editorial, it helps to first identify ___ author's main claim.",
        choices: ["a, a", "the, the", "an, the", "a, the"],
        answer: "an, the",
        explanation: "'An editorial' introduces it generally — any editorial, not a specific one. 'The author's main claim' refers to the specific claim of that specific editorial — already implied by context.",
      },
      {
        difficulty: "easy",
        prompt: "___ study published in 2020 examined the effects of remote work on productivity. ___ study was widely cited within months.",
        choices: ["The, The", "A, The", "A, A", "The, A"],
        answer: "A, The",
        explanation: "'A study' — introduced for the first time, the reader has not encountered it before. 'The study' in the second sentence refers back to the same study, now established. This is the classic introduction-then-reference pattern.",
      },
      {
        difficulty: "easy",
        prompt: "He was not ___ only person to notice ___ flaw in the reasoning.",
        choices: ["a, the", "the, the", "an, a", "the, a"],
        answer: "the, the",
        explanation: "'The only person' — 'the' is required before 'only' because it identifies a unique position. 'The flaw' — the specific flaw being discussed. Both nouns are specific and identifiable in context.",
      },
      // ── MEDIUM (5) ────────────────────────────────────────────
      {
        difficulty: "medium",
        prompt: "In economics, ___ market failure occurs when ___ invisible hand fails to allocate resources efficiently.",
        choices: ["a, the", "the, a", "a, an", "the, the"],
        answer: "a, the",
        explanation: "'A market failure' — introduced as one type of event, not a specific instance. 'The invisible hand' is a well-known, uniquely identifiable concept in economics — there is only one, so 'the' is correct.",
      },
      {
        difficulty: "medium",
        prompt: "The committee reached ___ consensus after hours of debate. ___ consensus, however, was fragile.",
        choices: ["a, A", "the, The", "a, The", "an, The"],
        answer: "a, The",
        explanation: "'A consensus' introduces the event — it was newly achieved, not previously known. 'The consensus' in the second sentence refers back to that specific one just established. The shift signals: now we're analysing the specific thing we just mentioned.",
      },
      {
        difficulty: "medium",
        prompt: "For ___ society to function, it must have ___ shared set of values — or at least ___ appearance of one.",
        choices: ["a, a, an", "the, the, the", "a, the, an", "a, a, a"],
        answer: "a, a, an",
        explanation: "All three nouns are introduced generally — no specific society, set, or appearance has been referenced before. All are hypothetical. 'An' before 'appearance' is required because it begins with a vowel sound.",
      },
      {
        difficulty: "medium",
        prompt: "___ assumption underlying the author's argument is that cultural norms are static. ___ assumption, however, is contradicted by the very evidence she presents in paragraph three.",
        choices: ["The, The", "An, The", "A, The", "An, An"],
        answer: "An, The",
        explanation: "'An assumption' — the author is surfacing something new, identifying a hidden premise for the first time. 'The assumption' — now referring back to the one just identified. The article shift creates a two-step move: identify it, then critique it.",
      },
      {
        difficulty: "medium",
        prompt: "___ historian who studies revolutions will recognise ___ pattern: ___ initial burst of optimism followed by ___ consolidation of power.",
        choices: ["A, a, an, a", "The, the, the, the", "A, the, the, a", "A, a, a, the"],
        answer: "A, a, an, a",
        explanation: "All nouns are generic and hypothetical. 'A historian' — any historian, not a specific one. 'A pattern' — one pattern being introduced. 'An initial burst' and 'a consolidation' — both parts of the newly introduced pattern. No noun here is specific or previously established.",
      },
      // ── HARD (5) ──────────────────────────────────────────────
      {
        difficulty: "hard",
        prompt: "To understand ___ passage, one must first grasp ___ subtle tension between ___ author's stated claim and ___ implication embedded in her final paragraph.",
        choices: ["a, the, an, the", "the, a, the, an", "the, the, the, the", "a, a, the, an"],
        answer: "the, the, the, the",
        explanation: "All four nouns are specific and identifiable: 'the passage' (the one being discussed), 'the subtle tension' (the specific one the sentence is about to describe), 'the author's stated claim' (that author's specific claim), 'the implication' (the particular one in her final paragraph). Every article is 'the'.",
      },
      {
        difficulty: "hard",
        prompt: "She made ___ error that undermined ___ entire argument. ___ error was not factual but structural — she had assumed ___ conclusion without establishing ___ premise.",
        choices: ["an, her, The, a, a", "a, the, The, the, the", "an, the, The, a, the", "a, the, An, a, a"],
        answer: "an, the, The, a, the",
        explanation: "'An error' (new, introduced for first time; vowel sound). 'The entire argument' (her specific argument, already established). 'The error' (refers back). 'A conclusion' (introduced as an unspecified conclusion she drew). 'The premise' (the specific premise that should have supported that conclusion).",
      },
      {
        difficulty: "hard",
        prompt: "Critics argue that ___ welfare state creates ___ culture of dependency. Yet ___ evidence suggests that ___ opposite may be true: countries with strong welfare systems often report higher levels of civic engagement.",
        choices: ["the, a, the, the", "a, a, the, the", "the, the, a, the", "a, a, an, the"],
        answer: "a, a, the, the",
        explanation: "'A welfare state' — generic, one type among many. 'A culture of dependency' — newly introduced concept. 'The evidence' — the body of evidence already known in the discourse. 'The opposite' — refers back to the claim just made; this is the specific opposite of that specific claim.",
      },
      {
        difficulty: "hard",
        prompt: "___ problem with ___ argument is not that it lacks evidence but that ___ evidence it cites supports ___ narrower conclusion than ___ one the author draws.",
        choices: ["The, the, the, a, the", "A, an, the, the, a", "The, an, a, a, the", "A, the, a, the, the"],
        answer: "The, the, the, a, the",
        explanation: "'The problem' — specific, about to be identified. 'The argument' — the one under discussion. 'The evidence it cites' — the specific evidence already mentioned. 'A narrower conclusion' — one newly introduced, not previously specified. 'The one the author draws' — the specific conclusion already attributed to the author.",
      },
      {
        difficulty: "hard",
        prompt: "___ theory that has dominated development economics for decades rests on ___ assumption that markets, left to themselves, tend toward equilibrium. ___ assumption has been challenged by ___ growing body of empirical research suggesting that market failures are ___ norm rather than ___ exception in developing economies.",
        choices: ["The, an, The, a, the, the", "A, the, The, the, a, an", "The, the, This, a, the, the", "A, an, This, a, a, an"],
        answer: "The, an, The, a, the, the",
        explanation: "'The theory' — specific, well-known in the field. 'An assumption' — one specific assumption being surfaced for the first time. 'The assumption' — now referring back. 'A growing body' — newly introduced evidence. 'The norm' and 'the exception' — uniquely identifiable concepts being contrasted.",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 2 — SUBJECT-VERB AGREEMENT
// ═══════════════════════════════════════════════════════════════
async function seedSubjectVerbAgreement() {
  await upsertTopic(
    {
      slug: "subject-verb-agreement",
      title: "Subject-Verb Agreement",
      description: "How to identify the true subject of a sentence — even when the author buries it.",
      sortOrder: 2,
      section: "foundations",
    },
    {
      title: "Finding the True Subject in Complex Sentences",
      content: `## Why This Matters For Reading

CAT passages and dense essays rarely write short, clean sentences. They write long ones — with embedded clauses, parenthetical insertions, and noun phrases that separate the subject from its verb by ten or fifteen words. When the subject and verb are far apart, readers often latch onto the nearest noun as the subject — and misread the sentence entirely.

Subject-verb agreement is not just a grammar rule. It is a diagnostic tool. When something feels "off" in a long sentence, it is often because your eye has picked up the wrong subject. And if you misidentify the subject, you misidentify *what is doing what* — which means you have misread the sentence's core claim.

Consider this sentence: "The proliferation of social media platforms, together with the collapse of traditional gatekeeping institutions, **has** fundamentally altered how information flows through democratic societies." What *has altered* information flow? Not *platforms*. Not *institutions*. The subject is *the proliferation* — singular. If you read this as *platforms have altered*, you are attributing the agency to the wrong noun and subtly changing the argument. The author is saying the *proliferation* (the process of spreading) is the cause — not the platforms themselves.

---

## Core Idea

A verb must agree with its **true subject** — not the noun closest to it, not the most recent noun, but the grammatical subject of the clause.

The most common reading trap: **intervening phrases**. When a phrase appears between the subject and verb, it can mask the true subject.

> "The committee, along with its advisors, **is** reviewing the policy."

The subject is *the committee* (singular), not *advisors* (plural). *Along with its advisors* is an interrupting phrase that has no effect on agreement.

### Key Intervening Phrases That Never Change the Subject

These phrases sit between the subject and verb but do NOT affect agreement. Cross them out mentally when reading:

- *along with*, *together with*, *as well as*
- *in addition to*, *accompanied by*
- *including*, *rather than*, *besides*
- *of [noun]* — prepositional phrases starting with "of"

### Subjects That Trip Readers

- **Each / Every / Neither / Either** — always singular, even when followed by plural nouns. "Each of the proposals **contains** flaws."
- **Collective nouns** — *committee*, *government*, *team*, *data*, *criteria* — can be singular or plural depending on context.
- **Noun clauses** — "What troubles economists most **is** the unpredictability" — the whole clause "What troubles economists most" is singular.
- **Inverted sentences** — "Among the key findings **was** a correlation between poverty and voter turnout." The subject (*a correlation*) comes after the verb.

---

## Reading Impact

### Identifying Who Is Doing What

When you identify the correct subject-verb pair in a long sentence, you unlock what the sentence is actually claiming. Many comprehension errors in RC passages happen not because students do not know vocabulary, but because they cannot identify *who is doing what*.

Consider: "The rise of nationalist movements across Europe, despite decades of integration efforts, **has** challenged the assumptions underlying EU policy."

The subject is *the rise* — singular. The verb is *has challenged*. The intervening phrase is *despite decades of integration efforts*. If you misread the subject as *movements* or *efforts*, you misread what is doing the challenging. The author is not saying movements challenged anything — the *rise* (the trend, the phenomenon) challenged the assumptions.

### Subject-Verb Agreement as an Argument Map

In analytical writing, the subject of a sentence is the thing the author is asserting something about. Getting the subject wrong means attributing the claim to the wrong entity. In a passage about economic policy, confusing whether "the government" or "the consequences of government intervention" is the subject can lead to attributing agency where the author intended to describe effects.

### How It Affects RC Questions

Main idea questions require you to identify what the passage is about — which requires knowing what the subjects of key sentences are. Inference questions require you to track what is causing what — which requires knowing which noun is the agent. Even tone questions depend on whether the author is attributing action to a person, an institution, or an abstract process.

---

## Common Reader Mistakes

**Mistake 1: Agreement with the nearest noun.**
- "The quality of his arguments **were** poor." → Incorrect. Subject = *quality* (singular). Should be *was*.
- Reading impact: "Were" makes you feel multiple things are weak. "Was" pinpoints that it is the quality — the coherence — that is failing. The author is making a specific critique, not a general one.

**Mistake 2: Misreading collective nouns.**
- "The team **has** decided." (team acting as one unit) vs "The team **have** different opinions." (members acting individually)
- In RC, collective nouns like *government*, *committee*, *data*, *criteria* behave differently depending on whether they are acting as a single body or as separate individuals. Getting this wrong changes whether the author is describing unity or disagreement.

**Mistake 3: Inverted sentences.**
- "Among the most influential ideas of the 20th century **was** the notion of unconscious bias."
- Subject = *the notion* (singular). *Among the most influential ideas* is a prepositional phrase, not the subject. Students often read *ideas* as the subject and expect *were*.

**Mistake 4: "One of those who" constructions.**
- "She is one of those economists who **argue** that markets are inherently unstable."
- The subject of the relative clause is *who*, which refers to *those economists* (plural) — so the verb is *argue*, not *argues*. The sentence is saying: among the economists who hold this view, she is one.

**Mistake 5: Compound subjects with "or" / "nor".**
- "Neither the minister nor the advisors **were** willing to comment."
- With *neither...nor* and *either...or*, the verb agrees with the noun closest to it. Here, *advisors* (plural) is closest, so *were* is correct. But: "Neither the advisors nor the minister **was** willing" — now *minister* (singular) is closest.

---

## Contextual Examples

1. *The decline of manufacturing jobs in post-industrial economies **has** reshaped political allegiances.*
→ Subject: *decline* (singular), not *jobs* or *economies*. The prepositional phrase *of manufacturing jobs in post-industrial economies* modifies the subject but does not change it.
→ **Reading takeaway:** Strip away prepositional phrases to find the true subject. What has reshaped political allegiances? The *decline* — a process, not the jobs themselves.

2. *Each of the proposed solutions **carries** significant methodological risks.*
→ Subject: *Each* (always singular). *Of the proposed solutions* is a prepositional phrase. The sentence is about each individual solution, not the group.
→ **Reading takeaway:** *Each* and *every* are always singular — they individualise, even when followed by plural nouns.

3. *The data from the longitudinal study **suggest** a different interpretation of the results.*
→ *Data* is the plural of *datum*. In academic writing, *data* typically takes a plural verb. In journalism, it sometimes takes a singular verb. Notice which register the passage uses — it tells you whether the author is writing formally or informally.
→ **Reading takeaway:** Words like *data*, *criteria*, *phenomena*, and *media* are Latin/Greek plurals. In academic contexts, they take plural verbs.

4. *Neither the policy nor the incentives **are** sufficient to address the structural causes of the problem.*
→ With *neither...nor*, the verb agrees with the nearer noun: *incentives* (plural). So *are* is correct.
→ **Reading takeaway:** With *or/nor* constructions, look at the noun closest to the verb to determine agreement.

5. *What troubles economists most about the current crisis **is** the unpredictability of consumer behaviour in an era of information overload.*
→ Subject: *What troubles economists most* — this entire clause functions as a singular noun. The verb *is* agrees with this clause, not with *economists*.
→ **Reading takeaway:** Noun clauses beginning with *what*, *how*, *why*, or *that* are treated as singular subjects.

6. *The series of reforms introduced by the current administration, despite widespread public opposition and vocal criticism from the judiciary, **has** failed to achieve its stated objectives.*
→ Subject: *the series* (singular). Everything between the subject and the verb — *of reforms...criticism from the judiciary* — is a massive intervening phrase. Cross it out mentally to see the core: "The series...has failed."
→ **Reading takeaway:** The longer the intervening phrase, the more likely you are to lose the subject. Train yourself to find the verb first, then ask: what is doing this action?

7. *There **are** significant differences between how the two economists model the relationship between inflation and unemployment.*
→ Inverted sentence. *There* is not the subject — the true subject is *differences* (plural), which comes after the verb.
→ **Reading takeaway:** Sentences beginning with *There is/are* or *Here is/are* are inverted. The subject follows the verb.

8. *A number of scholars **have** argued that the effects of colonialism extend far beyond political structures.*
→ *A number of* is treated as plural (it means "several" or "many"). Contrast with *the number of*, which is singular ("the quantity").
→ **Reading takeaway:** *A number of* = plural (many). *The number of* = singular (the count itself). This distinction appears frequently in academic writing.

---

## Pattern Recognition

- **Find the verb first.** Then ask: what is doing this action? The answer is your subject.
- **Cross out prepositional phrases** (*of*, *along with*, *in addition to*, *together with*) — they never contain the subject.
- **Collective nouns** (*data*, *criteria*, *media*, *committee*) can be singular or plural depending on usage — look for context clues about whether the group is acting as a unit or as individuals.
- **In inverted sentences** (starting with *Here*, *There*, *Among*, *Between*), the subject comes after the verb. Do not assume the first noun is the subject.
- **Each, every, neither, either** are always singular — even when followed by plural nouns.
- **Noun clauses** (*What the author argues*, *How this affects policy*) are singular subjects, no matter how complex they are internally.
- **A number of** = plural. **The number of** = singular. This is one of the most tested distinctions.

---

## Real RC Application

Consider this passage:

> *The consequences of rapid urbanisation in Southeast Asia, compounded by inadequate investment in infrastructure and the absence of coherent regional planning frameworks, **have** been well documented by development economists. What **remains** less clear, however, **is** how these consequences interact with pre-existing patterns of inequality that long predate the current wave of urban growth.*

Notice the subject-verb pairs:
- First sentence: *The consequences* (plural) → *have been documented*. The massive intervening phrase (*of rapid urbanisation...planning frameworks*) separates subject from verb by 20 words. A weak reader might grab *frameworks* as the subject and expect *has*.
- Second sentence: *What remains less clear* (singular noun clause) → *is*. The whole clause is the subject.

Strong readers strip away the noise to find these core structures. Weak readers get lost in the intervening phrases and cannot identify what the sentence is actually claiming.

---

## Key Takeaways

- Subject-verb agreement is a reading tool, not a grammar rule. It tells you *what is doing what* in any sentence.
- The true subject is never inside a prepositional phrase. Cross out *of*, *along with*, *together with*, and *in addition to* mentally when reading.
- When a sentence feels confusing, find the verb first, then work backward to its subject. This reveals the sentence's core claim.
- Inverted sentences place the subject after the verb — do not assume the first noun is the subject.
- Collective nouns and Latin/Greek plurals (*data*, *criteria*, *phenomena*) require attention to context — are they being used as singular units or plural individuals?
- The longer the sentence, the more likely the true subject is buried. Train yourself to see through intervening phrases.
- In CAT RC, misidentifying the subject of a key sentence means misidentifying who or what the passage is arguing about.`,
      examples: [
        "'The decline of manufacturing jobs in post-industrial economies has reshaped political allegiances.' — Subject: 'decline' (singular), not 'jobs' or 'economies'.",
        "'Each of the proposed solutions carries risks.' — Subject: 'Each' (singular), not 'solutions'. Each individualises.",
        "'The data suggest a different interpretation.' — 'Data' is plural in academic writing. The plural verb signals formality.",
        "'Neither the policy nor the incentives are sufficient.' — With 'neither/nor', the verb agrees with the nearer noun: 'incentives' (plural).",
        "'What troubles economists most is the unpredictability of consumer behavior.' — The entire noun clause is singular.",
        "'A number of scholars have argued...' (plural = many) vs 'The number of scholars has increased...' (singular = the count).",
        "'Among the most contested questions in modern philosophy was the problem of consciousness.' — Inverted: subject 'the problem' follows the verb.",
        "'The series of experiments, along with the theoretical model, is now foundational.' — Subject: 'series' (singular). 'Along with' is an interrupting phrase.",
      ],
    },
    [
      // ── EASY (5) ─────────────────────────────────────────────
      {
        difficulty: "easy",
        prompt: "The quality of his written arguments ___ far below the standard expected at this level.",
        choices: ["are", "were", "was", "have been"],
        answer: "was",
        explanation: "The subject is 'quality' — singular. 'Of his written arguments' is a prepositional phrase modifying the subject; it doesn't change the number. 'Was' is correct.",
      },
      {
        difficulty: "easy",
        prompt: "The government's repeated failures to consult the public on critical policy decisions ___ eroded public trust.",
        choices: ["has", "have", "is", "are"],
        answer: "have",
        explanation: "The subject is 'failures' — plural. 'The government's' is a possessive modifier. 'Repeated failures...have eroded' is correct.",
      },
      {
        difficulty: "easy",
        prompt: "Neither the minister nor the advisors ___ willing to comment on the report.",
        choices: ["was", "were", "is", "has been"],
        answer: "were",
        explanation: "With 'neither...nor', the verb agrees with the noun closest to it — 'advisors' (plural). So 'were' is correct.",
      },
      {
        difficulty: "easy",
        prompt: "Every one of the candidates ___ asked to submit a detailed policy proposal before the debate.",
        choices: ["were", "was", "are", "have been"],
        answer: "was",
        explanation: "'Every one' is always singular — it individualises each candidate. 'Of the candidates' is a prepositional phrase that does not affect agreement. 'Was' is correct.",
      },
      {
        difficulty: "easy",
        prompt: "There ___ several reasons why the policy failed to achieve its intended outcomes.",
        choices: ["is", "was", "are", "has been"],
        answer: "are",
        explanation: "This is an inverted sentence. 'There' is not the subject. The true subject is 'several reasons' (plural), which comes after the verb. 'Are' agrees with 'reasons'.",
      },
      // ── MEDIUM (5) ────────────────────────────────────────────
      {
        difficulty: "medium",
        prompt: "The rise of populist movements in Europe, along with similar trends in Latin America, ___ begun to challenge the assumptions of liberal internationalism.",
        choices: ["have", "has", "are", "were"],
        answer: "has",
        explanation: "The subject is 'the rise' — singular. 'Along with similar trends in Latin America' is an interrupting phrase. The verb must agree with 'rise', not 'trends'. 'Has' is correct.",
      },
      {
        difficulty: "medium",
        prompt: "Each of the three proposals submitted by the research team ___ significant methodological flaws.",
        choices: ["contain", "contains", "are containing", "have contained"],
        answer: "contains",
        explanation: "'Each' is always singular, regardless of the noun phrase that follows it. 'Each...contains' is correct. 'Of the three proposals' is a prepositional phrase — cross it out.",
      },
      {
        difficulty: "medium",
        prompt: "What the author fails to acknowledge in the first three paragraphs ___ the fundamental contradiction at the heart of her argument.",
        choices: ["are", "is", "were", "have been"],
        answer: "is",
        explanation: "'What the author fails to acknowledge' is a noun clause functioning as the subject. Noun clauses are treated as singular. 'Is' is correct.",
      },
      {
        difficulty: "medium",
        prompt: "A number of recent studies ___ that the relationship between income and happiness is not linear.",
        choices: ["suggests", "has suggested", "suggest", "is suggesting"],
        answer: "suggest",
        explanation: "'A number of' is treated as plural — it means 'several' or 'many'. So 'A number of recent studies suggest' is correct. Contrast with 'The number of studies has increased' where 'the number' is singular.",
      },
      {
        difficulty: "medium",
        prompt: "The criteria for evaluating the success of the intervention ___ never clearly defined by the original researchers.",
        choices: ["was", "were", "has been", "is"],
        answer: "were",
        explanation: "'Criteria' is the plural of 'criterion'. In academic writing, 'criteria' takes a plural verb. 'The criteria...were never clearly defined' is correct. This is a common test of whether the reader recognises Latin plurals.",
      },
      // ── HARD (5) ──────────────────────────────────────────────
      {
        difficulty: "hard",
        prompt: "The committee, comprising members from twelve different departments with competing interests and mandates, ___ yet to reach ___ consensus on the proposed reforms.",
        choices: ["are, a", "have, a", "has, a", "is, the"],
        answer: "has, a",
        explanation: "The subject is 'the committee' — singular (acting as a unit). 'Has yet to reach' is correct. 'A consensus' — newly introduced, no specific consensus has been established yet, so 'a' is correct.",
      },
      {
        difficulty: "hard",
        prompt: "Among the most contested questions in modern political philosophy ___ the problem of how to reconcile individual liberty with collective obligation.",
        choices: ["is", "are", "have been", "was"],
        answer: "is",
        explanation: "This is an inverted sentence. 'Among the most contested questions' is a prepositional phrase. The true subject is 'the problem' — singular. The verb 'is' agrees with 'the problem', not with 'questions'.",
      },
      {
        difficulty: "hard",
        prompt: "The series of experiments conducted by the research team over the past decade, along with the theoretical model they developed to explain their findings, ___ now widely cited as foundational in the field.",
        choices: ["are", "is", "have", "were"],
        answer: "is",
        explanation: "The subject is 'the series' — singular. 'Of experiments conducted by the research team over the past decade' is a prepositional phrase. 'Along with the theoretical model...' is another interrupting phrase. The verb agrees only with 'series'. 'Is' is correct.",
      },
      {
        difficulty: "hard",
        prompt: "Neither the structural reforms advocated by the opposition nor the fiscal stimulus proposed by the ruling coalition ___ likely to address the underlying causes of stagnation in the absence of institutional reform.",
        choices: ["are", "is", "were", "have been"],
        answer: "is",
        explanation: "With 'neither...nor', the verb agrees with the noun closest to it. 'The fiscal stimulus' (singular) is the nearer subject. So 'is' is correct. The lengthy modifying phrases after both subjects make this harder to parse — but the agreement rule does not change.",
      },
      {
        difficulty: "hard",
        prompt: "What the longitudinal data from all three cohorts, taken together with the qualitative interviews conducted in the final phase, ___ is that early intervention ___ a measurably greater impact than remedial programmes introduced later.",
        choices: ["suggest, has", "suggests, have", "suggest, have", "suggests, has"],
        answer: "suggest, has",
        explanation: "'What the longitudinal data...suggest' — the noun clause's internal subject is 'data' (plural), so the verb within the clause is 'suggest'. The noun clause as a whole ('What the data suggest') functions as a singular subject for the main verb: 'is'. But the question tests the verb inside the clause. 'Early intervention' (singular) → 'has' a measurably greater impact.",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 3 — PRONOUNS AND PRONOUN REFERENCE
// ═══════════════════════════════════════════════════════════════
async function seedPronouns() {
  await upsertTopic(
    {
      slug: "pronouns-and-pronoun-reference",
      title: "Pronouns & Pronoun Reference",
      description: "Tracking who says what — the invisible connective tissue of complex arguments.",
      sortOrder: 3,
      section: "foundations",
    },
    {
      title: "Following the Thread: Pronouns in Complex Arguments",
      content: `## Why This Matters For Reading

Pronouns are shortcuts. Every *he*, *she*, *it*, *they*, *this*, *that*, *which*, and *whose* refers back to something — a noun, a clause, an idea — established earlier. If you cannot locate what a pronoun refers to (its antecedent), you have lost a thread of the argument. In a long CAT passage with multiple researchers, theories, or positions, an untracked pronoun can make you attribute a claim to the wrong person entirely.

This is one of the leading causes of comprehension errors in RC: students know what every word means, but they are not sure *who is saying it* or *what it refers to*.

Consider a passage discussing both Adam Smith and Karl Marx. The passage says: "He argued that the division of labour would ultimately impoverish workers." Who is *he*? If you have lost track, you might attribute Marx's position to Smith — and every inference question becomes impossible to answer correctly.

Pronoun tracking is not a grammar skill. It is an argument-tracking skill. Every pronoun is a pointer — and your job as a reader is to follow where it points.

---

## Core Idea

A pronoun must have a clear, unambiguous antecedent — the noun it stands in for.

### Common Pronoun Types and Their Reading Roles

- *He / she / they* → refers to a person or people already named
- *It* → refers to a thing, idea, or concept previously mentioned
- *This / That / These / Those* → refers to an idea just expressed (often an entire clause)
- *Which* → refers to the nearest noun or clause (usually after a comma)
- *Who / whom / whose* → refers to a person
- *The former / the latter* → first and second items in a pair

### The Danger of Vague *this*

When an author writes "This suggests that..." — *this* can refer to the entire previous argument, a specific sentence, or a single data point. Strong readers pause to identify what *this* is. Weak readers assume and move on — often incorrectly.

The same applies to *it* in academic writing. "It has been argued that..." — *it* here is impersonal, not referring to anything specific. But "The theory was tested. It failed" — *it* refers to *the theory*. Distinguishing between these uses is critical.

### Demonstrative Pronouns Create Distance

- *This* refers to something nearby, often the most recent idea.
- *That* refers to something more distant or being set apart from the current focus.
- Authors use these deliberately to create conceptual proximity or distance.

---

## Reading Impact

### Pronoun Tracking Is Argument Tracking

In passages where multiple people hold different views, pronoun tracking becomes argument tracking. If a paragraph begins "He argues that markets self-regulate," you need to know exactly who *he* is before you can attribute the view correctly.

In inference and tone questions, pronoun tracking is critical. "The author suggests that *it* is insufficient" — if you cannot identify what *it* is, you cannot evaluate what is being criticised.

### How Pronouns Create Chains of Reference

Academic writing builds long chains: an idea introduced in paragraph one as *a theory* becomes *it* in paragraph two, *this framework* in paragraph three, and simply *the approach* by paragraph four. Following these chains is essential for understanding what the passage is *about*.

### How Pronoun Ambiguity Creates Comprehension Traps

Some pronoun references are deliberately ambiguous. In CAT questions, answer options exploit this. The question asks "What does the author mean by 'this approach'?" and options offer different possible antecedents. The correct answer traces the pronoun to its actual referent.

---

## Common Reader Mistakes

**Mistake 1: Assuming *it* or *this* refers to the nearest noun.**
- "The committee reviewed the policy. It was found to be inadequate."
- *It* refers to *the policy*, not *the committee*. Readers default to the nearest noun.

**Mistake 2: Losing track of multiple *he/she* references.**
- "Kant argued that duty was primary. Hume disagreed. He believed that emotion guided all moral reasoning."
- *He* refers to Hume, but a rushing student might attribute the emotional theory to Kant.

**Mistake 3: *Which* attaching to the wrong antecedent.**
- "She published a study of the market in 2019, which surprised everyone."
- Does *which* refer to the *study* or the *market*? Careful readers notice the ambiguity.

**Mistake 4: Treating *this* as self-evident.**
- "Growth slowed, unemployment rose, confidence collapsed. This led to a change in government."
- What is *this*? All three events? Just the last one? The reader must verify.

**Mistake 5: Confusing *the former* and *the latter*.**
- "Both fiscal policy and monetary policy were debated. The former was favoured."
- *The former* = fiscal policy (first). *The latter* = monetary policy (second). Mixing these reverses the argument.

---

## Contextual Examples

1. *The economist proposed a new model. She argued it would reduce inequality.*
→ *She* = the economist. *It* = the model. Two pronouns, two clear antecedents.
→ **Reading takeaway:** Substitute the pronoun back to verify: "The economist argued the model would reduce inequality."

2. *Darwin observed that species adapt. This became the foundation of evolutionary biology.*
→ *This* = the entire observation, not just "species" or "adapt".
→ **Reading takeaway:** When *this* begins a sentence, it typically summarises the entire previous idea.

3. *The senator's speech contradicted the report, which had been released only a day earlier.*
→ *Which* refers to *the report* (released), not *the speech* (delivered).
→ **Reading takeaway:** *Which* after a comma refers to the noun immediately before. Verify with logic.

4. *Freud and Jung disagreed. He believed the unconscious was primarily sexual in nature.*
→ *He* is ambiguous — a comprehension trap. Context resolves it (the sexual unconscious is Freud's position).
→ **Reading takeaway:** When pronouns are ambiguous, do not guess. Use wider context.

5. *The study questioned the efficacy of the drug. It had been approved three years earlier.*
→ *It* = the drug (what was approved), not the study.
→ **Reading takeaway:** Use logical sense — what was approved? The drug.

6. *Both Rawls and Nozick wrote about justice. The former believed in redistribution; the latter saw liberty as inviolable.*
→ *The former* = Rawls. *The latter* = Nozick. Reliable decoding.
→ **Reading takeaway:** Former = first mentioned. Latter = second mentioned. Always.

7. *The report identified several causes. These included regulatory failure, excessive leverage, and poor risk modelling.*
→ *These* = the causes (plural antecedent from the previous sentence).
→ **Reading takeaway:** *These/those* in academic writing usually refer to the most recently mentioned plural noun.

8. *Critics say the internet fragments discourse. Advocates say it democratises information. Each misses how the same mechanism produces both effects.*
→ *It* = the internet. *Each* = each of the two positions independently.
→ **Reading takeaway:** *Each* individualises; *both* collectivises. RC options often swap these.

---

## Pattern Recognition

- Every time you see *he*, *she*, *they*, *it*, *this*, *that* — pause and identify the antecedent.
- When *this* appears at the start of a sentence, restate what it refers to before continuing.
- In passages with multiple figures, build a mental map of who holds which view.
- *Which* refers to the noun immediately before the comma — verify with logic.
- *The former* = first mentioned. *The latter* = second mentioned. Always.
- When a pronoun is ambiguous, do not assume — flag it and use context to resolve.
- *Each* individualises. *Both* collectivises. RC options exploit this distinction.

---

## Real RC Application

Consider this passage:

> *Piketty argues that wealth inequality is an inherent feature of capitalism. His critics contend that his analysis overlooks the role of institutional reform. They point to Scandinavian economies as evidence. These, they argue, have managed to combine market economies with low inequality — a feat that his framework cannot easily explain.*

Track the pronouns:
- *His critics* → critics of Piketty.
- *his analysis* → Piketty's analysis.
- *They* → the critics.
- *These* → Scandinavian economies.
- *they argue* → the critics again.
- *his framework* → Piketty's framework.

A weak reader might confuse *they* with *Scandinavian economies* or misattribute arguments. Strong readers build a mental map: Piketty says X; critics say Y, pointing to Z as evidence.

---

## Key Takeaways

- Pronouns are pointers. Every pronoun refers to something specific. Your job is to find what.
- *This* at the start of a sentence summarises the entire previous idea — restate it mentally.
- In passages with multiple people, track who holds which view. Pronouns become argument-attribution tools.
- *Which* after a comma modifies the noun immediately before it. Verify with logic.
- *The former* = first mentioned; *the latter* = second mentioned. Reliable decoding tools.
- When a pronoun is ambiguous, use context, logic, and the wider argument to resolve it.
- In CAT RC, many wrong answers result from misidentifying pronoun referents.`,
      examples: [
        "'She argued it would reduce inequality.' — 'She' = the economist. 'It' = the model. Two clear pronoun chains.",
        "'Darwin observed that species adapt. This became foundational.' — 'This' = the entire observation.",
        "'The speech contradicted the report, which had been released earlier.' — 'Which' = the report.",
        "'Freud and Jung disagreed. He believed...' — 'He' is ambiguous — requires context.",
        "'The study questioned the drug. It had been approved earlier.' — 'It' = the drug.",
        "'The former believed in redistribution; the latter valued liberty.' — Former = first; latter = second.",
        "'Critics say it fragments. Advocates say it democratises. Each misses the full picture.' — 'Each' individualises.",
        "'Several causes were identified. These included regulatory failure.' — 'These' = the causes.",
      ],
    },
    [
      // ── EASY (5) ─────────────────────────────────────────────
      {
        difficulty: "easy",
        prompt: "The author argues that memory is reconstructive, not reproductive. ___ means that we don't play back events like a video but rebuild them each time.",
        choices: ["It", "This", "That", "Which"],
        answer: "This",
        explanation: "'This' refers to the entire idea just expressed — that memory is reconstructive. 'It' would need a specific noun antecedent. 'Which' requires a noun, not a clause.",
      },
      {
        difficulty: "easy",
        prompt: "Both Rawls and Nozick wrote about justice. ___ believed a fair society required redistribution; ___ saw liberty as inviolable.",
        choices: ["He, he", "The former, the latter", "They, they", "One, another"],
        answer: "The former, the latter",
        explanation: "'The former' = Rawls (first mentioned); 'the latter' = Nozick (second mentioned). 'He, he' would be ambiguous.",
      },
      {
        difficulty: "easy",
        prompt: "The study, which took three years to complete, was finally published. ___ findings contradicted the prevailing consensus.",
        choices: ["Its", "It's", "Their", "The study's"],
        answer: "Its",
        explanation: "'Its' is the possessive pronoun for 'the study'. 'It's' = 'it is' — wrong. 'Their' would need a plural antecedent.",
      },
      {
        difficulty: "easy",
        prompt: "The economist presented two scenarios. In the first, inflation would fall. In the second, ___ would rise sharply.",
        choices: ["they", "it", "this", "that"],
        answer: "it",
        explanation: "'It' refers to 'inflation' — tracked across two scenarios. 'They' needs a plural antecedent. 'This' would refer to an idea, not a specific noun.",
      },
      {
        difficulty: "easy",
        prompt: "The government announced a new initiative. ___ was designed to reduce youth unemployment in rural areas.",
        choices: ["They", "It", "This", "Which"],
        answer: "It",
        explanation: "'It' refers to 'a new initiative' (singular). 'They' is wrong because 'initiative' is singular.",
      },
      // ── MEDIUM (5) ────────────────────────────────────────────
      {
        difficulty: "medium",
        prompt: "The philosopher rejected the empiricist claim that all knowledge comes from experience. He argued instead that certain concepts are innate. ___ position came to be known as rationalism.",
        choices: ["His", "This", "The empiricist's", "Their"],
        answer: "His",
        explanation: "'His position' refers to the philosopher's position — innate concepts. 'His' anchors ownership clearly. The question tests whether you've tracked who is speaking.",
      },
      {
        difficulty: "medium",
        prompt: "The report identified several causes of the financial crisis. ___ included regulatory failure, excessive leverage, and poor risk modelling. Among ___, regulatory failure received the most attention.",
        choices: ["These, these", "They, them", "This, it", "Those, those"],
        answer: "These, them",
        explanation: "'These' refers to 'several causes' (plural). 'Them' is the objective form for the same group. 'This/it' are singular — wrong for plural 'causes'.",
      },
      {
        difficulty: "medium",
        prompt: "The prime minister released a statement. The opposition leader called ___ misleading. ___ insisted that the claims had been misrepresented.",
        choices: ["it, She", "it, He", "him, She", "it, They"],
        answer: "it, She",
        explanation: "'It' refers to 'a statement' (not a person). 'She' refers to the opposition leader, tracking gender from context.",
      },
      {
        difficulty: "medium",
        prompt: "The author contrasts two views of education. Some see it as a tool for economic advancement; others view ___ as a means of cultivating civic virtue. ___ distinction matters because it shapes how we evaluate policy.",
        choices: ["it, This", "it, The", "them, This", "this, That"],
        answer: "it, This",
        explanation: "'It' = education (tracked from the first clause). 'This distinction' = the contrast just drawn between economic and civic views of education.",
      },
      {
        difficulty: "medium",
        prompt: "Hayek and Keynes had fundamentally different views on intervention. ___ favoured a minimal state; ___ argued that active fiscal policy was essential during recessions.",
        choices: ["He, he", "The former, the latter", "Hayek, Keynes", "One, the other"],
        answer: "The former, the latter",
        explanation: "'The former' = Hayek (first mentioned); 'the latter' = Keynes (second). 'He, he' would be ambiguous with two male economists.",
      },
      // ── HARD (5) ──────────────────────────────────────────────
      {
        difficulty: "hard",
        prompt: "Sociologists have long debated whether crime is a product of individual agency or structural conditions. Those who emphasise the former tend to favour punitive measures; ___ who favour ___ advocate instead for social reform.",
        choices: ["those, the latter", "they, it", "those, that", "these, the other"],
        answer: "those, the latter",
        explanation: "'Those who' parallels the first clause. 'The latter' refers to structural conditions (second item in the pair). This requires tracking the original pair across clauses.",
      },
      {
        difficulty: "hard",
        prompt: "The new framework proposed by the international commission was rejected by several member states. ___ argued that ___ failed to account for the unique economic circumstances of developing nations.",
        choices: ["They, it", "These, this", "It, they", "The states, the framework"],
        answer: "They, it",
        explanation: "'They' = member states (who is arguing). 'It' = the framework (what failed). Two antecedents tracked simultaneously.",
      },
      {
        difficulty: "hard",
        prompt: "Critics have argued that the internet has fragmented public discourse. Advocates counter that ___ has democratised information. Both positions contain truth, but ___ misses how the same mechanism can produce both effects simultaneously.",
        choices: ["it, each", "this, both", "the internet, neither", "it, neither"],
        answer: "it, each",
        explanation: "'It' = the internet. 'Each' = each of the two positions independently. 'Each' signals both individually miss something; 'both' would mean they collectively miss it.",
      },
      {
        difficulty: "hard",
        prompt: "The author examines Arendt's concept of the 'banality of evil'. She argues that Arendt's insight remains relevant because ___ challenges the assumption that atrocities require monstrous individuals to perpetrate ___.",
        choices: ["it, it", "she, them", "it, them", "this, it"],
        answer: "it, them",
        explanation: "'It' = Arendt's insight (what does the challenging). 'Them' = atrocities (what is perpetrated). 'She' would confuse whether the author or Arendt is the subject.",
      },
      {
        difficulty: "hard",
        prompt: "The study found that countries with higher social trust tend to have lower crime rates. ___, the researchers note, does not prove causation — it may be that low crime fosters trust rather than the reverse. ___ possibility is rarely considered in policy debates.",
        choices: ["This, This", "It, That", "This, That", "That, This"],
        answer: "This, That",
        explanation: "'This' = the correlation just described (near idea). 'That possibility' = the reverse-causation hypothesis (more distant idea). Demonstrative pronouns map conceptual distance: 'this' = nearby; 'that' = more remote.",
      },
    ]
  );
}


// ═══════════════════════════════════════════════════════════════
// TOPIC 4 — MODIFIERS
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// TOPIC 4 — MODIFIERS
// ═══════════════════════════════════════════════════════════════
async function seedModifiers() {
  await upsertTopic(
    {
      slug: "modifiers",
      title: "Modifiers",
      description: "How descriptive phrases anchor meaning — and how displacement creates ambiguity.",
      sortOrder: 4,
      section: "foundations",
    },
    {
      title: "Modifier Placement: Where Description Meets Meaning",
      content: `## Why This Matters For Reading

In complex writing, authors regularly front-load sentences with descriptive phrases — participial phrases, adjective strings, prepositional openers — before arriving at the subject. When these modifying phrases are correctly placed, they enrich the sentence. When they are misplaced, they attach to the wrong noun, and the sentence says something the author did not intend.

For readers, modifier placement is not a grammar rule — it is a comprehension key. If you do not know which noun a descriptive phrase is modifying, you do not know what the sentence is actually claiming. In CAT passages and academic essays, authors use long modifier chains. A reader who cannot correctly attach modifiers to their intended nouns will consistently misread the argument.

Consider: "Having reviewed the evidence, the conclusion was drawn that intervention had failed." Who reviewed the evidence? Grammatically, *the conclusion* did — but conclusions do not review evidence. A person or committee did. The sentence has a dangling modifier: the opening phrase has no logical subject to attach to. Strong readers notice this and mentally reconstruct the sentence. Weak readers absorb the error and misattribute the action.

---

## Core Idea

A modifier is any word, phrase, or clause that describes, limits, or qualifies another element in the sentence. The fundamental rule: **a modifier should be as close as possible to the word it modifies**.

### Types of Modifiers

- **Adjective modifiers:** Directly describe a noun. "The *extensive* report..."
- **Adverb modifiers:** Describe how, when, or to what extent. "She *strongly* disagreed."
- **Participial phrases:** Begin with -ing or -ed forms. "Having reviewed the data, *the committee* concluded..."
- **Prepositional phrases:** Begin with a preposition. "The study *of income inequality*..."
- **Relative clauses:** Begin with who/which/that. "The policy *that was introduced last year*..."

### What Goes Wrong

**Dangling modifiers:** The modifier has no logical subject in the sentence.
- "Walking through the archive, rare manuscripts were found." (Who was walking? Not the manuscripts.)

**Misplaced modifiers:** The modifier is next to the wrong noun.
- "She almost read every chapter." vs "She read almost every chapter." (The first says she nearly started reading; the second says she read most chapters.)

**Squinting modifiers:** The modifier could apply to either side.
- "Students who study frequently pass exams." (Do they study frequently, or do they frequently pass?)

---

## Reading Impact

### How Modifier Placement Changes Meaning

The position of a modifier can completely change what a sentence means. Consider these three versions:

- "*Only* she reviewed the data." (Nobody else did.)
- "She *only* reviewed the data." (She reviewed but did nothing else with it.)
- "She reviewed *only* the data." (She reviewed the data and nothing else.)

The word *only* is the same in all three — but its position changes the meaning entirely. In RC passages, answer options often exploit this kind of positional ambiguity.

### How Modifiers Build Complexity

Academic authors use modifiers to pack information into sentences. A single sentence might contain three or four modifiers before you reach the main verb:

> "The economic reforms introduced by the newly elected government in response to the 2019 fiscal crisis, widely criticised by both trade unions and international financial institutions, *have failed* to reduce unemployment."

The core sentence is: "The reforms have failed to reduce unemployment." Everything else is modifiers — telling you *which* reforms, *when* they were introduced, *by whom*, *in response to what*, and *how they were received*. A strong reader strips away the modifiers to find the core claim, then re-reads the modifiers for context.

### How Dangling Modifiers Create Misattribution

In RC passages, dangling modifiers can make you attribute an action to the wrong entity:

- "Based on extensive fieldwork, the theory gained widespread acceptance."

Who did the fieldwork? The *theory* did not do fieldwork — a researcher did. But grammatically, the modifier attaches to *the theory*. A careful reader notices this illogical attachment and mentally corrects it. A weak reader might believe the theory itself was somehow based on fieldwork it conducted.

---

## Common Reader Mistakes

**Mistake 1: Missing a dangling modifier.**
- "Walking through the archive, rare manuscripts were found."
- Who walked? Manuscripts do not walk. The sentence is missing the logical subject.

**Mistake 2: Misreading *only* placement.**
- "The government only proposed three reforms." vs "The government proposed only three reforms."
- The first could mean the government merely proposed them (without implementing). The second means just three, not more.

**Mistake 3: Assuming the nearest noun is always modified.**
- "The professor with the red tie standing near the podium spoke first."
- Is the red tie standing? No. "Standing near the podium" modifies "the professor." Modifiers can skip over intervening phrases to attach to their logical target.

**Mistake 4: Squinting modifiers going unnoticed.**
- "Reading carefully improves comprehension."
- Does "carefully" modify reading (how to read) or improve (the degree of improvement)? The ambiguity is real.

**Mistake 5: Losing track of multi-layered modifiers.**
- "The policy, introduced hastily and without adequate consultation, designed to address the housing shortage, was withdrawn."
- Readers can lose track of which modifiers apply to which nouns when multiple modifier phrases are stacked.

---

## Contextual Examples

1. *The reforms introduced by the coalition government in 2018 have been widely criticised.*
→ "Introduced by the coalition government in 2018" modifies "the reforms." It tells you which reforms and when.
→ **Reading takeaway:** Post-noun participial phrases identify which specific instance the author is discussing.

2. *Having failed to secure a majority, the prime minister resigned.*
→ The participial phrase "having failed to secure a majority" correctly modifies "the prime minister" — the person who failed.
→ **Reading takeaway:** Opening participial phrases should modify the subject of the main clause. Verify this match.

3. *The data collected over a period of ten years by researchers at three institutions suggest a correlation.*
→ "Collected over a period of ten years by researchers at three institutions" modifies "the data." The core claim: data suggest a correlation.
→ **Reading takeaway:** Strip away the modifiers to find the core claim, then re-add them for specifics.

4. *Born into poverty and educated at a rural school, her achievements were remarkable.*
→ Dangling modifier. "Born into poverty" should modify *her*, but grammatically it modifies "achievements." Achievements are not born.
→ **Reading takeaway:** When an opening phrase does not logically modify the grammatical subject, flag it. The author meant something different from what the sentence literally says.

5. *The committee, surprisingly, did not only approve all three proposals — it also allocated additional funding.*
→ "Surprisingly" modifies the entire following clause. "Not only...but also" is a correlative structure.
→ **Reading takeaway:** Sentence-level adverbs like "surprisingly," "unfortunately," "importantly" modify the entire clause, not just the nearest word.

6. *Critics argue that the merely symbolic gesture failed to address underlying inequalities.*
→ "Merely" modifies "symbolic" — the gesture was only symbolic, nothing more. "Merely" placed before "failed" would change the meaning entirely.
→ **Reading takeaway:** Adverbs like *merely*, *only*, *almost*, *hardly* change meaning based on what they modify. Read them carefully.

7. *Widely regarded as a watershed moment in constitutional history, the ruling's implications continue to be debated.*
→ "Widely regarded as a watershed moment" modifies "the ruling" (implied by "the ruling's"). Not the implications.
→ **Reading takeaway:** Possessive constructions can obscure the true target of a modifier. Think about what the modifier logically describes.

8. *The study of income inequality in developing nations published last year contradicted several longstanding assumptions.*
→ "Of income inequality" and "in developing nations" modify "the study." "Published last year" also modifies "the study." The core: the study contradicted assumptions.
→ **Reading takeaway:** Multiple stacked modifiers all modify the same noun. Mentally peel them away to find the sentence's skeleton.

---

## Pattern Recognition

- When a sentence begins with a participial phrase (-ing or -ed), check: does it logically modify the grammatical subject?
- When you see *only*, *almost*, *merely*, *hardly*, *just* — check what word they are modifying. Moving them changes the meaning.
- Strip modifiers to find the core sentence: Subject + Verb + Object. This reveals the author's actual claim.
- Squinting modifiers (ones that could modify either the word before or after them) create ambiguity — flag them.
- Multi-layered modifiers are common in academic writing. Read them in layers: first the core claim, then each modifier adds a detail.
- In RC, answer options often differ by which noun a modifier is attached to. Match modifiers to nouns carefully.

---

## Real RC Application

Consider this passage:

> *Implemented without adequate planning and in the face of significant political opposition, the fiscal reforms introduced by the newly elected government in response to the 2019 crisis have failed to achieve their stated objectives. The reforms, designed primarily to reduce the budget deficit, inadvertently increased unemployment among the very communities they were intended to help.*

Modifier analysis:
- "Implemented without adequate planning and in the face of significant political opposition" — modifies "the fiscal reforms" (the reforms were implemented poorly).
- "Introduced by the newly elected government in response to the 2019 crisis" — also modifies "the reforms" (which reforms, by whom, when).
- "Designed primarily to reduce the budget deficit" — modifies "the reforms" again.

Core claims: The reforms have failed. They increased unemployment. Everything else is modifier context. A weak reader gets lost in the modifiers and cannot extract the core argument.

---

## Key Takeaways

- A modifier should sit as close as possible to the word it modifies. Distance creates ambiguity.
- Opening participial phrases (-ing, -ed) should logically modify the subject of the main clause. If they do not, the sentence has a dangling modifier.
- Words like *only*, *almost*, *merely*, and *just* change meaning based on position. Read them with care.
- Strip modifiers to find the core sentence: Subject + Verb + Object. This is the author's actual claim.
- Multi-layered modifiers are common in academic writing. Read them in layers — core first, then each modifier adds context.
- In CAT RC, answer options often differ by which noun a modifier applies to. Match modifiers to nouns precisely.
- When something feels "off" in a sentence, check modifier placement. A misplaced modifier is often the source of confusion.`,
      examples: [
        "'The reforms introduced by the coalition in 2018 have been widely criticised.' — 'Introduced by...' modifies 'reforms'. Strip it to find the core: 'The reforms have been criticised.'",
        "'Having failed to secure a majority, the PM resigned.' — Correct: the PM failed. If it said 'the election was called,' the modifier would dangle.",
        "'She read almost every chapter.' vs 'She almost read every chapter.' — Position of 'almost' changes the claim entirely.",
        "'Born into poverty, her achievements were remarkable.' — Dangling: achievements are not born. Should modify 'she'.",
        "'The committee, surprisingly, did not only approve all proposals — it also allocated extra funding.' — 'Surprisingly' modifies the entire clause.",
        "'Widely regarded as a watershed moment, the ruling's implications continue to be debated.' — The modifier describes the ruling, not the implications.",
        "'The data collected over ten years by three institutions suggest a correlation.' — Core: 'The data suggest a correlation.' The rest is modifier context.",
        "'Critics argue that the merely symbolic gesture failed.' — 'Merely' modifies 'symbolic'. Placed before 'failed', it would change the meaning.",
      ],
    },
    [
      // ── EASY (5) ─────────────────────────────────────────────
      {
        difficulty: "easy",
        prompt: "___ by the committee last week, the report has now been made public.",
        choices: ["Approving", "Approved", "Having approve", "To approve"],
        answer: "Approved",
        explanation: "The report was approved (past participle, passive) by the committee. 'Approved' correctly modifies 'the report' — the report received the action. 'Approving' would mean the report did the approving.",
      },
      {
        difficulty: "easy",
        prompt: "The economist, ___ for her work on inequality, was invited to speak at the conference.",
        choices: ["known", "knowing", "having know", "to know"],
        answer: "known",
        explanation: "'Known for her work on inequality' modifies 'the economist' — she is known (past participle, passive). 'Knowing' would mean she knows, which is grammatically possible but semantically different.",
      },
      {
        difficulty: "easy",
        prompt: "She ___ read every chapter of the assigned text before the exam.",
        choices: ["almost", "mostly", "nearly", "hardly"],
        answer: "nearly",
        explanation: "All options modify 'read every chapter' differently. 'Nearly' means she read most but not all — the most logical reading. 'Almost' before 'read' would suggest she came close to starting. 'Hardly' would mean she barely read any. 'Mostly' would need to follow 'chapters'.",
      },
      {
        difficulty: "easy",
        prompt: "Walking through the archive, the researcher discovered several rare manuscripts that had been uncatalogued for decades.",
        choices: ["The sentence is correct — the modifier attaches logically.", "Dangling modifier — the manuscripts were walking.", "Misplaced modifier — 'rare' should come first.", "Squinting modifier — 'several' is ambiguous."],
        answer: "The sentence is correct — the modifier attaches logically.",
        explanation: "'Walking through the archive' correctly modifies 'the researcher' — the person who was walking. Subject immediately follows the participial phrase. No dangling modifier here.",
      },
      {
        difficulty: "easy",
        prompt: "Running out of time, the exam was submitted incomplete.",
        choices: ["The sentence is correct.", "Dangling modifier — 'the exam' did not run out of time.", "Misplaced modifier — 'incomplete' should be earlier.", "Squinting modifier — 'running' is ambiguous."],
        answer: "Dangling modifier — 'the exam' did not run out of time.",
        explanation: "'Running out of time' should modify a person (the student), but the grammatical subject is 'the exam.' Exams do not run out of time — students do. This is a classic dangling modifier.",
      },
      // ── MEDIUM (5) ────────────────────────────────────────────
      {
        difficulty: "medium",
        prompt: "The policy, introduced hastily and without adequate consultation, ___ to address the housing shortage effectively.",
        choices: ["failing", "failed", "having failed", "was failed"],
        answer: "failed",
        explanation: "The core sentence is: 'The policy failed to address the shortage.' 'Introduced hastily and without adequate consultation' is a modifier. The main verb must be 'failed' — simple past, agreeing with 'the policy.'",
      },
      {
        difficulty: "medium",
        prompt: "The study ___ only examined urban populations, which limits the generalisability of its findings.",
        choices: ["has the meaning: the study examined only urban populations", "has the meaning: the study did nothing except examine urban populations", "is ambiguous between the two readings", "has the meaning: the study barely examined urban populations"],
        answer: "is ambiguous between the two readings",
        explanation: "'Only' before 'examined' creates ambiguity: does the study only examine (nothing else) urban populations, or does it examine only urban (not rural) populations? The placement of 'only' makes both readings possible. A careful reader would flag this.",
      },
      {
        difficulty: "medium",
        prompt: "Based on extensive fieldwork conducted in three countries over five years, the theory gained widespread acceptance.",
        choices: ["The sentence is correct.", "Dangling modifier — the theory did not do fieldwork.", "Misplaced modifier — 'extensive' should modify 'acceptance'.", "Squinting modifier — 'over five years' is ambiguous."],
        answer: "Dangling modifier — the theory did not do fieldwork.",
        explanation: "'Based on extensive fieldwork' should modify whoever did the fieldwork — a researcher or team. But the grammatical subject is 'the theory.' Theories do not conduct fieldwork. This is a dangling modifier that creates misattribution.",
      },
      {
        difficulty: "medium",
        prompt: "The government only proposed three reforms during the entire legislative session.",
        choices: ["The government proposed merely three reforms (not more).", "The government proposed reforms but did nothing else with them.", "The government was the only entity that proposed reforms.", "The sentence is ambiguous between the first two readings."],
        answer: "The sentence is ambiguous between the first two readings.",
        explanation: "'Only' before 'proposed' could mean (1) the government merely proposed without implementing, or (2) the number was only three. To be unambiguous, the author should write either 'proposed only three reforms' or 'only proposed (did nothing but propose).'",
      },
      {
        difficulty: "medium",
        prompt: "Students who study frequently pass exams with high scores. What is the modifier ambiguity in this sentence?",
        choices: ["'Frequently' could modify 'study' (study often) or 'pass' (pass often).", "'High' could modify 'exams' or 'scores'.", "'With' could mean 'alongside' or 'using'.", "There is no ambiguity."],
        answer: "'Frequently' could modify 'study' (study often) or 'pass' (pass often).",
        explanation: "This is a squinting modifier. 'Frequently' sits between 'study' and 'pass,' so it could modify either. Do students study frequently (and therefore pass)? Or do students who study tend to pass frequently? The reader cannot tell from the sentence alone.",
      },
      // ── HARD (5) ──────────────────────────────────────────────
      {
        difficulty: "hard",
        prompt: "The committee, having deliberated for over six hours, did not only approve all three proposals — it also allocated additional funding for implementation.",
        choices: ["'Having deliberated' modifies the committee; 'not only...but also' signals the committee's actions exceeded expectations.", "'Having deliberated' modifies 'proposals'; the committee approved after the proposals deliberated.", "'Not only' means the committee partially approved.", "'Having deliberated' is a dangling modifier."],
        answer: "'Having deliberated' modifies the committee; 'not only...but also' signals the committee's actions exceeded expectations.",
        explanation: "'Having deliberated for over six hours' correctly modifies 'the committee.' The 'not only...but also' correlative signals that the committee did more than expected: approved AND allocated funding.",
      },
      {
        difficulty: "hard",
        prompt: "Widely regarded as a watershed moment in constitutional history, legal scholars have debated ___ implications ever since.",
        choices: ["its", "the ruling's", "their", "the decision's"],
        answer: "the ruling's",
        explanation: "The opening modifier 'Widely regarded as a watershed moment' must attach to something that is a watershed moment. 'Legal scholars' are not a watershed moment — a ruling is. 'The ruling's implications' correctly anchors the modifier.",
      },
      {
        difficulty: "hard",
        prompt: "Poorly funded and administratively fragmented, critics argue that ___ inability to coordinate across departments has made the response ineffective.",
        choices: ["the agency's", "their", "its", "the government's"],
        answer: "the agency's",
        explanation: "'Poorly funded and administratively fragmented' must modify whatever is poorly funded. Critics are not poorly funded — an agency is. 'The agency's inability' correctly anchors the modifier. This is a dangling modifier trap.",
      },
      {
        difficulty: "hard",
        prompt: "The data, analysed using a novel statistical method developed at MIT and subsequently validated by three independent research groups, ___ that the established model significantly underestimates climate sensitivity.",
        choices: ["suggesting", "suggest", "suggests", "has suggested"],
        answer: "suggest",
        explanation: "The subject is 'the data' — plural in academic writing. The massive modifier ('analysed using...research groups') separates subject from verb. Strip modifiers to find: 'The data suggest.' Everything between is descriptive context.",
      },
      {
        difficulty: "hard",
        prompt: "Read this sentence: 'The professor told the student that he had failed the assignment was unacceptable.' What is the problem?",
        choices: ["The sentence has a squinting modifier — 'that he had failed' could attach to 'told' or to 'the assignment'.", "The sentence has a dangling modifier — 'the assignment' did not fail.", "The sentence has no modifier issues — it is grammatically correct.", "The sentence has a misplaced adjective — 'unacceptable' should come earlier."],
        answer: "The sentence has a squinting modifier — 'that he had failed' could attach to 'told' or to 'the assignment'.",
        explanation: "'That he had failed' creates a garden-path ambiguity: was the professor telling the student that he failed? Or is 'that he had failed the assignment' a noun phrase that is unacceptable? The sentence can be read both ways, and the reader does not know which is intended until too late.",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 5 — PARALLELISM
// ═══════════════════════════════════════════════════════════════
async function seedParallelism() {
  await upsertTopic(
    {
      slug: "parallelism",
      title: "Parallelism",
      description: "How parallel structure signals equal logical weight — and what breaks in meaning when it breaks.",
      sortOrder: 5,
      section: "foundations",
    },
    {
      title: "Parallel Structure: When Form Mirrors Logic",
      content: `## Why This Matters For Reading

When an author writes a list, a comparison, or a series of actions, the grammatical structure of each element signals whether the items carry equal logical weight. Parallel structure means that items in a series share the same grammatical form — all nouns, all infinitives, all gerunds, all clauses. When parallelism breaks, it creates a stumble for the reader. The broken element feels different — and you must decide: did the author intend it to be different, or is it a grammatical error that muddles the meaning?

In CAT passages and academic essays, parallel structure is everywhere. Authors use it to present balanced arguments ("On the one hand... on the other hand..."), to build cumulative force ("They questioned, challenged, and ultimately rejected..."), and to compare alternatives ("The question is not whether to reform, but how to reform"). If you cannot recognise parallelism, you will miss the logical architecture of the argument.

Parallelism is not decoration. It is a logical signal. Equal grammatical form = equal logical weight.

---

## Core Idea

Parallelism requires that items joined by a coordinating conjunction (and, but, or, nor) or presented in a series share the same grammatical form.

### The Basic Principle

- **Parallel:** "She enjoys *reading*, *writing*, and *debating*." (all gerunds)
- **Not parallel:** "She enjoys *reading*, *to write*, and *debates*." (gerund, infinitive, noun — mixed forms)

### Where Parallelism Appears in Academic Writing

- **Lists and series:** "The report examined *employment trends*, *wage stagnation*, and *housing affordability*."
- **Comparisons:** "It is better *to invest in prevention* than *to spend on treatment*."
- **Correlative constructions:** "Not only did they *reduce spending*, but they also *increased revenue*."
- **Paired ideas:** "The government promised *to lower taxes* and *to increase social spending*."

### Correlative Conjunctions and Parallelism

Correlative conjunctions always require parallel structure:
- *both...and*: "Both *the design* and *the implementation* failed."
- *either...or*: "Either *reduce costs* or *increase revenue*."
- *neither...nor*: "Neither *the evidence* nor *the argument* supports the claim."
- *not only...but also*: "Not only did they *challenge the theory*, but they also *proposed an alternative*."
- *whether...or*: "Whether *to invest* or *to save* depends on risk tolerance."

The elements after each part of the correlative must match in grammatical form.

---

## Reading Impact

### How Parallelism Structures Arguments

Authors use parallelism to signal that items have equal logical weight. When you see three parallel items, the author is saying: these three things are equivalent in importance, type, or function.

> "The reforms addressed *poverty*, *inequality*, and *access to education*."

The parallel structure signals that all three issues received equivalent attention. If the author had written "The reforms addressed poverty, reduced inequality, and provided better access to education," the different verb forms would suggest different types of actions — not a simple list.

### How Broken Parallelism Changes Meaning

When parallelism breaks, the non-parallel element stands out. Sometimes this is intentional — the author wants to draw attention to the different item. More often, it is careless writing that confuses the reader.

> "The committee was tasked with *reviewing the budget*, *consulting stakeholders*, and *a comprehensive report*."

The third item ("a comprehensive report") breaks the gerund pattern ("reviewing," "consulting"). Is the committee tasked with a report? Or with producing one? The broken parallelism obscures the meaning. A strong reader notices this and reconstructs the intended meaning: presumably "producing a comprehensive report."

### How Parallelism Aids Memory and Comprehension

Parallel structure creates rhythm, which aids working memory. When items in a list share the same grammatical form, the reader can process them more efficiently. When parallelism breaks, the processing cost increases and the reader must re-read.

In RC passages under time pressure, broken parallelism costs time and leads to errors.

---

## Common Reader Mistakes

**Mistake 1: Not recognising a broken parallel structure.**
- "The study aimed to *identify causes*, *analyse patterns*, and *the development of solutions*."
- The third element ("the development of solutions") breaks from infinitives to a noun phrase. Should be "develop solutions."

**Mistake 2: Missing that correlatives require parallel elements.**
- "She not only *studied the data* but also *was conducting interviews*."
- After "not only" we have a past-tense verb; after "but also" we have a progressive. Should be: "not only studied the data but also conducted interviews."

**Mistake 3: Assuming unequal items have equal weight.**
- "The author discussed *Marxism*, *capitalism*, and *the weather*."
- All three are grammatically parallel, but logically the third does not belong. Parallelism does not guarantee logical equivalence — it signals it. The reader must verify.

**Mistake 4: Misreading the scope of a conjunction.**
- "The plan was *to reduce costs* and *increase efficiency while maintaining quality*."
- Does "while maintaining quality" modify only "increase efficiency" or both elements? The scope of the conjunction determines the meaning.

**Mistake 5: Confusing balanced rhetoric with logical argument.**
- "On the one hand, free markets drive innovation; on the other hand, they create inequality."
- The parallel structure (on the one hand / on the other hand) suggests balanced weighing. But the author may actually favour one side — the parallelism is rhetorical, not logical.

---

## Contextual Examples

1. *The government pledged to lower taxes, reduce bureaucracy, and increase social spending.*
→ Three parallel infinitives: to lower, reduce, increase. All are actions the government will take. Equal weight.
→ **Reading takeaway:** When items share grammatical form, they share logical status. These are three equivalent promises.

2. *The research focused on identifying patterns, analysing causes, and the development of interventions.*
→ Broken parallelism. "Identifying" and "analysing" are gerunds; "the development" is a noun phrase.
→ **Reading takeaway:** When one item breaks the pattern, either the author made an error or the different item has a different status. Flag it.

3. *Not only did the study challenge prevailing assumptions, but it also proposed a new theoretical framework.*
→ Correct correlative parallelism. "Challenge prevailing assumptions" // "proposed a new theoretical framework." Both are verb phrases.
→ **Reading takeaway:** After "not only...but also," check that both elements have the same grammatical form.

4. *The question is not whether to reform but how to reform.*
→ Parallel: "whether to reform" // "how to reform." Both are infinitive clauses with question words.
→ **Reading takeaway:** This structure signals that the debate is not about the principle (whether) but about the method (how). The parallelism makes the contrast sharp.

5. *She was praised for her intelligence, her dedication, and because she worked harder than anyone else.*
→ Broken parallelism. "Her intelligence" and "her dedication" are noun phrases; "because she worked harder" is a clause.
→ **Reading takeaway:** When a clause appears where a noun phrase is expected, it disrupts the pattern and the logical equivalence breaks.

6. *The economist argued that markets are efficient, that regulation is unnecessary, and that government should minimize its role.*
→ Three parallel "that" clauses. Each presents one claim with equal grammatical and logical weight.
→ **Reading takeaway:** Repeated "that" clauses are a signal of systematic argumentation — the author is building a case point by point.

7. *Either the government must increase taxes or reduce services.*
→ "Either" is misplaced. As written, "either" applies only to "the government must increase taxes." Correctly: "The government must either increase taxes or reduce services."
→ **Reading takeaway:** The position of correlative conjunctions determines what is being compared. Misplacement changes scope.

8. *The reforms were praised by economists, criticised by unions, and the public remained indifferent.*
→ Broken parallelism. "Praised by" and "criticised by" are passive constructions; "the public remained indifferent" is an active clause.
→ **Reading takeaway:** When the pattern shifts from passive to active mid-series, the author has shifted perspective — from what was done to the reforms to what the public did. The break may be intentional or careless.

---

## Pattern Recognition

- When you see a series of items joined by "and" or "or," check: do all items share the same grammatical form?
- When you see correlatives (both/and, either/or, not only/but also, neither/nor), the elements after each part must match.
- Parallel structure signals equal logical weight. If the author gives three items in parallel, they are treating all three as equivalent.
- When parallelism breaks, the non-parallel element is either (a) an error that muddles meaning, or (b) intentionally different, carrying a different logical status.
- Watch for the scope of conjunctions: does "and" connect two items or extend a longer chain?
- Rhetorical parallelism ("on the one hand... on the other hand") signals balanced presentation but does not necessarily mean the author is neutral.

---

## Real RC Application

Consider this passage:

> *The government's response to the crisis was characterised by three failures: a failure to anticipate the economic consequences, a failure to coordinate across departments, and failing to communicate transparently with the public.*

Notice the broken parallelism: "a failure to anticipate," "a failure to coordinate," and "failing to communicate." The first two are noun phrases ("a failure to..."); the third is a gerund ("failing to..."). In a CAT question, an option might ask you to identify the grammatical inconsistency, or to determine whether the third failure carries a different logical weight.

Strong readers notice the break and decide: is this intentional (the third failure is different in kind) or careless (the author lost the pattern)? In most academic contexts, it is careless — and the intended meaning is three equivalent failures.

---

## Key Takeaways

- Parallelism means items in a series share the same grammatical form. This signals equal logical weight.
- When parallelism breaks, the non-parallel element stands out. Decide: is this intentional or an error?
- Correlative conjunctions (both/and, either/or, not only/but also) require strict parallelism.
- In RC passages, parallel structure often frames the author's key claims. Recognise it to understand the argument's architecture.
- Rhetorical parallelism creates balance and rhythm but does not guarantee logical equivalence.
- When you encounter a series, check the grammatical form of each element. If one differs, it may differ in meaning too.`,
      examples: [
        "'The government pledged to lower taxes, reduce bureaucracy, and increase spending.' — Three parallel infinitives, three equal promises.",
        "'Not only did the study challenge assumptions, but it also proposed a framework.' — Correct correlative parallelism.",
        "'The question is not whether to reform but how to reform.' — Parallel infinitive clauses making a sharp contrast.",
        "'She was praised for her intelligence, her dedication, and because she worked harder.' — Broken: two noun phrases and one clause.",
        "'The economist argued that markets are efficient, that regulation is unnecessary, and that government should minimize its role.' — Three parallel 'that' clauses building a systematic case.",
        "'Either the government must increase taxes or reduce services.' — Misplaced 'either' changes scope.",
        "'Praised by economists, criticised by unions, and the public remained indifferent.' — Break from passive to active shifts perspective.",
        "'A failure to anticipate, a failure to coordinate, and failing to communicate.' — Broken parallelism in the third element.",
      ],
    },
    [
      // ── EASY (5) ─────────────────────────────────────────────
      {
        difficulty: "easy",
        prompt: "The research team was responsible for ___ data, ___ results, and ___ recommendations.",
        choices: ["collecting, analysing, presenting", "collecting, analysis, presenting", "to collect, analysing, presentation", "collection, analysing, to present"],
        answer: "collecting, analysing, presenting",
        explanation: "Parallel gerunds: 'collecting,' 'analysing,' 'presenting.' All three activities are grammatically equivalent, signalling they are of equal importance in the team's responsibilities.",
      },
      {
        difficulty: "easy",
        prompt: "The author argues that the policy was poorly designed, inadequately funded, and ___.",
        choices: ["implementation was rushed", "rushed in implementation", "hastily implemented", "they implemented it hastily"],
        answer: "hastily implemented",
        explanation: "The series uses past participle + adverb/adjective patterns: 'poorly designed,' 'inadequately funded.' 'Hastily implemented' continues this pattern. Other options break into noun phrases or clauses.",
      },
      {
        difficulty: "easy",
        prompt: "She decided to study economics, ___ in public policy, and eventually enter politics.",
        choices: ["specialising", "to specialise", "specialised", "a specialist"],
        answer: "to specialise",
        explanation: "The series uses infinitives: 'to study,' 'to specialise,' 'enter' (implied 'to'). 'To specialise' maintains the infinitive pattern. 'Specialising' (gerund) and 'specialised' (past tense) break it.",
      },
      {
        difficulty: "easy",
        prompt: "The report highlighted three problems: rising unemployment, declining wages, and ___.",
        choices: ["housing was unaffordable", "unaffordable housing", "that housing is unaffordable", "how housing has become unaffordable"],
        answer: "unaffordable housing",
        explanation: "The series uses adjective + noun phrases: 'rising unemployment,' 'declining wages.' 'Unaffordable housing' continues this pattern. Clauses ('that housing is...') would break the parallel structure.",
      },
      {
        difficulty: "easy",
        prompt: "The company aims to reduce costs, improve quality, and ___.",
        choices: ["customer satisfaction increases", "increasing customer satisfaction", "increase customer satisfaction", "the increase of customer satisfaction"],
        answer: "increase customer satisfaction",
        explanation: "The series uses bare infinitives after 'to': 'reduce,' 'improve,' 'increase.' All three are verb bases. 'Increasing' (gerund) or 'the increase' (noun phrase) would break the pattern.",
      },
      // ── MEDIUM (5) ────────────────────────────────────────────
      {
        difficulty: "medium",
        prompt: "Not only did the study ___ the prevailing hypothesis, but it also ___ an alternative explanation.",
        choices: ["challenge, proposed", "challenging, proposing", "challenge, proposing", "challenged, proposing"],
        answer: "challenge, proposed",
        explanation: "With 'not only did...but also,' the verb forms after each correlative must match. 'Did...challenge' (base form after auxiliary 'did') // 'proposed' (past tense matching the auxiliary inversion). The structure is: 'Not only did X happen, but Y also happened.'",
      },
      {
        difficulty: "medium",
        prompt: "The committee was tasked with reviewing the budget, consulting stakeholders, and ___.",
        choices: ["a comprehensive report was produced", "the production of a comprehensive report", "producing a comprehensive report", "to produce a comprehensive report"],
        answer: "producing a comprehensive report",
        explanation: "'Reviewing' and 'consulting' are gerunds. 'Producing' continues the pattern. 'A comprehensive report was produced' (passive clause), 'the production of' (noun phrase), and 'to produce' (infinitive) all break the parallel structure.",
      },
      {
        difficulty: "medium",
        prompt: "The question is not whether the government should intervene but ___.",
        choices: ["how it should intervene", "the method of intervention", "interventions need to be how", "if intervention works"],
        answer: "how it should intervene",
        explanation: "'Whether the government should intervene' is a question-word clause. 'How it should intervene' mirrors this structure: question-word + subject + should + verb. The parallel creates a sharp contrast: not whether (the principle) but how (the method).",
      },
      {
        difficulty: "medium",
        prompt: "Either the university must raise tuition fees ___ reduce the number of courses offered.",
        choices: ["and", "or", "but", "nor"],
        answer: "or",
        explanation: "'Either...or' is the correct correlative pair. 'Either' introduces two alternatives; 'or' connects them. 'And' after 'either' is grammatically incorrect. The parallel elements are 'raise tuition fees' and 'reduce the number of courses offered' — both infinitive phrases.",
      },
      {
        difficulty: "medium",
        prompt: "The reforms were praised by economists, criticised by unions, and ___. Which completion maintains parallelism?",
        choices: ["the public remained indifferent", "ignored by the public", "publicly the public ignored them", "while the public was indifferent"],
        answer: "ignored by the public",
        explanation: "'Praised by economists' and 'criticised by unions' are passive constructions: past participle + by + agent. 'Ignored by the public' continues this pattern. The other options shift to active voice or clausal structures.",
      },
      // ── HARD (5) ──────────────────────────────────────────────
      {
        difficulty: "hard",
        prompt: "The economist argued that markets are efficient, that regulation is often counterproductive, and ___. Which completion maintains the parallel structure and logical weight?",
        choices: ["government intervention should be minimal", "that government intervention should be minimal", "minimal government intervention", "intervening by the government should be minimised"],
        answer: "that government intervention should be minimal",
        explanation: "The series uses three 'that' clauses: 'that markets are efficient,' 'that regulation is often counterproductive,' and 'that government intervention should be minimal.' Each 'that' clause presents one claim with equal logical weight. Dropping 'that' in the third element would break the formal parallelism.",
      },
      {
        difficulty: "hard",
        prompt: "She was recognised not only for her groundbreaking research but also ___.",
        choices: ["her mentoring of junior scholars was exceptional", "for her exceptional mentoring of junior scholars", "because she mentored junior scholars exceptionally", "she mentored junior scholars exceptionally"],
        answer: "for her exceptional mentoring of junior scholars",
        explanation: "'Not only for X but also for Y' — the prepositional phrase 'for...' must appear after both parts of the correlative. 'For her groundbreaking research' // 'for her exceptional mentoring.' Clauses or sentences in the second position would break the parallel.",
      },
      {
        difficulty: "hard",
        prompt: "The passage states: 'The decline in manufacturing has led to unemployment, poverty, and communities have lost their sense of identity.' What is the effect of the broken parallelism?",
        choices: ["It signals that loss of identity is more important than the other consequences.", "It creates ambiguity about whether 'communities' is a third consequence or a new clause.", "It emphasises the economic impact over the social impact.", "It has no effect — the meaning is clear regardless."],
        answer: "It creates ambiguity about whether 'communities' is a third consequence or a new clause.",
        explanation: "'Unemployment' and 'poverty' are nouns (consequences). 'Communities have lost their sense of identity' is a clause — a different grammatical form. This breaks the pattern and creates ambiguity: is the third item a consequence (like the first two) or a new, separate claim? The reader must decide.",
      },
      {
        difficulty: "hard",
        prompt: "On the one hand, free markets drive innovation and economic growth; on the other hand, they create inequality and leave vulnerable populations without adequate support. What does the parallel structure signal about the author's stance?",
        choices: ["The author favours free markets.", "The author opposes free markets.", "The author is presenting both sides with equal weight — their own position is not yet declared.", "The author believes the disadvantages outweigh the advantages."],
        answer: "The author is presenting both sides with equal weight — their own position is not yet declared.",
        explanation: "The 'on the one hand / on the other hand' structure creates rhetorical balance. Both sides receive equivalent grammatical treatment: 'drive innovation and economic growth' // 'create inequality and leave vulnerable populations without adequate support.' The parallelism signals that the author is weighing both sides, not yet declaring a preference.",
      },
      {
        difficulty: "hard",
        prompt: "The government's response was characterised by three failures: a failure to anticipate the consequences, a failure to coordinate across departments, and failing to communicate transparently. What does the broken parallelism in the third item suggest?",
        choices: ["The third failure is more serious than the first two.", "The author is deliberately emphasising the third failure by breaking the pattern.", "The broken parallelism is most likely a grammatical error, and all three failures carry equal weight.", "The third failure is of a different kind than the first two."],
        answer: "The broken parallelism is most likely a grammatical error, and all three failures carry equal weight.",
        explanation: "'A failure to anticipate,' 'a failure to coordinate,' and 'failing to communicate' — the first two are noun phrases ('a failure to...'); the third is a gerund phrase ('failing to...'). In context, all three are equivalent failures. The break is most likely careless writing, not a deliberate signal. A strong reader normalises it to 'a failure to communicate transparently.'",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 6 — TENSE CONSISTENCY
// ═══════════════════════════════════════════════════════════════
async function seedTenseConsistency() {
  await upsertTopic(
    {
      slug: "tense-consistency",
      title: "Tense Consistency",
      description: "How tense shifts signal time, perspective, and argumentative moves — and how inconsistency breaks comprehension.",
      sortOrder: 6,
      section: "foundations",
    },
    {
      title: "Tense Shifts: Reading Time Through Grammar",
      content: `## Why This Matters For Reading

Tense is not just a grammar feature. In reading, tense is a time signal. When an author shifts from past to present tense, they are doing something deliberate: bringing an idea into the present, signalling ongoing relevance, or shifting perspective. When tense shifts are unintentional, they confuse the reader about *when* something happened and whether it is still true.

In CAT passages, tense shifts are diagnostic. They tell you whether the author is describing historical context (past), presenting their own argument (present), or speculating about the future (conditional/future). If you do not track tense, you will conflate what *was* true with what *is* true, and what *might be* true with what *is* true.

Consider: "The study found that smoking *causes* cancer." The study *found* (past) — the research happened in the past. But smoking *causes* (present) — the causal relationship is presented as an ongoing, enduring truth. The tense shift is deliberate: the finding happened then, but the truth persists now.

---

## Core Idea

Tense consistency means using the same tense throughout a passage unless there is a clear reason to shift. The key principle: **tense shifts should correspond to time shifts or perspective shifts**.

### Common Tense Uses in Academic Writing

- **Simple present:** For ongoing truths, definitions, and the author's own argument. "The data *suggest* a correlation."
- **Simple past:** For completed events, historical context, and describing what someone *did* or *said*. "The researchers *conducted* a study."
- **Present perfect:** For events that started in the past and connect to the present. "Studies *have shown* a link between poverty and crime."
- **Past perfect:** For events that happened before another past event. "By the time the policy was implemented, the crisis *had already* worsened."
- **Conditional/modal:** For hypotheticals and speculative claims. "If the government *were* to intervene, the market *might* stabilise."

### Intentional vs Unintentional Shifts

**Intentional shift:** "Aristotle *argued* (past) that virtue *is* (present) a matter of habit." The past tense locates Aristotle historically; the present tense signals that his argument is still relevant.

**Unintentional shift:** "The committee *reviewed* the proposals and *decides* to approve three of them." Past to present for no reason — this is an error that confuses the timeline.

---

## Reading Impact

### How Tense Tracks Time in a Passage

In a typical RC passage, you might encounter three time layers:
1. Historical context (past tense): "In the 1980s, the government *introduced* sweeping reforms."
2. Current state of knowledge (present tense): "These reforms *are now* seen as having failed."
3. Future implications (conditional): "If similar reforms *were attempted* today, they *would likely* face stronger opposition."

Tracking these shifts tells you what the author considers historical, what they consider current reality, and what they are speculating about.

### How Authors Signal Ongoing Relevance

When an author uses present tense to describe a past thinker's ideas, they are signalling that the ideas are still relevant:

- "Keynes *argued* that governments should spend during recessions." (past — historical attribution)
- "Keynes *argues* that governments should spend during recessions." (present — his argument still matters)

This is called the *historical present*. In RC passages, the choice of tense for attribution verbs (argues vs argued, suggests vs suggested) tells you how the author views the relevance of the source.

### How Tense Errors Break Comprehension

When tense shifts without a clear time-shift, the reader loses the timeline:

"The policy *was introduced* in 2015. It *reduces* unemployment by 2%. The government *announced* that it *will* continue the programme."

Is the unemployment reduction ongoing or was it a one-time effect? "Reduces" (present) suggests ongoing, but "was introduced" (past) and "announced" (past) create confusion. A strong reader would flag this inconsistency.

---

## Common Reader Mistakes

**Mistake 1: Not noticing an author's deliberate tense shift.**
- "Smith argued that markets are self-regulating." — Past "argued" for attribution; present "are" for the idea's current relevance.
- Missing this shift means missing the author's implicit endorsement of the idea's ongoing relevance.

**Mistake 2: Treating all present tense as current.**
- "The historical present" can describe past events in present tense for vividness: "Napoleon crosses the Alps in 1800."
- In RC, this does not mean Napoleon is currently crossing the Alps.

**Mistake 3: Confusing present perfect with simple past.**
- "Studies have shown X" (present perfect) — the research is ongoing and cumulative. New studies could add to this.
- "Studies showed X" (simple past) — the research was completed. The author may be about to say new evidence contradicts it.

**Mistake 4: Missing conditional markers.**
- "If the government were to increase taxes..." — subjunctive mood, hypothetical. This is speculation, not fact.
- Mistaking hypotheticals for claims changes your understanding of the author's argument.

**Mistake 5: Assuming tense errors are intentional.**
- Not every tense shift is meaningful. Sometimes authors (or students writing essays) shift tense carelessly. Strong readers flag the shift and decide: is this meaningful or careless?

---

## Contextual Examples

1. *Aristotle argued that virtue is a matter of habit, not a natural endowment.*
→ "Argued" (past) = Aristotle said this historically. "Is" (present) = the claim is still considered relevant.
→ **Reading takeaway:** When past-tense attribution is paired with present-tense content, the author considers the idea still valid.

2. *The study found that exposure to lead causes irreversible neurological damage.*
→ "Found" (past) = the research was completed. "Causes" (present) = the causal relationship is an ongoing truth.
→ **Reading takeaway:** Present tense in a "that" clause after a past-tense verb signals an enduring fact, not a historical observation.

3. *By the time the government responded, the crisis had already spiralled out of control.*
→ "Had spiralled" (past perfect) = the spiralling happened before the government responded. Two past events, one before the other.
→ **Reading takeaway:** Past perfect establishes a sequence: which past event came first. Essential for understanding cause and effect.

4. *Studies have shown that poverty correlates with lower educational attainment.*
→ "Have shown" (present perfect) = the body of research spans past to present and remains relevant. "Correlates" (present) = the relationship is ongoing.
→ **Reading takeaway:** Present perfect signals cumulative, ongoing research. Simple past ("showed") would suggest the research is completed.

5. *If the economy were to contract further, unemployment would rise sharply.*
→ Subjunctive "were to" + conditional "would" = hypothetical scenario, not a prediction or fact.
→ **Reading takeaway:** The subjunctive mood signals that this is speculation. Do not treat it as a factual claim.

6. *Napoleon crosses the Alps in 1800, leading an army of 40,000 into northern Italy.*
→ Historical present — present tense used for past events for vividness. Napoleon is not currently crossing the Alps.
→ **Reading takeaway:** In narrative or historical writing, present tense can describe past events. Context determines whether present tense is literal or vivid.

7. *The committee reviewed the proposals. It has since rejected two of them.*
→ "Reviewed" (past) = the review happened. "Has rejected" (present perfect) = the rejection happened recently and is still relevant.
→ **Reading takeaway:** A shift from simple past to present perfect signals that the later event is more recent and still relevant to the current discussion.

8. *The author suggests that the evidence supports her thesis. Earlier critics argued that the data were insufficient.*
→ "Suggests" (present) = the author's argument is being presented as current. "Argued" (past) = the critics' position is located in the past.
→ **Reading takeaway:** The choice of tense for attribution verbs tells you the author's view of relevance. Present = still relevant. Past = historical or superseded.

---

## Pattern Recognition

- Track attribution verbs: Does the author write "argues" (present — still relevant) or "argued" (past — historical)?
- Present tense in "that" clauses after past verbs signals enduring truth: "The study found that X causes Y."
- Past perfect ("had + past participle") establishes sequences between two past events. Critical for cause-and-effect tracking.
- Present perfect ("have/has + past participle") signals cumulative or recently-completed events still relevant now.
- Subjunctive/conditional ("if...were," "would," "might") signals hypotheticals — do not treat as facts.
- Unmotivated tense shifts (shifting without a time change) are errors — flag them.
- In RC passages, the author's tense choices are diagnostic: they reveal what the author considers current truth vs. historical context vs. speculation.

---

## Real RC Application

Consider this passage:

> *Piketty argued that inequality is an inherent feature of capitalism. His data showed that the rate of return on capital has consistently exceeded the rate of economic growth. Critics have challenged this claim, noting that the historical data Piketty relied on were incomplete. More recent studies suggest that the relationship between returns on capital and growth is more nuanced than Piketty acknowledged.*

Tense analysis:
- "Argued" (past) — Piketty made this argument in the past.
- "Is" (present) — the author treats inequality as an ongoing feature, not a historical claim.
- "Showed" (past) — the data analysis was completed.
- "Has consistently exceeded" (present perfect) — the trend spans past to present and is still relevant.
- "Have challenged" (present perfect) — the criticism is ongoing.
- "Were incomplete" (past) — the data incompleteness is treated as a past fact.
- "Suggest" (present) — the newer studies are current and active.
- "Acknowledged" (past) — Piketty's acknowledgement happened in the past.

Each tense shift is deliberate. The passage moves from historical claim (Piketty) to ongoing trend to current criticism to recent evidence. A reader who tracks these shifts understands the passage's temporal architecture.

---

## Key Takeaways

- Tense is a time signal. Track it like a timeline: what happened when?
- Present tense in a "that" clause after a past verb signals an enduring truth.
- Attribution verbs reveal the author's view: "argues" (still relevant) vs "argued" (historical).
- Past perfect establishes which past event came first — essential for cause and effect.
- Present perfect signals ongoing relevance or cumulative evidence.
- Subjunctive and conditional mood signal hypotheticals — not facts.
- Unmotivated tense shifts are errors. Motivated ones are diagnostic tools for understanding the argument.`,
      examples: [
        "'Aristotle argued that virtue is a matter of habit.' — Past 'argued' for historical attribution; present 'is' for ongoing relevance.",
        "'The study found that exposure causes damage.' — Past 'found' for the research; present 'causes' for the enduring truth.",
        "'By the time the government responded, the crisis had spiralled.' — Past perfect 'had spiralled' places the spiralling before the response.",
        "'Studies have shown that poverty correlates with lower attainment.' — Present perfect 'have shown' signals cumulative, ongoing research.",
        "'If the economy were to contract, unemployment would rise.' — Subjunctive + conditional = hypothetical, not factual.",
        "'The author suggests that the evidence supports her thesis.' — Present 'suggests' signals the argument is current and active.",
        "'The committee reviewed the proposals. It has since rejected two.' — Past to present perfect signals recent, still-relevant action.",
        "'Earlier critics argued the data were insufficient.' — Past 'argued' locates the criticism historically — possibly superseded.",
      ],
    },
    [
      // ── EASY (5) ─────────────────────────────────────────────
      {
        difficulty: "easy",
        prompt: "The researcher ___ the experiment in 2020. The results ___ that the hypothesis is correct.",
        choices: ["conducted, suggest", "conducts, suggested", "conducted, suggested", "conducts, suggest"],
        answer: "conducted, suggest",
        explanation: "'Conducted' (past) — the experiment happened in 2020. 'Suggest' (present) — the results are still relevant now. This is a deliberate tense shift: the action is past but the finding is current.",
      },
      {
        difficulty: "easy",
        prompt: "Aristotle ___ that virtue ___ a matter of habit.",
        choices: ["argued, is", "argues, was", "argued, was", "argues, is"],
        answer: "argued, is",
        explanation: "'Argued' (past) locates Aristotle historically. 'Is' (present) signals that the author treats the claim as still relevant — an enduring truth, not just a historical curiosity.",
      },
      {
        difficulty: "easy",
        prompt: "By the time the ambulance arrived, the patient ___.",
        choices: ["already died", "has already died", "had already died", "dies"],
        answer: "had already died",
        explanation: "Past perfect 'had already died' establishes that the death occurred before the ambulance's arrival. Two past events: the death came first. Past perfect marks the earlier event.",
      },
      {
        difficulty: "easy",
        prompt: "Studies ___ that regular exercise reduces the risk of heart disease.",
        choices: ["showed", "have shown", "show", "had shown"],
        answer: "have shown",
        explanation: "Present perfect 'have shown' signals cumulative research that remains relevant. 'Showed' (past) would suggest the research is completed and possibly superseded. 'Show' (present) would work but lacks the cumulative sense.",
      },
      {
        difficulty: "easy",
        prompt: "If the government ___ to increase taxes, the economy ___ contract.",
        choices: ["was, will", "were, would", "is, will", "were, will"],
        answer: "were, would",
        explanation: "Subjunctive 'were' + conditional 'would' signals a hypothetical scenario. 'Were to' is the subjunctive for hypotheticals; 'would' indicates a speculative consequence. This is not a prediction — it is speculation.",
      },
      // ── MEDIUM (5) ────────────────────────────────────────────
      {
        difficulty: "medium",
        prompt: "The author writes: 'Smith argued that free markets promote efficiency. His critics have responded that unregulated markets create inequality.' What do the tense choices tell us?",
        choices: ["Smith's argument is historical; the criticism is ongoing and current.", "Both arguments are historical.", "Both arguments are current.", "Smith's argument is ongoing; the criticism is historical."],
        answer: "Smith's argument is historical; the criticism is ongoing and current.",
        explanation: "'Argued' (past) places Smith's claim in the past. 'Have responded' (present perfect) signals that the criticism is ongoing — critics continue to make this point. The tense choices tell us that the debate is still live, with Smith's position as the historical starting point.",
      },
      {
        difficulty: "medium",
        prompt: "A passage reads: 'The policy was introduced in 2015. It reduces unemployment by 2%.' What is the effect of the tense shift?",
        choices: ["It suggests the unemployment reduction is ongoing.", "It is a grammatical error — should be 'reduced.'", "It signals the policy is no longer in effect.", "It creates ambiguity about whether the effect is ongoing or completed."],
        answer: "It creates ambiguity about whether the effect is ongoing or completed.",
        explanation: "'Was introduced' (past) places the policy historically. 'Reduces' (present) suggests the effect is ongoing. But the combination creates ambiguity: is the policy still in effect and still reducing unemployment? Or is the present tense an error? The reader must look for context clues to resolve this.",
      },
      {
        difficulty: "medium",
        prompt: "The passage states: 'Keynes argues that governments should spend during recessions.' What does the present tense 'argues' signal?",
        choices: ["Keynes is still alive and making this argument.", "The author considers Keynes's argument still relevant to current economic debates.", "The author is quoting Keynes directly.", "The argument was made recently."],
        answer: "The author considers Keynes's argument still relevant to current economic debates.",
        explanation: "Keynes is not alive. The present tense 'argues' is the historical present — it signals that the author treats the argument as still relevant and active in current discourse, not merely a historical artifact.",
      },
      {
        difficulty: "medium",
        prompt: "A passage reads: 'The committee reviewed all submissions. It has since rejected two and approved three.' Why does the author shift from past to present perfect?",
        choices: ["The rejection and approval happened before the review.", "The rejection and approval are more recent and still relevant to the current situation.", "The author made a grammatical error.", "The present perfect indicates the actions are hypothetical."],
        answer: "The rejection and approval are more recent and still relevant to the current situation.",
        explanation: "'Reviewed' (past) — completed action. 'Has since rejected' and implied 'has approved' (present perfect) — these actions happened after the review and are still relevant now. The shift from past to present perfect signals recency and ongoing relevance.",
      },
      {
        difficulty: "medium",
        prompt: "Which sentence correctly uses past perfect to show sequence?",
        choices: ["The company announced layoffs after profits declined.", "The company announced layoffs after profits had declined.", "The company had announced layoffs after profits declined.", "The company has announced layoffs after profits had declined."],
        answer: "The company announced layoffs after profits had declined.",
        explanation: "Past perfect 'had declined' marks the earlier event (profit decline), and simple past 'announced' marks the later event (layoffs). The sequence is clear: first profits fell, then layoffs were announced. Other options either reverse the sequence or mix tenses illogically.",
      },
      // ── HARD (5) ──────────────────────────────────────────────
      {
        difficulty: "hard",
        prompt: "A passage reads: 'Piketty argued that inequality is an inherent feature of capitalism. His data showed that the rate of return on capital has consistently exceeded growth.' Analyse the tense pattern.",
        choices: ["All verbs are past tense — this is pure historical narration.", "'Argued' and 'showed' are past (historical); 'is' is present (enduring truth); 'has exceeded' is present perfect (ongoing trend).", "'Argued' is past; all other verbs are present — everything is current.", "The tenses are inconsistent and likely contain errors."],
        answer: "'Argued' and 'showed' are past (historical); 'is' is present (enduring truth); 'has exceeded' is present perfect (ongoing trend).",
        explanation: "Each tense is deliberate: 'argued' (past — Piketty's work is historical), 'is' (present — inequality is treated as an ongoing fact), 'showed' (past — the data analysis is completed), 'has exceeded' (present perfect — the trend continues to the present). The tense pattern tells us: the research is past, but the truths it revealed are ongoing.",
      },
      {
        difficulty: "hard",
        prompt: "The author writes: 'Earlier critics argued that the data were insufficient. More recent studies suggest that the relationship is more nuanced.' What does the shift from 'argued' to 'suggest' tell us about the author's view?",
        choices: ["The author gives equal weight to both positions.", "The author considers the earlier criticism outdated and the recent studies more relevant.", "The author rejects both positions.", "The author considers the earlier criticism more credible."],
        answer: "The author considers the earlier criticism outdated and the recent studies more relevant.",
        explanation: "'Argued' (past) places the criticism in the past — it is presented as a historical position. 'Suggest' (present) treats the recent studies as current and active. The tense shift signals the author's preference: the recent work is more relevant than the older criticism.",
      },
      {
        difficulty: "hard",
        prompt: "Consider: 'The experiment was conducted in 2019. By 2021, the results had been replicated across three independent laboratories. Today, the consensus holds that the original findings are robust.' How many time layers does this passage contain?",
        choices: ["One — everything is in the past.", "Two — past and present.", "Three — 2019 (past), 2021 (past perfect), today (present).", "Four — past, past perfect, present perfect, and present."],
        answer: "Three — 2019 (past), 2021 (past perfect), today (present).",
        explanation: "Layer 1: 'Was conducted' (past) — 2019. Layer 2: 'Had been replicated' (past perfect) — between 2019 and 2021, marking an event before the 2021 time point. Layer 3: 'Holds' and 'are' (present) — today's consensus. The passage moves through three temporal layers, each marked by a different tense.",
      },
      {
        difficulty: "hard",
        prompt: "A student writes: 'The author argued that globalisation creates inequality. He suggests that protectionism might help.' What is wrong with the tense pattern?",
        choices: ["Nothing — both sentences are grammatically correct.", "The shift from 'argued' (past) to 'suggests' (present) implies the author changed their mind between the two sentences, which may not be the case.", "'Creates' should be 'created' to match 'argued.'", "'Might' should be 'will' to express certainty."],
        answer: "The shift from 'argued' (past) to 'suggests' (present) implies the author changed their mind between the two sentences, which may not be the case.",
        explanation: "'Argued' places the first claim in the past. 'Suggests' treats the second claim as current. This implies the author's view evolved over time — the first claim is historical, the second is current. If both claims are from the same work, the tenses should match: either both 'argued/suggested' or both 'argues/suggests.'",
      },
      {
        difficulty: "hard",
        prompt: "A passage reads: 'Had the government acted sooner, the crisis might not have escalated to the degree that it did.' What grammatical structure is at work, and what does it signal?",
        choices: ["Past perfect conditional (third conditional) — signalling a hypothetical past event that did not happen.", "Simple past conditional — signalling a likely future event.", "Present perfect — signalling an ongoing situation.", "Subjunctive present — signalling a current hypothetical."],
        answer: "Past perfect conditional (third conditional) — signalling a hypothetical past event that did not happen.",
        explanation: "'Had the government acted' (past perfect, inverted for conditional) + 'might not have escalated' (conditional perfect) = third conditional. This signals an unrealised past: the government did NOT act sooner, and the crisis DID escalate. The structure is speculative about a past that never happened.",
      },
    ]
  );
}


// ═══════════════════════════════════════════════════════════════
// TOPIC 7 — CONNECTOR WORDS AND TRANSITIONS (Reading Flow)
// ═══════════════════════════════════════════════════════════════
async function seedConnectorWords() {
  await upsertTopic(
    {
      slug: "connector-words-and-transitions",
      title: "Connector Words & Transitions",
      description: "The skeleton of every argument — how authors signal agreement, contrast, cause, and conclusion.",
      sortOrder: 10,
      section: "reading_patterns",
    },
    {
      title: "How Connectors Map the Architecture of Arguments",
      content: `## Why This Matters For Reading

Connector words are the most information-dense words in any essay or editorial. A single *however* can overturn everything that came before it. A *therefore* signals that what follows is a logical conclusion from what preceded it. A *despite* tells you the author is holding two facts in tension.

Strong readers treat connector words as directional signals. They don't just read what an argument says — they read *how the argument moves*. Connector words tell you whether the author is agreeing, disagreeing, qualifying, explaining, or concluding.

---

## Core Idea

**Connectors fall into five categories:**

1. **Contrast:** however, but, yet, although, despite, nevertheless, whereas, on the other hand, even though
2. **Addition/Support:** furthermore, moreover, in addition, also, besides, similarly
3. **Cause/Effect:** therefore, thus, consequently, as a result, because, since, hence
4. **Concession:** admittedly, granted, to be sure, while it is true that, of course
5. **Illustration/Specification:** for example, specifically, namely, in particular, that is

**What concession connectors do:** When an author writes "Admittedly, markets are efficient in some contexts", they're acknowledging a valid counterargument *before* dismantling it. This is a sophisticated rhetorical move — and the main argument almost always follows the concession.

---

## Reading Impact

**The most powerful connectors are contrast connectors.** An author who writes "the policy was popular; *however*, it failed to address structural inequality" has just told you that popularity is irrelevant to their evaluation. The word *however* is the pivot of the entire argument.

**Concession + contrast patterns:** These are the backbone of sophisticated arguments:
*Although X, Y* — the author grants X but argues Y matters more.
*Admittedly X. But Y.* — same move, two sentences.
*While critics argue X, the evidence suggests Y.* — X is the straw man; Y is the claim.

When you see this pattern, you know: what comes after the contrast is the author's real position.

---

## Pattern Recognition

→ **However, but, yet, nevertheless** → expect a contrast or complication to what came before.
→ **Therefore, thus, hence, consequently** → what follows is a logical conclusion — verify the logic.
→ **Although, despite, even though** → the clause that begins with these is a concession; the main clause contains the argument.
→ **Moreover, furthermore** → the argument is being reinforced — a second or third piece of evidence.
→ **Admittedly, of course, granted** → the author is acknowledging the counterargument; their own position follows shortly.
→ **Specifically, for example** → the author is narrowing and illustrating — pay attention to what category they're 
---

## Common Reader Mistakes

**Mistake 1: Treating *however* as decoration.**
- Wrong: skipping *however* and reading both sentences as equally weighted. Right: *however* means the second sentence contradicts the first.

**Mistake 2: Confusing *moreover* with *however*.**
- *Moreover* adds and strengthens. *However* pivots and opposes.

**Mistake 3: Missing the concession-contrast pattern.**
- "Admittedly X. But Y" â€” the main argument is Y, not X.

**Mistake 4: Assuming *therefore* means the conclusion is valid.**
- *Therefore* signals a logical conclusion, but the logic may be flawed. Check the premises.

**Mistake 5: Overlooking *while* as a concession marker.**
- "While markets are efficient, they fail on externalities." â€” *while* = *even though*, not *simultaneously*.

---

## Contextual Examples

1. *The government invested heavily in education. However, literacy rates remained stagnant.*
â†’ *However* signals the investment did not produce the expected result.

2. *Although critics dismissed the theory, subsequent experiments confirmed its predictions.*
â†’ *Although* concedes criticism; the main clause delivers vindication.

3. *The data, moreover, suggest the effect is not limited to developed economies.*
â†’ *Moreover* reinforces. The argument is getting stronger.

4. *Admittedly, the sample was small. Nevertheless, the effect was statistically significant.*
â†’ Concession + override. The finding survives the objection.

5. *Specifically, the decline was concentrated in rural districts.*
â†’ *Specifically* narrows a general claim to a precise location.

6. *The policy was, therefore, not merely ineffective but actively counterproductive.*
â†’ *Therefore* draws a conclusion. *Not merely...but* escalates.

7. *While inequality worsened in absolute terms, it improved relative to historical baselines.*
â†’ *While* introduces nuance â€” the author refuses a simple position.

8. *She grants that markets self-correct. She argues, however, that correction comes too late.*
â†’ Concession-contrast across two sentences.

---

## Real RC Application

> *While proponents of deregulation argue that removing constraints allows markets to allocate resources efficiently, the historical record suggests otherwise. The crises of 1929, 2008, and 2020 all occurred under weakened regulation. Moreover, recoveries required massive governmental intervention. Consequently, any argument for deregulation that ignores this pattern is incomplete.*

Connector logic: *While* (concession) â†’ *Moreover* (reinforcement) â†’ *Consequently* (conclusion). The real position: deregulation arguments that ignore history are flawed.

---

## Key Takeaways

- Connector words tell you how ideas relate â€” they are the most important structural signals.
- *However/but/yet* = reversal. What follows is the author's real point.
- *Although/while/despite* = concession. The main clause is the argument.
- *Therefore/thus/consequently* = logical conclusion. Verify the logic.
- *Moreover/furthermore* = reinforcement. The author is building a case.
- *Admittedly/granted* = acknowledging a counterargument before dismissing it.
- The concession-contrast pattern is the skeleton of sophisticated argumentation.

exemplifying.`,
      examples: [
        "'The economy grew steadily. However, income inequality widened.' — 'However' signals that growth and equality moved in opposite directions — a critical tension.",
        "'Although the study was widely cited, its methodology was later found to be flawed.' — The main claim (flaw) comes after the concession (widely cited).",
        "'Markets are, admittedly, efficient at allocating resources. They are not, however, efficient at distributing them equitably.' — Two-move argument: concede efficiency, contest equity.",
        "'The author, moreover, fails to account for the historical context.' — 'Moreover' tells you this is a second criticism, adding to one already made.",
        "'Consequently, any policy that ignores this dynamic is likely to fail.' — 'Consequently' signals: what follows is the logical result of all previous arguments.",
      ],
    },
    [
      // EASY
      {
        difficulty: "easy",
        prompt: "The reform was popular with voters. ___, it faced stiff opposition in the legislature.",
        choices: ["Furthermore", "Therefore", "However", "Similarly"],
        answer: "However",
        explanation: "'However' signals contrast — the reform was popular with the public but opposed in the legislature. These two facts move in opposite directions. 'Furthermore' would add a supporting point. 'Therefore' would suggest the opposition was caused by the popularity.",
      },
      {
        difficulty: "easy",
        prompt: "___ the evidence was inconclusive, the committee proceeded with the ban.",
        choices: ["Therefore", "Although", "Furthermore", "In addition"],
        answer: "Although",
        explanation: "'Although' signals a concession: despite the inconclusive evidence, the committee acted anyway. This creates a tension between insufficient justification and decisive action — which is likely the author's critical point.",
      },
      {
        difficulty: "easy",
        prompt: "The drug showed no benefit for the general population. ___, it proved highly effective for a small subgroup.",
        choices: ["Therefore", "Furthermore", "However", "Consequently"],
        answer: "However",
        explanation: "The sentence moves from a broad negative finding to a specific positive exception — a clear contrast signalled by 'However'. 'Furthermore' would add more negative findings. 'Consequently' would imply the subgroup benefit caused the general failure.",
      },
      // MEDIUM
      {
        difficulty: "medium",
        prompt: "Proponents of free trade argue that open markets raise living standards globally. Critics, ___, contend that the gains are unevenly distributed.",
        choices: ["moreover", "however", "therefore", "subsequently"],
        answer: "however",
        explanation: "'However' correctly signals that the critics' view contrasts with the proponents' view. The structure is: [claim] + however + [counter-claim]. 'Moreover' would suggest the critics are adding support to the proponents' view, which is wrong.",
      },
      {
        difficulty: "medium",
        prompt: "The study was methodologically sound. ___, it suffered from a small sample size, which limits the generalisability of its findings.",
        choices: ["Admittedly", "Therefore", "Furthermore", "Consequently"],
        answer: "Admittedly",
        explanation: "'Admittedly' signals a concession — the study was sound (acknowledged), but it had a limitation. This is a sophisticated two-part move: grant a strength, then reveal a weakness. 'Therefore' or 'Consequently' would incorrectly imply a causal relationship between soundness and sample size.",
      },
      {
        difficulty: "medium",
        prompt: "Globalisation has created enormous wealth. It has ___ deepened economic inequalities within nations, even as it has reduced them between nations.",
        choices: ["therefore", "similarly", "however", "consequently"],
        answer: "however",
        explanation: "The sentence presents a paradox: globalisation has created wealth but also deepened inequality. 'However' signals this internal tension — two truths that pull in different directions. 'Similarly' would suggest both findings move in the same direction, which they don't.",
      },
      // HARD
      {
        difficulty: "hard",
        prompt: "The intervention initially appeared successful. ___, closer analysis of the data reveals that improvements were concentrated in urban centres, leaving rural populations largely unaffected. ___, the headline statistic masked significant structural disparities.",
        choices: ["However, Consequently", "Furthermore, Therefore", "However, Therefore", "Admittedly, However"],
        answer: "However, Consequently",
        explanation: "First blank: 'However' — the initial success is being contradicted by closer analysis. Second blank: 'Consequently' — the masking of disparities is presented as a logical result of the uneven distribution just identified. Both connector roles are distinct: contrast first, then causal conclusion.",
      },
      {
        difficulty: "hard",
        prompt: "___ free markets tend toward efficiency, ___ they systematically produce externalities that individual actors have no incentive to correct — a failure that even the most ardent libertarians must acknowledge.",
        choices: ["Although, however", "While, yet", "Because, therefore", "Despite, nevertheless"],
        answer: "While, yet",
        explanation: "'While' introduces the concession (free markets are efficient — granted). 'Yet' introduces the contradiction (they produce externalities they don't self-correct). Both 'while...yet' work together as a concession-contrast pair. 'Although...however' is redundant — you wouldn't use both a subordinating conjunction and a sentence connector for the same move.",
      },
      {
        difficulty: "hard",
        prompt: "The author concedes that urbanisation has driven economic growth. She argues, ___, that the social costs — congestion, displacement, the erosion of community — have been systematically undervalued in policy frameworks. ___, any cost-benefit analysis that ignores these factors is, she contends, fundamentally incomplete.",
        choices: ["however, Consequently", "moreover, Therefore", "furthermore, Nevertheless", "however, Nevertheless"],
        answer: "however, Consequently",
        explanation: "First blank: 'however' — the author concedes growth but then pivots to social costs (a contrast). Second blank: 'Consequently' — the undervaluation of social costs logically leads to incomplete cost-benefit analyses. The argument moves: concede → contrast → logical conclusion.",
      },
      {
        difficulty: "easy",
        prompt: "The experiment was well designed. ___, the results were statistically insignificant.",
        choices: ["Furthermore", "Nevertheless", "Therefore", "Similarly"],
        answer: "Nevertheless",
        explanation: "'Nevertheless' signals that despite the good design, the results were not significant. 'Furthermore' would add a positive. 'Therefore' would imply design caused insignificance.",
      },
      {
        difficulty: "easy",
        prompt: "Urbanisation has brought economic opportunities. ___, it has led to overcrowding and environmental degradation.",
        choices: ["Moreover", "However", "Therefore", "As a result"],
        answer: "However",
        explanation: "'However' contrasts benefits with negative consequences. 'Moreover' would suggest both are positive. 'Therefore' would imply degradation is caused by the opportunities.",
      },
      {
        difficulty: "medium",
        prompt: "The government defended austerity as necessary for fiscal stability. ___, unemployment rose sharply in the two years following implementation.",
        choices: ["Moreover", "Consequently", "Similarly", "However"],
        answer: "However",
        explanation: "'However' signals the real-world outcome contradicted the justification. Rising unemployment undermines the claim of necessary stability measures.",
      },
      {
        difficulty: "medium",
        prompt: "___ it is true that renewable energy costs have fallen dramatically, the infrastructure required for a complete transition remains prohibitively expensive for most developing nations.",
        choices: ["Although", "Because", "Furthermore", "Therefore"],
        answer: "Although",
        explanation: "'Although' introduces a concession (costs have fallen) before the main argument (infrastructure is still too expensive). Classic concession-claim pattern.",
      },
      {
        difficulty: "hard",
        prompt: "The methodology was rigorous and the dataset large. ___, the authors acknowledged confounding variables may have influenced outcomes. ___, they urged caution in generalising beyond the studied population.",
        choices: ["However, Therefore", "Moreover, Nevertheless", "Nevertheless, Consequently", "However, Consequently"],
        answer: "However, Consequently",
        explanation: "First: 'However' â€” despite rigour, confounds exist (contrast). Second: 'Consequently' â€” caution about generalisation follows logically from the acknowledged confounds.",
      },
      {
        difficulty: "hard",
        prompt: "___ the correlation between education and income is well documented, scholars remain divided on whether the relationship is causal. ___, some argue that innate ability drives both outcomes.",
        choices: ["While, Indeed", "Although, Furthermore", "Because, However", "While, Furthermore"],
        answer: "While, Indeed",
        explanation: "'While' concedes the correlation is established. 'Indeed' intensifies â€” not only is causation unresolved, but some scholars propose an alternative explanation (innate ability). 'Indeed' signals escalation.",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 8 — TONE AND REGISTER SHIFTS
// ═══════════════════════════════════════════════════════════════
async function seedToneAndRegister() {
  await upsertTopic(
    {
      slug: "tone-and-register-shifts",
      title: "Tone & Register Shifts",
      description: "How an author's attitude shapes meaning — and why shifts in tone carry argumentative weight.",
      sortOrder: 11,
      section: "reading_patterns",
    },
    {
      title: "Reading Between the Lines: Tone as Argument",
      content: `## Why This Matters For Reading

Two sentences can contain the same information but mean very different things depending on tone. "The study found mixed results" is neutral. "The study, despite its ambitions, returned ambiguous findings" is critical. The information is the same; the attitude is different — and in an argument, attitude is meaning.

Tone is how an author feels about what they're describing. In essays, editorials, and CAT passages, authors often have a clear evaluative stance — and detecting it is essential for answering tone questions, inference questions, and author-intent questions correctly.

---

## Core Idea

**Tone is the author's attitude toward their subject.** It is conveyed through:
- **Word choice (diction):** *slump* vs *decline* vs *correction* — same economic event, three different attitudes.
- **Qualifying language:** "arguably", "perhaps", "one might suggest" = hedged, tentative tone.
- **Structural choices:** Putting the counterargument first and then dismantling it = adversarial tone.
- **Irony or understatement:** Saying less than is meant, or saying the opposite of what is meant.

**Register** refers to the formality and register of language. Academic register = precise, hedged, impersonal. Journalistic register = direct, assertive, accessible. A shift in register within a passage signals a change in the author's mode — perhaps from analysis to polemic, or from description to prescription.

---

## Reading Impact

When you detect tone, you can answer:
- What does the author *think* about this subject? (Tone questions)
- Is the author likely to agree or disagree with the given statement? (Inference questions)
- What is the author's *purpose* in this passage? (Main idea questions)

**Tone signals to watch for:**
- **Sceptical:** "one might wonder", "it is far from clear", "critics have rightly pointed out"
- **Supportive/Enthusiastic:** "a compelling case", "the evidence unmistakably shows", "a remarkable achievement"
- **Critical:** "fails to account for", "ignores", "overlooks the fundamental tension"
- **Neutral/Analytical:** "the data suggest", "one interpretation is", "it may be argued"
- **Ironic:** Exaggerated praise that implies criticism; understatement of serious problems

---

## Pattern Recognition

→ Watch for **evaluative adjectives**: *remarkable*, *troubling*, *significant*, *alarming*, *necessary*. They reveal the author's stance.
→ **Hedging language** (*arguably*, *perhaps*, *might*, *appears to*) signals tentativeness — the author is not fully committed.
→ A **shift from third person to first person** often signals a shift from description to personal opinion.
→ When an author quotes a source approvingly, they signal agreement. When they quote and then critique, they signal disagreement.
→ **Irony** 
---

## Common Reader Mistakes

**Mistake 1: Confusing formal register with objectivity.**
- Formal language can be deeply biased. Register is style, not neutrality.

**Mistake 2: Missing sarcasm in formal prose.**
- "One can only marvel at the government's infinite wisdom" â€” sarcasm in formal dress.

**Mistake 3: Ignoring register shifts within a paragraph.**
- A drop from academic prose to "This is, frankly, absurd" signals strong conviction.

**Mistake 4: Treating clinical tone as agreement.**
- "Proponents claim" or "it has been argued" signal distance, not endorsement.

**Mistake 5: Overlooking intensifiers and hedges.**
- "The evidence overwhelmingly suggests" vs "tentatively suggests" â€” conviction vs caution.

---

## Contextual Examples

1. *The committee's decision was, to put it mildly, short-sighted.*
â†’ "To put it mildly" signals the author's real opinion is much harsher.

2. *Scholars have long debated interventionism. The current administration seems uninterested in nuance.*
â†’ Shift from academic neutrality to pointed criticism.

3. *The data speak for themselves â€” or so proponents would have us believe.*
â†’ The second clause undercuts the first. Tone shifts from agreement to scepticism.

4. *One might argue, charitably, that the policy was well-intentioned. Its effects were catastrophic.*
â†’ "Charitably" signals generous interpretation â€” before demolition.

5. *The report concludes with the rather extraordinary claim that inequality is beneficial.*
â†’ "Rather extraordinary" = understatement as criticism.

6. *The findings are robust, the methodology rigorous, and the conclusions â€” utterly predictable.*
â†’ The dash breaks praise into dismissal.

7. *In the central bank's measured language, "growth remains subdued" â€” meaning the economy is stagnating.*
â†’ Decoding institutional euphemism.

8. *He writes with the confidence of someone who has never been wrong â€” or never noticed.*
â†’ Irony: confidence is not admirable but oblivious.

---

## Real RC Application

> *The proponents of UBI speak with almost evangelical fervour about its transformative potential. Critics adopt a more sober tone, pointing to fiscal constraints. The truth likely resides somewhere between the pulpit and the spreadsheet.*

Tone analysis: "evangelical fervour" (dismissive of proponents), "sober tone" (approving of critics), "between the pulpit and the spreadsheet" (balanced but subtly favouring critics).

---

## Key Takeaways

- Tone reveals the author's stance toward their subject.
- Register shifts signal moments of strong opinion or rhetorical effect.
- Formal register does not equal objectivity â€” watch for irony and loaded word choices.
- Hedging signals caution; intensifiers signal conviction.
- When tone toward different positions differs, that asymmetry reveals bias.
- In CAT RC, tone questions are answered by finding specific word choices that reveal attitude.

often appears when the author says something that is technically positive but contextually absurd.`,
      examples: [
        "'The committee has, with characteristic efficiency, delayed the decision for the third consecutive year.' — Ironic tone: 'characteristic efficiency' is sarcastic; the real message is the committee is inefficient.",
        "'One might argue — though the evidence hardly compels it — that this approach is optimal.' — Sceptical, hedged. The author doubts the view they are describing.",
        "'The findings are, to put it charitably, inconclusive.' — 'To put it charitably' signals the author thinks 'inconclusive' is actually generous; they mean the findings are worse.",
        "'This is a remarkable achievement in a field that has struggled to produce measurable results.' — Genuinely enthusiastic but contextual: the praise is qualified by the field's general difficulty.",
        "'The policy has succeeded in its own narrow terms.' — Critical concession: success is acknowledged but the terms are implicitly called too narrow.",
      ],
    },
    [
      // EASY
      {
        difficulty: "easy",
        prompt: "The author writes: 'The committee has, with admirable speed, produced a report that manages to say very little about everything.' What is the author's tone?",
        choices: ["Enthusiastic", "Ironic", "Neutral", "Sympathetic"],
        answer: "Ironic",
        explanation: "'Admirable speed' appears complimentary, but the follow-up — 'says very little about everything' — reveals the praise is sarcastic. The author is criticising the committee's report by praising superficial qualities while exposing the substantive failure.",
      },
      {
        difficulty: "easy",
        prompt: "The author writes: 'The evidence suggests — tentatively, it must be said — that the intervention may have had some effect.' What best describes the author's tone?",
        choices: ["Assertive and confident", "Hedged and cautious", "Critical and dismissive", "Enthusiastic"],
        answer: "Hedged and cautious",
        explanation: "Multiple hedging signals: 'suggests' (not 'proves'), 'tentatively, it must be said' (explicitly qualifying), 'may have had' (conditional). The author is deliberately avoiding overstatement — the tone is careful and measured.",
      },
      {
        difficulty: "easy",
        prompt: "Which sentence expresses the most critical tone toward a policy?",
        choices: [
          "The policy has produced mixed results.",
          "The policy has achieved some of its stated objectives.",
          "The policy has failed to address the structural causes it was designed to resolve.",
          "The policy remains under review by the relevant bodies."
        ],
        answer: "The policy has failed to address the structural causes it was designed to resolve.",
        explanation: "'Failed to address' is an explicit negative judgment. 'Designed to resolve' makes the failure more pointed — the policy didn't even achieve its own stated purpose. The other options are either neutral or mildly positive.",
      },
      // MEDIUM
      {
        difficulty: "medium",
        prompt: "The author describes a new economic theory as 'intellectually elegant but empirically unmoored'. What attitude does this phrase reveal?",
        choices: [
          "The author admires the theory and endorses it",
          "The author finds the theory beautiful but considers it disconnected from real-world evidence",
          "The author is indifferent to the theory's empirical status",
          "The author believes the theory is both elegant and well-supported"
        ],
        answer: "The author finds the theory beautiful but considers it disconnected from real-world evidence",
        explanation: "'Intellectually elegant' — genuine praise for its internal logic. 'Empirically unmoored' — a pointed criticism: the theory floats free of evidence. Together, they create a concessive critique: beautiful in theory, useless in practice. 'But' is the pivot that defines the true tone.",
      },
      {
        difficulty: "medium",
        prompt: "The passage shifts from describing the history of urban planning to stating: 'We have built cities for cars, not for people.' What does this shift signal?",
        choices: [
          "A shift from analysis to prescription",
          "A shift from formal to informal register, and from description to critique",
          "A shift to a more cautious tone",
          "A shift from a specific to a general argument"
        ],
        answer: "A shift from formal to informal register, and from description to critique",
        explanation: "The phrase 'We have built cities for cars, not for people' uses first-person plural ('we'), direct assertive language, and a moral contrast (cars vs people). This is a register shift from analytical third-person description to engaged, prescriptive first-person critique. The tone becomes more urgent and evaluative.",
      },
      {
        difficulty: "medium",
        prompt: "The author writes: 'Critics have argued, not without some justification, that the policy prioritised optics over outcomes.' What is implied about the author's own view?",
        choices: [
          "The author fully agrees with the critics",
          "The author dismisses the critics entirely",
          "The author partially agrees with the critics but does not fully endorse their view",
          "The author is neutral and presents the view without evaluation"
        ],
        answer: "The author partially agrees with the critics but does not fully endorse their view",
        explanation: "'Not without some justification' is a carefully calibrated concession. The author acknowledges the critics have *some* valid basis, but the phrasing distances the author from full endorsement. 'Not without some' is hedged — it's less than 'the critics are entirely right'.",
      },
      // HARD
      {
        difficulty: "hard",
        prompt: "In the final paragraph, the author shifts from describing research findings to writing: 'One is left to wonder whether the field, having invested so heavily in its own theoretical apparatus, can still see the people it claims to serve.' What change in tone does this represent?",
        choices: [
          "From optimistic to pessimistic",
          "From neutral-analytical to critical and wistful",
          "From descriptive to prescriptive",
          "From formal to conversational"
        ],
        answer: "From neutral-analytical to critical and wistful",
        explanation: "'One is left to wonder' signals a reflective, questioning tone — wistful, not angry. The phrase 'its own theoretical apparatus' carries implicit criticism (the field is self-absorbed). 'The people it claims to serve' implies a gap between stated mission and actual practice. The tone is both critical (the field is failing) and wistful (it's a sad observation, not a polemic).",
      },
      {
        difficulty: "hard",
        prompt: "The author writes: 'The government's response was, by any reasonable standard, adequate. Whether it was wise is a separate question.' What rhetorical move is the author making?",
        choices: [
          "Praising the government unambiguously",
          "Conceding adequacy while implicitly questioning deeper judgment",
          "Arguing that the government acted unwisely",
          "Stating that the government's response was neither adequate nor wise"
        ],
        answer: "Conceding adequacy while implicitly questioning deeper judgment",
        explanation: "The author sets a limited standard ('adequate') and grants it was met — a minimal concession. Then immediately raises a higher standard ('wise') and declines to answer it in the same sentence — a classic rhetorical suspension. The unanswered question implies the answer is 'no'. The tone is precisely calibrated: not openly critical, but deeply sceptical.",
      },
      {
        difficulty: "hard",
        prompt: "The passage describes a proposed urban policy as 'a solution of considerable ambition, not matched, it must be said, by commensurate evidence of effectiveness.' The author's attitude is best described as:",
        choices: [
          "Enthusiastic but cautious",
          "Respectful of the ambition while sceptical of the evidence base",
          "Dismissive of both the ambition and the evidence",
          "Neutral and purely descriptive"
        ],
        answer: "Respectful of the ambition while sceptical of the evidence base",
        explanation: "'Considerable ambition' is genuine praise for scale and intent. 'Not matched...by commensurate evidence' is a pointed critique: the ambition and the evidence are misaligned. 'It must be said' signals the author feels obligated to raise this criticism — a reluctant but honest observation. The tone is respectful of intent but honest about the gap.",
      },
      {
        difficulty: "easy",
        prompt: "A passage describes a CEO's strategy as 'bold and visionary.' What tone does this suggest?",
        choices: ["Critical", "Neutral", "Approving", "Sarcastic"],
        answer: "Approving",
        explanation: "'Bold and visionary' are positive evaluative adjectives. The author is praising the strategy. Sarcasm would require contextual contradiction.",
      },
      {
        difficulty: "easy",
        prompt: "An author writes: 'The findings are, to say the least, unexpected.' What does this phrase signal?",
        choices: ["The findings were exactly as predicted.", "The author is understating their surprise.", "The author is neutral about the findings.", "The findings were slightly unusual."],
        answer: "The author is understating their surprise.",
        explanation: "'To say the least' is an understatement device. It signals the author's actual reaction is much stronger than 'unexpected' conveys.",
      },
      {
        difficulty: "medium",
        prompt: "'The committee, in its wisdom, chose to delay the decision yet again.' What is the author's tone?",
        choices: ["Respectful", "Ironic â€” 'wisdom' is sarcastic given the repeated delays", "Neutral", "Sympathetic"],
        answer: "Ironic â€” 'wisdom' is sarcastic given the repeated delays",
        explanation: "'In its wisdom' combined with 'yet again' creates irony. The committee is not being praised â€” the repeated delays suggest incompetence.",
      },
      {
        difficulty: "medium",
        prompt: "An author shifts from 'Research indicates that...' to 'What is abundantly clear is that...' What does this register shift signal?",
        choices: ["The author is citing a different source.", "The author is moving from cautious reporting to strong personal conviction.", "The author is contradicting the research.", "The author is summarising more concisely."],
        answer: "The author is moving from cautious reporting to strong personal conviction.",
        explanation: "'Research indicates' is hedged and attributed. 'What is abundantly clear' is assertive and personal. The shift signals the author's own conviction emerging.",
      },
      {
        difficulty: "hard",
        prompt: "'The minister assured the public that the government remained committed to its targets. Meanwhile, emissions rose for the fourth consecutive year.' What is the combined effect?",
        choices: ["Supportive â€” the government is trying", "Ironic â€” juxtaposition reveals empty assurances", "Neutral â€” two unrelated facts", "Sympathetic â€” acknowledging difficulty"],
        answer: "Ironic â€” juxtaposition reveals empty assurances",
        explanation: "Irony from juxtaposition: 'assured commitment' is immediately undermined by 'emissions rose.' 'Meanwhile' signals simultaneous contradiction. The tone is critical without being explicit.",
      },
      {
        difficulty: "hard",
        prompt: "'The proposal has been endorsed by a constellation of think tanks, industry lobbies, and assorted vested interests â€” all of whom, naturally, stand to benefit.' What is the author's stance?",
        choices: ["Supportive â€” noting broad consensus", "Critical â€” endorsements come from biased parties", "Neutral â€” listing stakeholders", "Ambivalent"],
        answer: "Critical â€” endorsements come from biased parties",
        explanation: "'Constellation' is mildly sarcastic. 'Assorted vested interests' names bias directly. 'Naturally' is ironic â€” the self-interest is so obvious it doesn't need stating. The author undermines the endorsements' credibility.",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 9 — QUALIFIER WORDS
// ═══════════════════════════════════════════════════════════════
async function seedQualifierWords() {
  await upsertTopic(
    {
      slug: "qualifier-words",
      title: "Qualifier Words",
      description: "How most, some, often, and never change the scope and strength of any claim.",
      sortOrder: 12,
      section: "reading_patterns",
    },
    {
      title: "Qualifier Words: The Scope of Every Claim",
      content: `## Why This Matters For Reading

The difference between *some* and *all*, between *often* and *always*, between *may* and *will* — these are not small differences. They are the difference between a defensible claim and an overreaching one, between correlation and causation, between a possibility and a certainty.

In CAT RC questions, the single most common trap is an answer option that changes the scope of the author's claim. The passage says "most researchers agree" — the trap option says "all researchers agree". One word changes the entire claim. And students who aren't tracking qualifiers miss it every time.

---

## Core Idea

**Qualifiers modify the scope or certainty of a claim.**

**Scope qualifiers** (how many or how much):
- Universal: *all*, *every*, *always*, *invariably*, *without exception*
- Majority: *most*, *many*, *generally*, *predominantly*, *typically*
- Partial: *some*, *several*, *a few*, *occasionally*, *in some cases*
- None: *no*, *never*, *none*, *in no case*

**Certainty qualifiers** (how sure):
- Certain: *definitely*, *clearly*, *undoubtedly*, *unmistakably*
- Probable: *likely*, *probably*, *tends to*, *often*
- Possible: *may*, *might*, *could*, *possibly*, *perhaps*
- Uncertain: *arguably*, *it is suggested that*, *one might speculate*

When an author uses a partial qualifier, they are being deliberately careful. They have evidence for *some* cases, not *all*. Replacing that qualifier with a stronger one changes what the evidence actually supports.

---

## Reading Impact

Every time you see a qualifier, it defines the exact boundary of the author's claim. Your job is to:
1. Identify the qualifier
2. Understand the scope it creates
3. Verify that the answer option preserves that scope

A common RC error: the passage says "may contribute to" and the student chooses an option that says "causes". *May contribute* is a weak possibility; *causes* is a strong causal claim. The qualifier difference is the entire difference.

---

## Pattern Recognition

→ When you see *most*, *many*, *often* — the author is NOT saying all. Don't generalise.
→ When you see *may*, *might*, *could*, *possibly* — the author is NOT asserting. Don't treat it as a fact.
→ *Never* and *always* are strong claims — they are almost always wrong as correct RC options, because most scholarly arguments avoid universals.
→ Watch for **hidden qualifiers**: "it has been argued that" = someone else said this; the author may not agree.
→ In answer options, **strengthen/weaken**: 
---

## Common Reader Mistakes

**Mistake 1: Treating qualified claims as absolute.**
- "Most economists agree" â‰  "All economists agree." Readers often drop qualifiers.

**Mistake 2: Missing *suggests* vs *proves*.**
- "The data suggest a correlation" is tentative. Academic writing almost always uses *suggests*.

**Mistake 3: Ignoring *tends to* as a scope limiter.**
- "Democracy tends to produce stable governance" allows for exceptions.

**Mistake 4: Overlooking double qualifiers.**
- "It is possible that some studies may overestimate" â€” three qualifiers make this extremely cautious.

**Mistake 5: Confusing *many* with *most*.**
- "Many critics" = significant number, possibly minority. "Most critics" = majority.

---

## Contextual Examples

1. *The evidence largely supports the hypothesis, though anomalies remain.*
â†’ *Largely* = not completely. The author endorses with reservations.

2. *It would be an exaggeration to say the policy failed entirely.*
â†’ Negative qualifier implying partial failure.

3. *Some scholars question the methodology, though consensus remains broadly supportive.*
â†’ *Some* = minority. *Broadly* = with exceptions.

4. *The results are, at best, inconclusive.*
â†’ *At best* sets a ceiling â€” the best-case is inconclusive.

5. *Nearly all participants reported improvement, though magnitude varied considerably.*
â†’ *Nearly all* = not all. *Varied considerably* = uneven improvement.

6. *The author argues, somewhat controversially, that growth is not inherently desirable.*
â†’ *Somewhat controversially* pre-qualifies â€” signalling contested territory.

7. *It is tempting to conclude correlation implies causation, but such a conclusion would be premature.*
â†’ *Premature* = the evidence does not yet support it.

8. *Perhaps the most significant finding is that the effect diminishes over time.*
â†’ *Perhaps* hedges â€” strong suggestion without full commitment.

---

## Real RC Application

> *Most studies suggest that moderate exercise is associated with reduced cardiovascular risk. However, some recent research indicates the relationship may be more complex, with benefits plateauing at very high exertion levels.*

Qualifier map: *Most* (not all), *suggest* (not prove), *associated with* (correlation), *some* (minority), *may be* (tentative). A CAT question asking "What does the passage establish as certain?" â€” virtually nothing. Every claim is qualified.

---

## Key Takeaways

- Qualifiers control the exact strength of a claim. Do not ignore them.
- *Most/many/some/few* form a spectrum. Do not interchange them.
- *Suggests/indicates* is weaker than *proves/demonstrates*.
- *Tends to/often/usually* allow for exceptions.
- *At best/at most* set ceilings. *At least/at minimum* set floors.
- In CAT RC, wrong options often remove or add qualifiers to distort the passage's claim.

Does the option make the claim stronger or weaker than the passage? Either direction is likely wrong.`,
      examples: [
        "'Most studies suggest that sleep deprivation impairs cognitive function.' — 'Most' excludes some studies; 'suggest' signals uncertainty; 'impairs' is directional but not causal.",
        "'The policy may have contributed to the decline.' — 'May have' is a past possibility, not a certainty. 'Contributed' is partial causation.",
        "'Some economists believe this approach is viable.' — 'Some' means a subset, not a consensus. The approach is contested.",
        "'Poverty invariably leads to poor health outcomes.' — 'Invariably' is a universal claim. In scholarly writing, this is almost certainly being presented to be challenged.",
        "'The intervention tends to be more effective in urban settings.' — 'Tends to' = a general pattern, with exceptions implied.",
      ],
    },
    [
      // EASY
      {
        difficulty: "easy",
        prompt: "The passage states: 'Many economists believe that austerity measures reduce long-term growth.' Which answer option accurately reflects this claim?",
        choices: [
          "All economists agree that austerity reduces growth.",
          "A majority of economists hold that austerity is harmful to long-term growth.",
          "Economists have proven that austerity reduces growth.",
          "No economist supports austerity as a growth strategy."
        ],
        answer: "A majority of economists hold that austerity is harmful to long-term growth.",
        explanation: "'Many' = a majority, not all. 'Believe' = a held view, not proven fact. 'A majority of economists hold' preserves both qualifiers accurately. 'All economists agree' overclaims scope. 'Proven' overclaims certainty. 'No economist' inverts the claim entirely.",
      },
      {
        difficulty: "easy",
        prompt: "Which sentence makes the strongest (most universal) claim?",
        choices: [
          "Democracy may lead to more stable governance in some contexts.",
          "Democracy often produces more stable governance than authoritarian regimes.",
          "Democracy tends to be associated with greater governance stability.",
          "Democracy invariably produces more stable governance than any alternative system."
        ],
        answer: "Democracy invariably produces more stable governance than any alternative system.",
        explanation: "'Invariably' = always, without exception. 'Any alternative system' = universal comparison. This is an absolute, universal claim. The other options use 'may' (weak possibility), 'often' (frequent but not always), and 'tends to be associated' (correlation, partial).",
      },
      {
        difficulty: "easy",
        prompt: "The author writes: 'Urbanisation may be contributing to rising anxiety levels.' Which answer option correctly weakens this claim?",
        choices: [
          "Urbanisation is the primary cause of rising anxiety.",
          "Urbanisation has definitively caused rising anxiety.",
          "Urbanisation could possibly be one factor among several in rising anxiety.",
          "Urbanisation has no effect on anxiety."
        ],
        answer: "Urbanisation could possibly be one factor among several in rising anxiety.",
        explanation: "'May be contributing' = possible partial causation. 'Could possibly be one factor among several' correctly preserves the weak possibility and partial causation. 'Primary cause' and 'definitively caused' both strengthen. 'No effect' inverts the claim.",
      },
      // MEDIUM
      {
        difficulty: "medium",
        prompt: "The passage states that 'in most cases, access to quality education correlates with better economic outcomes.' A student summarises this as: 'Quality education guarantees better economic outcomes.' What error has the student made?",
        choices: [
          "Changed 'correlates' to 'guarantees', removing uncertainty and partial causation",
          "Removed the word 'most', universalising the claim",
          "Both A and B",
          "No error — the summary is accurate"
        ],
        answer: "Both A and B",
        explanation: "Two qualifier errors: (1) 'In most cases' → 'guarantees' removes the scope limitation ('most' becomes 'all'). (2) 'Correlates' → 'guarantees' removes the correlation-not-causation distinction and adds certainty. Both changes together dramatically overclaim what the passage actually states.",
      },
      {
        difficulty: "medium",
        prompt: "The author argues: 'Some critics have suggested that the framework is fundamentally flawed.' Which inference is the author most likely making?",
        choices: [
          "The author agrees that the framework is fundamentally flawed.",
          "The author is introducing a view held by a subset of critics, not necessarily endorsing it.",
          "The author believes most critics support the framework.",
          "The author thinks the framework has no flaws."
        ],
        answer: "The author is introducing a view held by a subset of critics, not necessarily endorsing it.",
        explanation: "'Some critics have suggested' — 'some' limits the scope to a subset. 'Have suggested' is a reporting verb that distances the author from the claim. The author is presenting a position, not endorsing it. This is a classic way to introduce a counterargument before responding to it.",
      },
      {
        difficulty: "medium",
        prompt: "Choose the answer that best preserves the scope and certainty of: 'Urban green spaces tend to reduce stress in office workers.'",
        choices: [
          "Urban green spaces always reduce stress in workers.",
          "Urban green spaces generally have a stress-reducing effect on office workers, though not universally.",
          "Urban green spaces reduce stress in all workers.",
          "Urban green spaces may or may not reduce stress in office workers."
        ],
        answer: "Urban green spaces generally have a stress-reducing effect on office workers, though not universally.",
        explanation: "'Tend to' = general pattern, not universal. 'Generally...though not universally' preserves this nuance precisely. 'Always' and 'all workers' overclaim. 'May or may not' underclaims — the original 'tend to' implies a consistent but non-universal pattern.",
      },
      // HARD
      {
        difficulty: "hard",
        prompt: "The passage states: 'It has been argued, with some plausibility, that economic inequality may undermine social cohesion.' Which answer option most accurately reflects the author's stance?",
        choices: [
          "The author argues that economic inequality undermines social cohesion.",
          "The author presents a possible view held by others, while implying it has some but not overwhelming support.",
          "The author refutes the idea that inequality affects social cohesion.",
          "The author believes economic inequality definitely undermines social cohesion."
        ],
        answer: "The author presents a possible view held by others, while implying it has some but not overwhelming support.",
        explanation: "'It has been argued' = reported speech; author is presenting someone else's argument. 'With some plausibility' = partial endorsement; the author acknowledges it's not baseless but not fully compelling either. 'May undermine' = weak possibility, not established fact. The author is neither dismissing nor endorsing the claim.",
      },
      {
        difficulty: "hard",
        prompt: "The passage argues: 'Rarely do technological solutions alone resolve the social problems they claim to address.' A critic responds: 'The author claims technology never solves social problems.' Which qualifier words has the critic changed, and what is the effect?",
        choices: [
          "Changed 'rarely' to 'never' — weakened the claim",
          "Changed 'rarely' to 'never' — overstated the claim; and removed 'alone', changing the argument's scope",
          "Changed 'alone' to 'solutions' — changed the argument's target",
          "Made no significant change to the claim's scope"
        ],
        answer: "Changed 'rarely' to 'never' — overstated the claim; and removed 'alone', changing the argument's scope",
        explanation: "Two changes: (1) 'Rarely' → 'never': 'rarely' allows exceptions; 'never' is absolute. (2) 'Alone' is critical: the author argues technology alone rarely solves problems — technology combined with other things might. Removing 'alone' means the critic attributes a stronger anti-technology position than the author holds.",
      },
      {
        difficulty: "hard",
        prompt: "Read the following: 'Most attempts to reform welfare systems have achieved only partial success, and some have arguably made conditions worse for the most vulnerable.' Which two qualifier pairs carry the most argumentative weight?",
        choices: [
          "'Most' and 'only partial' — because they define the scope and extent of success",
          "'Some' and 'arguably' — because they limit the scope and hedge the certainty of the failure claim",
          "Both pairs — 'most/only partial' limits reform success; 'some/arguably' limits the failure claim",
          "'Have achieved' and 'have made' — the verb tenses carry the weight"
        ],
        answer: "Both pairs — 'most/only partial' limits reform success; 'some/arguably' limits the failure claim",
        explanation: "'Most' + 'only partial' = the majority of reforms succeed, but incompletely. 'Some' + 'arguably' = a minority of cases may have worsened things, but even this is hedged. The author is making a nuanced, doubly-qualified argument: most reforms are inadequate; some may be harmful — but the latter is uncertain. Both qualifier pairs are essential to the argument's balance.",
      },
      {
        difficulty: "easy",
        prompt: "'The treatment appears to reduce symptoms in some patients.' Which word makes this qualified rather than absolute?",
        choices: ["treatment", "appears", "symptoms", "patients"],
        answer: "appears",
        explanation: "'Appears' hedges the claim â€” reduction is observed but not confirmed. 'Some' also limits scope, but 'appears' is the primary hedge on the claim itself.",
      },
      {
        difficulty: "easy",
        prompt: "What is the difference between 'Studies prove X' and 'Studies suggest X'?",
        choices: ["No difference", "'Prove' is definitive; 'suggest' is tentative", "'Suggest' is stronger", "'Prove' is for science; 'suggest' for humanities"],
        answer: "'Prove' is definitive; 'suggest' is tentative",
        explanation: "'Prove' claims certainty. 'Suggest' claims probability. Academic writing almost always uses 'suggest' because absolute proof is rare.",
      },
      {
        difficulty: "medium",
        prompt: "'It is possible that the observed correlation may be attributable to confounding variables.' How many qualifiers does this contain?",
        choices: ["One", "Two", "Three â€” 'possible', 'may', and 'observed'", "Four"],
        answer: "Three â€” 'possible', 'may', and 'observed'",
        explanation: "'Possible' (uncertainty), 'may' (tentative), 'observed' (limiting to what was seen). Together they make this extremely cautious. 'Correlation' itself also implies non-causation.",
      },
      {
        difficulty: "medium",
        prompt: "'The policy has been largely successful, though not without significant drawbacks.' What does this establish?",
        choices: ["Complete success", "Complete failure", "Success overall but with notable problems", "Drawbacks outweigh successes"],
        answer: "Success overall but with notable problems",
        explanation: "'Largely' qualifies success (not total). 'Not without significant drawbacks' acknowledges real problems. Neither 'complete success' nor 'complete failure' respects the qualifiers.",
      },
      {
        difficulty: "hard",
        prompt: "'While it would be premature to draw definitive conclusions, the preliminary evidence tentatively suggests the intervention may yield modest benefits for a subset of the target population.' Characterise this claim's strength.",
        choices: ["Strong", "Moderate", "Weak â€” might partially work for some people", "No claim at all"],
        answer: "Weak â€” might partially work for some people",
        explanation: "Seven qualifiers: 'premature', 'preliminary', 'tentatively', 'suggests', 'may', 'modest', 'subset'. Each weakens the claim further. The intervention might partially work for some people â€” an extremely cautious position.",
      },
      {
        difficulty: "hard",
        prompt: "Passage A: 'Remote work enhances productivity.' Passage B: 'Some evidence suggests remote work may, under certain conditions, be associated with modest productivity gains for knowledge workers.' Which is more defensible?",
        choices: ["A â€” clear and direct", "B â€” qualifiers make it harder to disprove", "Both equally strong", "Neither valid"],
        answer: "B â€” qualifiers make it harder to disprove",
        explanation: "A is absolute and easily disproved by one counterexample. B qualifies scope ('some evidence', 'knowledge workers'), certainty ('suggests', 'may'), conditions ('under certain conditions'), and magnitude ('modest'). Each qualifier narrows and strengthens defensibility.",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 10 — ARGUMENT STRUCTURE
// ═══════════════════════════════════════════════════════════════
async function seedArgumentStructure() {
  await upsertTopic(
    {
      slug: "argument-structure",
      title: "Argument Structure",
      description: "Identifying claims, evidence, counterarguments, and conclusions — the skeleton of every essay.",
      sortOrder: 13,
      section: "reading_patterns",
    },
    {
      title: "Reading Arguments: Claim, Evidence, Counterargument, Conclusion",
      content: `## Why This Matters For Reading

Every essay, editorial, and CAT RC passage is built around an argument. It has a claim — something the author wants you to believe. It has evidence — reasons or facts supporting that claim. It often has a counterargument — an opposing view the author acknowledges before dismantling. And it ends with a conclusion — what follows if the argument holds.

If you can identify these four components, you can read any complex passage efficiently. You know where to look for the main idea (the claim), where to look for support (the evidence), where to expect complication (the counterargument), and where to find the author's final position (the conclusion).

---

## Core Idea

**The four-part argument structure:**

1. **Claim (Thesis):** The author's main assertion. Often appears in the introduction — but not always. Some authors withhold the claim until the end.

2. **Evidence:** Can be empirical (data, studies, examples), logical (reasoning), or rhetorical (analogy, authority). Evidence always serves the claim — it doesn't exist independently.

3. **Counterargument:** An opposing view or objection the author raises. The author raises it either to dismiss it, to qualify it, or to use it as a foil for the main argument.

4. **Conclusion:** What follows from the claim + evidence. Often introduced by *therefore*, *hence*, *thus*, *consequently*, or *this suggests*.

**Important:** The counterargument is NOT the author's view. Students frequently attribute the counterargument to the author — this is one of the most common RC errors.

---

## Reading Impact

Once you identify the structure, you can locate the main idea question answer (claim), the inference question answer (conclusion or implication), and the tone question answer (how the author treats the counterargument).

**The concession trap:** Authors often write: "Critics argue X. However, this view overlooks Y." The trap: the student reads "X" and thinks it's the author's view. It's not — it's the counterargument.

---

## Pattern Recognition

→ **Claim signals:** "I argue that", "The central thesis is", "This essay contends", or simply an assertive statement in the first paragraph.
→ **Evidence signals:** "Studies show", "For example", "Data from", "Consider the case of", "This is demonstrated by".
→ **Counterargument signals:** "Critics argue", "Some contend", "It might be objected that", "One common view holds", "Proponents of X claim".
→ **Conclusion signals:** "Therefore", "Thus", "Hence", "This suggests", "Consequently", "It follows that".
→ **The author's real position** comes after counterargument dismissal — 
---

## Common Reader Mistakes

**Mistake 1: Confusing evidence with the conclusion.**
- "Studies show X" is evidence. "Therefore, we should Y" is the conclusion.

**Mistake 2: Missing implicit premises.**
- "Education reduces crime, therefore invest in schools" assumes crime reduction is a priority.

**Mistake 3: Treating counterarguments as the author's view.**
- "Critics argue X" â€” X is not the author's position; it is a target.

**Mistake 4: Not identifying the argument's weakest point.**
- Every argument has a link that, if broken, collapses the chain.

**Mistake 5: Assuming chronological order = logical order.**
- Conclusions sometimes come first, evidence follows.

---

## Contextual Examples

1. *The author opens with a bold claim, marshals evidence, acknowledges objections, and dismisses them.*
â†’ Structure: Claim â†’ Evidence â†’ Counterarguments â†’ Rebuttals.

2. *The passage describes a phenomenon, proposes an explanation, then tests it against alternatives.*
â†’ Structure: Observation â†’ Hypothesis â†’ Testing.

3. *"While it is true that markets are efficient, they fail to address externalities."*
â†’ Concession (efficient) â†’ Claim (fail on externalities).

4. *The argument rests on an unstated assumption: growth and environment are mutually exclusive.*
â†’ Hidden premise â€” if challenged, the argument collapses.

5. *She establishes that inequality has grown, argues it is policy-driven, then proposes interventions.*
â†’ Structure: Establish fact â†’ Interpret â†’ Recommend.

6. *The author presents the strongest opposing view before dismantling it.*
â†’ "Steel man" technique â€” makes the rebuttal more convincing.

7. *The passage moves from anecdote to data to theory â€” each layer strengthening the claim.*
â†’ Structure: Particular â†’ General â†’ Abstract.

8. *The final paragraph reverses the opening claim â€” the essay built toward a contradiction.*
â†’ Apparent thesis â†’ evidence â†’ reversal.

---

## Real RC Application

> *It is commonly assumed that technology drives economic growth. This assumption, however, conflates correlation with causation. Institutional frameworks â€” property rights, rule of law â€” consistently precede innovation. Technology is the product of growth-enabling conditions, not their cause. Investing in technology without establishing institutions is confusing the symptom with the cure.*

Argument map: Common assumption â†’ Challenge (*however*) â†’ Counter-evidence â†’ Reframing â†’ Conclusion (*therefore*). Five moves, each signalled by structure.

---

## Key Takeaways

- Every argument has a structure: premises â†’ reasoning â†’ conclusion.
- Identify the conclusion first, then work backward to find support.
- Look for unstated assumptions â€” they are often the weakest point.
- Counterarguments are targets, not the author's view.
- The concession-claim pattern is the most common editorial structure.
- In CAT RC, "main argument" questions require distinguishing conclusion from evidence.

look for *however*, *but*, *yet*, *nevertheless* after a counterargument.`,
      examples: [
        "Claim: 'Urban planning has failed.' Evidence: 'Cities designed for cars produce isolation.' Counterargument: 'Some argue mixed-use zoning has improved outcomes.' Rebuttal: 'Yet this applies only to wealthy districts.' Conclusion: 'Therefore, systemic reform is needed.'",
        "A paragraph that begins 'It might be argued that free trade benefits all nations' — this is the counterargument, not the author's view.",
        "'This suggests that the solution lies not in more regulation but in better enforcement.' — 'This suggests' introduces the conclusion drawn from prior evidence.",
        "'The data demonstrate X. Furthermore, studies show Y. Therefore, we can conclude Z.' — Clean three-part structure: evidence + evidence + conclusion.",
        "The author raises the counterargument in paragraph 3 ('Critics claim...'), then dismantles it in paragraph 4 ('However, this overlooks...'). The main argument returns in paragraph 5.",
      ],
    },
    [
      // EASY
      {
        difficulty: "easy",
        prompt: "A passage paragraph reads: 'Critics of welfare spending argue that it creates dependency. However, longitudinal data show that recipients of welfare support are more likely to achieve economic independence within five years than those who receive no support.' What is the function of the sentence beginning with 'However'?",
        choices: [
          "It is the counterargument to the author's thesis.",
          "It is the author's evidence that refutes the critics' claim.",
          "It supports the critics' argument about dependency.",
          "It is the author's concluding claim."
        ],
        answer: "It is the author's evidence that refutes the critics' claim.",
        explanation: "'However' signals that what follows is a contrast to the critics' claim. 'Longitudinal data show...' is evidence the author presents to challenge the dependency argument. The author is using data to refute the counterargument, not to support it.",
      },
      {
        difficulty: "easy",
        prompt: "Which sentence most clearly introduces the author's main claim (thesis)?",
        choices: [
          "Some researchers have argued that social media has positive effects on mental health.",
          "This essay argues that the net effect of social media on adolescent wellbeing is, on balance, harmful.",
          "A 2022 study found that 40% of adolescents report increased anxiety after social media use.",
          "Therefore, policymakers should consider regulating social media platforms."
        ],
        answer: "This essay argues that the net effect of social media on adolescent wellbeing is, on balance, harmful.",
        explanation: "'This essay argues that' is a clear thesis signal. The sentence states the author's position directly. The first option is a counterargument (other researchers' view). The third is evidence. The fourth is a conclusion.",
      },
      {
        difficulty: "easy",
        prompt: "A passage ends: 'Consequently, any framework that ignores the role of local governance in policy implementation is likely to fail.' What part of the argument is this sentence?",
        choices: ["The main claim", "A piece of evidence", "A counterargument", "The conclusion"],
        answer: "The conclusion",
        explanation: "'Consequently' is a conclusion signal. The sentence states what follows from the argument that came before it — the logical endpoint of the analysis. It is not introducing new evidence or a new claim; it is drawing the argument to its logical terminus.",
      },
      // MEDIUM
      {
        difficulty: "medium",
        prompt: "A student reads: 'Proponents of austerity argue that reducing state spending frees resources for private investment.' The student notes: 'The author believes that reducing state spending is good.' What error has the student made?",
        choices: [
          "None — the student has correctly identified the author's view.",
          "The student has attributed the counterargument to the author — 'proponents argue' signals this is another view, not the author's.",
          "The student has confused the conclusion with the thesis.",
          "The student has misread the qualifier 'proponents of austerity'."
        ],
        answer: "The student has attributed the counterargument to the author — 'proponents argue' signals this is another view, not the author's.",
        explanation: "'Proponents of austerity argue' is a clear counterargument signal. The author is presenting someone else's view. The author's own view will appear after the counterargument, often following 'however' or 'yet'. This is the most common RC comprehension error.",
      },
      {
        difficulty: "medium",
        prompt: "Read the following passage skeleton and identify which part is missing: [Claim: Technology disrupts labour markets.] [Evidence: Automation displaces routine jobs.] [Conclusion: Policy must adapt.] What is absent?",
        choices: [
          "A thesis statement",
          "A counterargument that the author could acknowledge and respond to",
          "Additional evidence",
          "Nothing is missing — this is a complete argument"
        ],
        answer: "A counterargument that the author could acknowledge and respond to",
        explanation: "The argument moves directly from claim → evidence → conclusion. A sophisticated argument also acknowledges and responds to objections. For example: 'Critics argue that new jobs always emerge' (counterargument), before the author can reinforce the conclusion with 'However, this transition period itself demands policy intervention'.",
      },
      {
        difficulty: "medium",
        prompt: "The author writes: 'While it is true that markets often allocate resources efficiently, they systematically fail to address externalities such as pollution and inequality.' What is the argumentative function of 'While it is true that...'?",
        choices: [
          "It introduces the author's main claim.",
          "It concedes a point to the opposing view before advancing the author's argument.",
          "It provides empirical evidence for market efficiency.",
          "It is the conclusion of the paragraph."
        ],
        answer: "It concedes a point to the opposing view before advancing the author's argument.",
        explanation: "'While it is true that' is a classic concession marker. The author acknowledges that markets are often efficient (a strength), then uses 'they systematically fail' to pivot to the main argument (market failures). The concession makes the critique more credible — the author isn't denying market efficiency, just showing it's insufficient.",
      },
      // HARD
      {
        difficulty: "hard",
        prompt: "A CAT passage paragraph reads: 'It has been fashionable to attribute the decline of civic participation to social media. The evidence, however, is more complex. Participation in local governance — school boards, neighbourhood associations, community hearings — has in some regions increased even as social media use has grown.' What argumentative move is the author making?",
        choices: [
          "Introducing a claim and providing supporting evidence",
          "Presenting a popular view, then introducing complicating evidence that challenges it",
          "Summarising the counterargument before endorsing it",
          "Drawing a conclusion from established evidence"
        ],
        answer: "Presenting a popular view, then introducing complicating evidence that challenges it",
        explanation: "The paragraph follows a classic structure: [popular/easy attribution] → 'however' → [complicating evidence]. The author is not endorsing the social media explanation — 'fashionable' signals mild scepticism. 'The evidence...is more complex' is the pivot. The specific data (increased local participation) is the counter-evidence that complicates the popular narrative.",
      },
      {
        difficulty: "hard",
        prompt: "An author writes five paragraphs. Para 1: Background on climate policy. Para 2: 'The conventional view holds that carbon taxes are the most efficient mechanism.' Para 3: 'Recent research, however, suggests that behavioural interventions may be equally effective at lower political cost.' Para 4: 'Carbon taxes still have advantages in revenue generation and market signalling.' Para 5: 'A hybrid approach that combines both mechanisms therefore represents the most defensible policy path.' What is the argument structure?",
        choices: [
          "Claim → Evidence → Conclusion",
          "Background → Main Claim → Evidence → Counterargument → Conclusion",
          "Background → Counterargument (conventional view) → Author's complicating evidence → Concession to counterargument → Synthesised conclusion",
          "Background → Evidence → Evidence → Evidence → Conclusion"
        ],
        answer: "Background → Counterargument (conventional view) → Author's complicating evidence → Concession to counterargument → Synthesised conclusion",
        explanation: "Para 2 presents the conventional view (counterargument). Para 3 is the author's challenge using new research. Para 4 concedes the counterargument's remaining strengths. Para 5 synthesises both positions into a hybrid recommendation. This is a sophisticated dialectical structure — not a simple linear argument.",
      },
      {
        difficulty: "hard",
        prompt: "The author of a passage states its thesis only in the final paragraph. Why might an author choose this structure?",
        choices: [
          "Because the author forgot to state the thesis earlier",
          "To build evidence and counterargument gradually, allowing the conclusion to feel earned rather than asserted",
          "Because this is the only valid essay structure in academic writing",
          "To confuse the reader and test comprehension"
        ],
        answer: "To build evidence and counterargument gradually, allowing the conclusion to feel earned rather than asserted",
        explanation: "This is a classic inductive structure — moving from specific observations and complications to a general conclusion. It is more persuasive than stating the thesis upfront because by the time the reader reaches the conclusion, they have been walked through the full complexity of the argument. The thesis feels like a logical discovery rather than an imposed opinion.",
      },
      {
        difficulty: "easy",
        prompt: "'Universal education is essential. Literacy correlates with economic growth. Therefore, governments must invest in schools.' Which sentence is the conclusion?",
        choices: ["Universal education is essential.", "Literacy correlates with economic growth.", "Therefore, governments must invest in schools.", "All three."],
        answer: "Therefore, governments must invest in schools.",
        explanation: "'Therefore' explicitly marks the conclusion. The first sentence is the claim, the second is evidence, the third draws the logical result.",
      },
      {
        difficulty: "easy",
        prompt: "'Some argue regulation stifles innovation. However, the most innovative economies all have robust regulatory frameworks.' What is the first sentence's function?",
        choices: ["The author's main claim", "A counterargument the author will address", "Evidence for the author's view", "The conclusion"],
        answer: "A counterargument the author will address",
        explanation: "'Some argue' signals attribution â€” not the author's view. 'However' pivots to the author's real position, rebutting the counterargument with evidence.",
      },
      {
        difficulty: "medium",
        prompt: "'It is commonly assumed that competition improves educational outcomes. This assumption, however, overlooks collaboration in learning environments.' What unstated assumption underlies the common view?",
        choices: ["Education should be free", "Competition and collaboration are mutually exclusive", "All students benefit equally from competition", "Outcomes are easy to measure"],
        answer: "Competition and collaboration are mutually exclusive",
        explanation: "The author introduces collaboration as an alternative, implying the original assumption treats competition as the only mechanism. The hidden premise is that competition excludes collaboration.",
      },
      {
        difficulty: "medium",
        prompt: "An argument follows: Observation, Hypothesis, Evidence, Alternative explanation, Rejection of alternative, Conclusion. What type is this?",
        choices: ["Deductive", "Inductive", "Abductive (inference to the best explanation)", "Analogical"],
        answer: "Abductive (inference to the best explanation)",
        explanation: "Abductive reasoning starts with observation, proposes a hypothesis, and argues it is the best explanation by rejecting alternatives. Distinguished from deduction (general to specific) and induction (specific to general).",
      },
      {
        difficulty: "hard",
        prompt: "'Democracy is the best form of governance because it protects rights, promotes accountability, and reflects popular will.' What is the strongest structural objection?",
        choices: ["The evidence is factually wrong.", "The argument is circular â€” it defines 'best' by listing democracy's own features.", "Too many examples.", "It doesn't address economics."],
        answer: "The argument is circular â€” it defines 'best' by listing democracy's own features.",
        explanation: "The argument assumes what it needs to prove. It defines 'best' as features of democracy itself. A non-circular argument would need an independent criterion for 'best'.",
      },
      {
        difficulty: "hard",
        prompt: "Three paragraphs: (1) 'Growth has been the primary objective for decades.' (2) 'However, growth has not reduced inequality or addressed environmental degradation.' (3) 'We must therefore redefine our metrics.' Map the structure.",
        choices: ["Three independent claims", "Claim, Evidence, Conclusion", "Background, Complication, Proposal", "Evidence, Counterargument, Rebuttal"],
        answer: "Background, Complication, Proposal",
        explanation: "P1 = context (growth has been the focus). P2 = complication ('however' signals a problem). P3 = prescriptive conclusion ('therefore'). Background-Complication-Proposal is common in policy editorials.",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 11 — SCOPE AND SPECIFICITY
// ═══════════════════════════════════════════════════════════════
async function seedScopeAndSpecificity() {
  await upsertTopic(
    {
      slug: "scope-and-specificity",
      title: "Scope & Specificity",
      description: "How authors deliberately choose between broad and narrow claims — and why the difference matters.",
      sortOrder: 14,
      section: "reading_patterns",
    },
    {
      title: "Scope: How Wide is the Author's Claim?",
      content: `## Why This Matters For Reading

Every claim has a scope — a boundary that defines how broadly it applies. "Democracy is better than authoritarianism" is a universal claim. "Liberal democracy has performed better than authoritarian regimes in managing public health crises over the past two decades" is a narrow, specific claim. Both are about democracy, but they make very different arguments and require very different evidence.

When you miss the scope of a claim, you either over-generalise the author's argument or under-read it. Either error leads to wrong answers on inference and main idea questions.

---

## Core Idea

**Scope defines the size of the claim:**

- **Universal scope:** Applies to all cases, always. (Rare in scholarly writing.)
- **General scope:** Applies in most cases, typically. (Common.)
- **Qualified scope:** Applies under specific conditions, in certain contexts. (Most common in academic writing.)
- **Specific scope:** Applies to one case, one time, one group. (Narrow, case-specific arguments.)

Authors signal scope through:
- **Qualifier words:** all, most, some, rarely, often
- **Prepositional phrases:** "in the context of", "under conditions of", "particularly in"
- **Temporal boundaries:** "over the past decade", "since the financial crisis", "in the post-war era"
- **Geographical limits:** "in Western Europe", "in urban centres", "among developing economies"

---

## Reading Impact

When reading, scope is the first thing you should map after identifying the main claim. Ask:
- **Who** does this claim apply to?
- **When** does it apply?
- **Where** does it apply?
- **Under what conditions** does it apply?

The most common CAT trap: an answer option that accurately captures the *content* of the author's argument but applies it to a scope broader than the passage supports.

Passage: "In post-industrial cities, social capital has declined."
Trap option: "Social capital has declined across all modern societies."
The option is broader than what the passage argues — it removes the geographic and sociological boundary.

---

## Pattern Recognition

→ Identify the specific scope boundaries of every claim: who, when, where, under what conditions.
→ When an answer option removes a qualifier or boundary, it's overstating the claim — usually wrong.
→ When an option adds a qualifier that restricts the claim further than the passage does, it's understating — also usually wrong.
→ Look for "particularly", "especially", "in particular" — 
---

## Common Reader Mistakes

**Mistake 1: Treating specific claims as universal.**
- "In Nordic countries, welfare correlates with mobility" â‰  "Welfare causes mobility everywhere."

**Mistake 2: Missing scope-narrowing qualifiers.**
- "In the context of post-colonial economies" limits the scope. Do not generalise.

**Mistake 3: Confusing *all* and *most*.**
- A single counterexample refutes *all* but not *most*.

**Mistake 4: Not noticing scope broadening.**
- Authors may move from a case study to wider claims. Evaluate if the generalisation is justified.

**Mistake 5: Overlooking conditional scope.**
- "If institutions are weak, markets cannot self-regulate" â€” says nothing about strong institutions.

---

## Contextual Examples

1. *The study examined outcomes in three Southeast Asian economies between 2005 and 2015.*
â†’ Bounded by geography, region, and time. Do not generalise beyond.

2. *In societies where institutional trust is low, citizens rely on informal networks.*
â†’ Conditional â€” applies only where trust is low.

3. *The argument applies specifically to post-industrial economies.*
â†’ Explicitly limited scope. Do not apply to agrarian contexts.

4. *While observed in labs, its real-world relevance remains uncertain.*
â†’ Scope limited to laboratory findings.

5. *The correlation holds across all income levels.*
â†’ Author is broadening scope â€” the finding is general.

6. *This analysis focuses exclusively on the supply side.*
â†’ *Exclusively* limits scope. No demand-side conclusions.

7. *The claim that education reduces poverty is hard to defend in its strongest form. In a weaker form â€” that it improves employability â€” it is well supported.*
â†’ Two scopes: strong (universal) vs weak (limited).

8. *What is true for individuals may not be true for populations.*
â†’ Scope warning â€” individual findings may not scale.

---

## Real RC Application

> *Research in Scandinavian welfare states demonstrates that universal healthcare improves health outcomes. Critics point out these results may not be replicable in nations with different institutional structures, cultural attitudes, or inequality levels.*

The research scope is bounded (Scandinavia). The critics' objection is precisely about scope â€” arguing results cannot be generalised. A CAT answer must respect this limitation.

---

## Key Takeaways

- Every claim has a scope â€” the range of situations to which it applies.
- Scope can be limited by geography, time, population, conditions, or methodology.
- Respect scope boundaries â€” do not generalise beyond what the author states.
- Conditional claims apply only when the condition is met.
- *All* vs *most* vs *some* is a scope distinction.
- In CAT RC, wrong answers frequently violate scope â€” overgeneralising or undergeneralising.

they signal the author is narrowing a general point to a specific context.`,
      examples: [
        "'The policy was effective in reducing child mortality, particularly in rural areas of sub-Saharan Africa.' — Narrow scope: one outcome, one geography, one demographic.",
        "'Human beings are social creatures.' — Very broad universal scope — applies to all humans everywhere.",
        "'Since the 2008 financial crisis, trust in financial institutions has declined in most developed economies.' — Narrow in time and geography.",
        "'Technology tends to displace routine cognitive tasks.' — Qualified scope: 'tends to' and 'routine cognitive tasks' limit the claim.",
        "'This dynamic is especially pronounced in societies with weak institutional checks on executive power.' — The author is narrowing a broader point to a specific political context.",
      ],
    },
    [
      // EASY
      {
        difficulty: "easy",
        prompt: "The passage argues: 'In authoritarian regimes with weak institutions, corruption tends to increase over time.' Which option OVERSTATES the scope of this claim?",
        choices: [
          "Corruption is more likely to grow in authoritarian states with poorly developed institutions.",
          "In many cases, authoritarian systems without strong institutional checks experience rising corruption.",
          "All governments, authoritarian or democratic, inevitably become corrupt over time.",
          "The relationship between authoritarianism and corruption is more pronounced where institutions are weak."
        ],
        answer: "All governments, authoritarian or democratic, inevitably become corrupt over time.",
        explanation: "The passage's claim is scope-limited: authoritarian regimes + weak institutions + 'tends to'. Option C removes all three limits — extends to all governments, all regime types, and uses 'inevitably' (universal certainty). This dramatically overstates the claim.",
      },
      {
        difficulty: "easy",
        prompt: "Which sentence makes the narrowest (most specific) scope claim?",
        choices: [
          "Economic inequality harms social cohesion.",
          "Economic inequality tends to harm social cohesion in most societies.",
          "Since 2000, rising income inequality in OECD countries has been associated with declining community trust.",
          "All forms of economic inequality produce social harm."
        ],
        answer: "Since 2000, rising income inequality in OECD countries has been associated with declining community trust.",
        explanation: "This option specifies the time frame (since 2000), the geography (OECD countries), the specific type of inequality (income), the specific social outcome (community trust), and uses a correlation verb ('associated with') rather than causal language. Every dimension is bounded.",
      },
      {
        difficulty: "easy",
        prompt: "The author writes: 'This finding is particularly significant for developing economies with large informal labour sectors.' What does 'particularly' signal?",
        choices: [
          "The finding applies only to developed economies.",
          "The author is narrowing the finding's most important application to a specific context.",
          "The author thinks the finding is not significant generally.",
          "The finding applies universally but is most notable in developing economies."
        ],
        answer: "The author is narrowing the finding's most important application to a specific context.",
        explanation: "'Particularly' = especially, specifically in this case. The author is indicating that while the finding may have broader relevance, its most important implications are for developing economies with informal sectors. It narrows the argument's most salient application.",
      },
      // MEDIUM
      {
        difficulty: "medium",
        prompt: "The passage: 'Over the past two decades, women's participation in formal employment has increased significantly in East Asian economies.' An answer option reads: 'Women's economic participation has risen globally in recent years.' What is wrong with this option?",
        choices: [
          "It changes the time frame and broadens the geography from East Asia to 'globally'.",
          "It uses 'economic participation' instead of 'formal employment'.",
          "It adds 'in recent years' which changes the temporal boundary.",
          "All of the above."
        ],
        answer: "All of the above.",
        explanation: "Multiple scope distortions: (1) 'Two decades' → 'in recent years' (temporal change). (2) 'East Asian economies' → 'globally' (geographic expansion). (3) 'Formal employment' → 'economic participation' (definitional broadening). Each change alone would be problematic; all three together significantly overstate the passage.",
      },
      {
        difficulty: "medium",
        prompt: "The author claims: 'Mandatory voting laws have been shown to increase turnout, though their effect on political knowledge or engagement beyond voting is unclear.' Which option best preserves this scope?",
        choices: [
          "Mandatory voting increases civic engagement and political knowledge.",
          "Mandatory voting increases voter turnout but doesn't necessarily deepen political engagement more broadly.",
          "Mandatory voting has no proven effect on democratic participation.",
          "Mandatory voting increases turnout in all democracies that implement it."
        ],
        answer: "Mandatory voting increases voter turnout but doesn't necessarily deepen political engagement more broadly.",
        explanation: "The passage makes two claims: (1) effect on turnout is established; (2) effect on political knowledge/engagement is unclear. Only option B preserves both: 'increases voter turnout' (established) + 'doesn't necessarily deepen political engagement more broadly' (uncertain, not disproven).",
      },
      {
        difficulty: "medium",
        prompt: "The passage argues: 'While surveillance technology can deter petty crime in public spaces, its effectiveness against organised crime — which is adaptive and network-based — is far less clear.' A student concludes: 'Surveillance technology is ineffective.' What has the student done?",
        choices: [
          "Correctly summarised the passage",
          "Ignored the condition under which surveillance is effective and ignored the qualifier 'far less clear'",
          "Overstated only the qualifier",
          "Confused the claim with the counterargument"
        ],
        answer: "Ignored the condition under which surveillance is effective and ignored the qualifier 'far less clear'",
        explanation: "The passage makes a scope-differentiated argument: surveillance *is* effective for petty crime in public spaces; it is *less clearly effective* (not 'ineffective') against organised crime. The student's summary ('ineffective') is doubly wrong: it ignores the conditional positive, and changes 'far less clear' (uncertainty) to 'ineffective' (proven negative).",
      },
      // HARD
      {
        difficulty: "hard",
        prompt: "Read this passage extract: 'The claim that economic growth necessarily reduces inequality has been challenged by scholars who point to the experience of several Asian economies in the 1990s. These economies grew rapidly while inequality simultaneously widened. This does not, however, prove that growth is invariably inequality-increasing. It does suggest that the relationship is more contingent than is often assumed.' What is the author's precise position on the relationship between growth and inequality?",
        choices: [
          "Growth reduces inequality in all cases.",
          "Growth increases inequality in all cases.",
          "Growth does not necessarily reduce inequality; the relationship depends on context.",
          "Growth has no systematic relationship with inequality."
        ],
        answer: "Growth does not necessarily reduce inequality; the relationship depends on context.",
        explanation: "The author's position is carefully scoped: (1) Growth does NOT 'necessarily' reduce inequality (challenging the conventional view). (2) Growth does NOT 'invariably' increase inequality either (rejecting the strong counter-view). (3) The relationship is 'contingent' (context-dependent). This is a middle position — neither the optimistic nor the pessimistic universal claim.",
      },
      {
        difficulty: "hard",
        prompt: "The author writes: 'In societies where social mobility is low, educational attainment serves less as a pathway to economic advancement than as a signal of pre-existing social position.' The scope of this claim is limited to:",
        choices: [
          "All societies, everywhere",
          "Societies with low social mobility, where education's role is primarily signalling rather than advancement",
          "Developing economies with weak educational infrastructure",
          "Societies where education is inaccessible to the poor"
        ],
        answer: "Societies with low social mobility, where education's role is primarily signalling rather than advancement",
        explanation: "The scope is explicitly bounded by the condition 'where social mobility is low'. The claim is not universal — it is conditional. The author is making an argument about education's function specifically when social mobility is already constrained. Other options add conditions not in the text or remove the central condition.",
      },
      {
        difficulty: "hard",
        prompt: "An author concludes a 5,000-word essay with: 'What this analysis suggests, within the limits of the available evidence, is that community-based interventions may be more effective than top-down policies in addressing urban poverty — at least in the specific contexts examined.' What does the ending qualification 'at least in the specific contexts examined' do to the scope of the conclusion?",
        choices: [
          "It makes the conclusion universal by generalising from specific cases.",
          "It deliberately restricts the conclusion to the studied cases, refusing to generalise beyond the evidence.",
          "It weakens the conclusion to the point where it makes no useful claim.",
          "It implies the conclusion will apply globally with further research."
        ],
        answer: "It deliberately restricts the conclusion to the studied cases, refusing to generalise beyond the evidence.",
        explanation: "This is intellectual honesty about scope. The author has evidence from specific contexts and refuses to extrapolate beyond it. 'At least in the specific contexts examined' limits the conclusion to what was actually studied — a mark of scholarly rigour. Strong readers recognise this as appropriate scope discipline, not weakness. The conclusion still makes a claim; it just doesn't overclaim.",
      },
      {
        difficulty: "easy",
        prompt: "'In urban India, access to healthcare has improved significantly over the past decade.' Can this be applied to rural India?",
        choices: ["Yes â€” India is India.", "No â€” scope is explicitly limited to urban India.", "Yes â€” 'significantly' implies nationwide.", "It depends on defining healthcare."],
        answer: "No â€” scope is explicitly limited to urban India.",
        explanation: "The claim is bounded by 'in urban India.' Extending it to rural India exceeds the stated scope.",
      },
      {
        difficulty: "easy",
        prompt: "Which is the broadest claim? (A) 'Some students prefer online learning.' (B) 'Most students prefer online learning.' (C) 'Students prefer online learning.' (D) 'A few students prefer online learning.'",
        choices: ["A", "B", "C", "D"],
        answer: "C",
        explanation: "'Students prefer online learning' (no qualifier) implies all students â€” broadest scope. 'Most' narrows to majority, 'some' to a subset, 'a few' to a small minority.",
      },
      {
        difficulty: "medium",
        prompt: "'Democracies with strong judicial independence tend to protect minority rights more effectively.' A reader summarises: 'Democracy protects minority rights.' Is this fair?",
        choices: ["Yes â€” captures the main point.", "No â€” removes 'strong judicial independence' and 'tend to.'", "Yes â€” 'tend to' is just hedging.", "No â€” it's about judiciaries, not democracy."],
        answer: "No â€” removes 'strong judicial independence' and 'tend to.'",
        explanation: "The original is conditional (requires judicial independence) and probabilistic ('tend to'). The summary removes both, making an absolute claim about all democracies â€” a scope violation.",
      },
      {
        difficulty: "medium",
        prompt: "The author writes findings 'apply to OECD nations and cannot be generalised to economies with different institutional structures.' An answer option states: 'The findings demonstrate a universal principle.' Correct?",
        choices: ["Yes â€” OECD findings generalise.", "No â€” the author explicitly limits scope to OECD.", "Yes â€” 'fundamentally different' is minor.", "Depends on 'institutional structures.'"],
        answer: "No â€” the author explicitly limits scope to OECD.",
        explanation: "The author explicitly states findings 'cannot be generalised.' An option claiming universality directly contradicts this stated limitation.",
      },
      {
        difficulty: "hard",
        prompt: "A passage begins broadly: 'Technology transforms societies.' Then narrows: 'Digital communication has altered how political movements organise in post-2010 democracies.' How does scope change?",
        choices: ["Stays the same.", "Narrows on three dimensions: technology type, time/place, and effect.", "Broadens from digital to all technology.", "The claims are unrelated."],
        answer: "Narrows on three dimensions: technology type, time/place, and effect.",
        explanation: "Three dimensions narrow: type (technology to digital communication), context (societies to post-2010 democracies), effect (transforms to altered political organisation). The second claim is a specific instance of the first.",
      },
      {
        difficulty: "hard",
        prompt: "A researcher writes: 'Under controlled lab conditions, subjects exposed to blue light for 30 minutes before sleep reported lower sleep quality.' A journalist reports: 'Blue light destroys sleep.' How many scope errors?",
        choices: ["None.", "Five: removes lab condition, duration, self-report method, 'lower scores', and call for further research.", "Only slight exaggeration.", "The journalist adds useful context."],
        answer: "Five: removes lab condition, duration, self-report method, 'lower scores', and call for further research.",
        explanation: "Five violations: (1) 'controlled lab' removed (implies real-world certainty), (2) '30 minutes' removed (implies any exposure), (3) 'reported lower scores' becomes 'destroys' (massive escalation), (4) self-report methodology ignored, (5) tentative conclusion treated as settled science.",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPIC 12 — PASSIVE VOICE AND ATTRIBUTION
// ═══════════════════════════════════════════════════════════════
async function seedPassiveVoiceAttribution() {
  await upsertTopic(
    {
      slug: "passive-voice-and-attribution",
      title: "Passive Voice & Attribution",
      description: "How passive voice hides the actor — and why authors choose to obscure or reveal responsibility.",
      sortOrder: 15,
      section: "reading_patterns",
    },
    {
      title: "Passive Voice: Who Is Really Responsible?",
      content: `## Why This Matters For Reading

Passive voice is one of the most powerful tools in an author's rhetorical toolkit — and one of the most consistently misread structures by students. When a sentence is in passive voice, the actor disappears. "Mistakes were made." Who made them? The sentence doesn't say. That erasure is the point.

In political writing, academic writing, and editorials, passive voice is used strategically: to diffuse responsibility, to sound objective, or to avoid naming a specific actor. When you read passive voice as a reader, your job is to ask: *who is actually doing this?*

---

## Core Idea

**Active voice:** Subject → Action → Object. The actor is named and is doing the action.
"The government introduced the policy."

**Passive voice:** Object → Action (by Subject, optional). The actor may be omitted entirely.
"The policy was introduced." (by whom? unknown/omitted)

**The by-phrase:** In passive constructions, the actor can be named with "by" — "The policy was introduced *by the government*." This is full passive — responsible party named. But the actor is often omitted entirely.

---

## Reading Impact

1. **Responsibility diffusion:** "Errors were made during the implementation phase" — who made the errors? Passive voice obscures the actor, reducing accountability.

2. **False objectivity:** Academic and scientific writing uses passive voice to sound neutral — "It has been observed that..." — even though an observer exists. The passive voice removes the observer from view.

3. **Attribution tracking:** When an author writes "it is argued that" or "it has been claimed that", this is a passive construction that attributes the claim to an unnamed or generalised source. Ask: who is doing the arguing? Is it the author or someone else?

4. **Rhetorical choice:** Some authors use passive voice deliberately to highlight the action rather than the actor. "The constitution was drafted in three months" emphasises the document and the speed, not the drafters.

---

## Pattern Recognition

→ When you see passive voice, ask: **who is doing this?**
→ "It has been argued / observed / suggested / claimed" → this is attribution without a named actor. Ask: is this the author's view or someone else's?
→ Passive voice in political or policy writing often signals accountability evasion — the author or the quoted source is avoiding naming who is responsible.
→ Active vs passive can change who is foregrounded in an argument — 
---

## Common Reader Mistakes

**Mistake 1: Not noticing hidden agents.**
- "Mistakes were made" â€” by whom? Passive voice hides the agent.

**Mistake 2: Confusing author's view with reported view.**
- "Some scholars argue X" â€” attribution, not endorsement.

**Mistake 3: Treating passive constructions as objective.**
- "It has been suggested" sounds neutral but is strategically vague.

**Mistake 4: Missing attribution shifts.**
- Shift from "Smith argues X" to "X is well established" â€” from reporting to asserting.

**Mistake 5: Overlooking distancing language.**
- *So-called*, *alleged*, *purported* signal scepticism toward a term.

---

## Contextual Examples

1. *It has been argued that free markets are inherently self-correcting.*
â†’ Passive hides who argued this. Possible straw man setup.

2. *The policy was implemented without adequate consultation.*
â†’ *Was implemented* hides the agent. Who is responsible?

3. *According to the World Bank, poverty rates declined by 40%.*
â†’ Clear attribution. The author reports, not endorses.

4. *Critics suggested the methodology is flawed. The author defends it vigorously.*
â†’ Two competing attributions â€” reader must determine whose view the passage supports.

5. *The conventional wisdom holds that democracy promotes growth.*
â†’ Distancing device. The author may be about to challenge conventional wisdom.

6. *It is widely believed that social media erodes attention spans. The evidence, however, is more nuanced.*
â†’ *Widely believed* (passive consensus) â†’ *however* (author's own position).

7. *The report was praised by officials but criticised by independent analysts.*
â†’ Two attributions â€” let the reader weigh credibility.

8. *What was presented as reform was, in reality, a consolidation of power.*
â†’ *Was presented as* â‰  author's view. *In reality* = author's actual interpretation.

---

## Real RC Application

> *It is often claimed that globalisation has lifted billions out of poverty. This claim rests on a narrow definition â€” the World Bank's $1.90/day threshold. By broader measures accounting for housing and healthcare, the picture is less optimistic. The narrative of poverty reduction may say more about how we define poverty than about how much we have eliminated.*

Attribution analysis: "It is often claimed" (passive, distancing) â†’ "This claim, however" (challenge) â†’ "By broader measures" (alternative framework) â†’ "May say more about" (author's conclusion, qualified). The passage moves from reported consensus to sceptical reinterpretation.

---

## Key Takeaways

- Passive voice hides the agent â€” always ask "by whom?"
- Attribution language tells you whose view is being presented, not the author's own.
- The author's view often comes after attribution + contrast: "Critics say X. However, Y."
- Distancing language (*so-called*, *alleged*) signals scepticism.
- "It is widely believed" is typically a setup â€” the author will challenge it next.
- Shifts from attributed claims to unattributed assertions reveal when the author moves from reporting to arguing.
- In CAT RC, distinguishing the author's view from reported views is one of the most tested skills.

notice what the author is emphasising.`,
      examples: [
        "'Mistakes were made during the transition.' — Who made them? The passive erases the responsible party.",
        "'The policy was widely praised.' — By whom? 'Widely' suggests many, but no one is named.",
        "'It has been argued that the welfare state creates dependency.' — This is passive attribution. The author is presenting someone else's argument, not their own.",
        "'The treaty was signed, the borders were redrawn, and populations were displaced.' — All three verbs are passive. The actors (governments) are absent, foregrounding the events and their impact on people.",
        "'Active: The committee rejected the proposal. Passive: The proposal was rejected.' — The active version assigns clear responsibility; the passive version focuses on the outcome.",
      ],
    },
    [
      // EASY
      {
        difficulty: "easy",
        prompt: "The sentence 'Errors were made in the data collection process' uses passive voice. What effect does this have?",
        choices: [
          "It names the person who made the errors clearly.",
          "It omits who made the errors, diffusing accountability.",
          "It emphasises the importance of the errors.",
          "It suggests the errors were intentional."
        ],
        answer: "It omits who made the errors, diffusing accountability.",
        explanation: "Passive voice ('were made') removes the actor entirely. The reader has no information about who is responsible for the errors. In reporting and politics, this construction is commonly used to acknowledge a problem without assigning blame.",
      },
      {
        difficulty: "easy",
        prompt: "Which sentence assigns clearest responsibility?",
        choices: [
          "The policy was implemented without adequate consultation.",
          "The ministry implemented the policy without adequately consulting affected communities.",
          "Inadequate consultation was undertaken before the policy was implemented.",
          "Implementation proceeded without the required consultation process being followed."
        ],
        answer: "The ministry implemented the policy without adequately consulting affected communities.",
        explanation: "This is the only active-voice sentence: 'The ministry [actor] implemented [action] the policy [object]'. All other options use passive constructions that obscure or remove the actor. Active voice makes attribution clear and direct.",
      },
      {
        difficulty: "easy",
        prompt: "The author writes: 'It has been argued that social media is responsible for political polarisation.' Is this the author's view?",
        choices: [
          "Yes, the author is making this argument.",
          "Not necessarily — 'it has been argued that' attributes the view to unnamed others, not necessarily the author.",
          "Yes, because the author clearly states it is 'responsible'.",
          "No, because the author uses the word 'social media'."
        ],
        answer: "Not necessarily — 'it has been argued that' attributes the view to unnamed others, not necessarily the author.",
        explanation: "'It has been argued that' is a passive attribution construction. It reports what others have said. The author is presenting a claim, not endorsing it. The author's own view will be distinguished by direct assertion ('I argue', 'the evidence shows') or by what follows ('however', 'yet', 'but').",
      },
      // MEDIUM
      {
        difficulty: "medium",
        prompt: "Read: 'The environmental impact assessment was approved without the mandated public consultation period being observed.' What does the passive voice reveal about the sentence's rhetorical purpose?",
        choices: [
          "It emphasises the approval, making it clear who approved it.",
          "It foregrounds the procedural failure while obscuring who approved it and who failed to observe the consultation period.",
          "It suggests the consultation period was not important.",
          "It implies the public was responsible for the failure."
        ],
        answer: "It foregrounds the procedural failure while obscuring who approved it and who failed to observe the consultation period.",
        explanation: "Two passive constructions: 'was approved' (who approved?) and 'being observed' (who failed to observe?). Both actors are absent. The sentence highlights *what happened* (procedural failure) while erasing *who is responsible*. This is a classic accountability-diffusion construction.",
      },
      {
        difficulty: "medium",
        prompt: "Rewrite the passive construction to active: 'Significant tax concessions were granted to multinational corporations by the previous administration.' What does the active version clarify?",
        choices: [
          "Active: 'Multinational corporations received significant tax concessions.' — Who granted them is now unclear.",
          "Active: 'The previous administration granted significant tax concessions to multinational corporations.' — The responsible party is now the grammatical subject.",
          "Active: 'Significant tax concessions helped multinational corporations under the previous administration.' — The passive is unchanged.",
          "Active: 'Tax concessions were a significant part of the previous administration's policy.' — No change in attribution."
        ],
        answer: "Active: 'The previous administration granted significant tax concessions to multinational corporations.' — The responsible party is now the grammatical subject.",
        explanation: "Moving 'the previous administration' from the by-phrase to the grammatical subject position makes them the clear, foregrounded responsible party. In journalism and accountability writing, this active rewrite is more precise and harder to dismiss or misattribute.",
      },
      {
        difficulty: "medium",
        prompt: "The passage states: 'Several studies have suggested that screen time is linked to sleep disruption in adolescents.' A student concludes: 'The author claims that screen time causes sleep disruption.' What two errors has the student made?",
        choices: [
          "Changed 'several studies suggested' (attribution to research) to 'the author claims' (attribution to the author). Changed 'linked to' (correlation) to 'causes' (causation).",
          "Ignored the word 'adolescents' and misidentified the passive construction.",
          "Misidentified 'sleep disruption' as a positive outcome.",
          "Changed 'several' to 'some', altering the qualifier."
        ],
        answer: "Changed 'several studies suggested' (attribution to research) to 'the author claims' (attribution to the author). Changed 'linked to' (correlation) to 'causes' (causation).",
        explanation: "Error 1: 'Several studies have suggested' reports what research shows; the author is presenting evidence, not making a personal claim. Error 2: 'Linked to' signals correlation; 'causes' signals causation. Both changes misattribute the claim and overstate the certainty.",
      },
      // HARD
      {
        difficulty: "hard",
        prompt: "Analyse this sentence: 'It is widely acknowledged that the reforms of the 1990s, whatever their long-term benefits, imposed severe short-term costs on the most vulnerable sections of society.' Who holds this view, and what is its rhetorical effect?",
        choices: [
          "This is the author's direct argument — the author is criticising the reforms.",
          "'Widely acknowledged' is a passive attribution to a broad consensus, lending the critical claim authority without the author having to personally assert it.",
          "This is a counterargument the author will later refute.",
          "'Whatever their long-term benefits' signals the author endorses the reforms."
        ],
        answer: "'Widely acknowledged' is a passive attribution to a broad consensus, lending the critical claim authority without the author having to personally assert it.",
        explanation: "'It is widely acknowledged that' attributes the view to a consensus — unnamed, but implied to be large. The author benefits from this: the criticism (severe short-term costs) is presented as common knowledge, not the author's personal opinion. 'Whatever their long-term benefits' is a concessive phrase that grants something to the reforms while keeping the critical claim central. The author is leveraging attributed consensus to make a strong point.",
      },
      {
        difficulty: "hard",
        prompt: "A government report reads: 'Certain operational decisions were taken that, in retrospect, may not have fully aligned with best practice guidelines.' Rewrite this in active voice and explain what the rewrite reveals.",
        choices: [
          "Active: 'We made mistakes.' — Reveals the government is acknowledging total failure.",
          "Active: 'Senior officials took certain operational decisions that, in retrospect, may not have fully aligned with best practice guidelines.' — Reveals specific responsibility that the passive obscured.",
          "Active: 'Best practice guidelines were not followed by all officials.' — No significant change in attribution.",
          "Active: 'Certain decisions were made.' — Removes the passive construction while maintaining vagueness."
        ],
        answer: "Active: 'Senior officials took certain operational decisions that, in retrospect, may not have fully aligned with best practice guidelines.' — Reveals specific responsibility that the passive obscured.",
        explanation: "The original passive ('were taken') hides who made the decisions. The active version ('senior officials took') identifies the responsible party. Note also: 'may not have fully aligned' is a highly hedged construction — it uses 'may', 'not fully', and 'aligned with' (rather than 'violated'). Even in active voice, the report minimises the failure through qualifiers.",
      },
      {
        difficulty: "hard",
        prompt: "Read: 'The narrative that has been constructed around this event privileges certain voices while systematically marginalising others.' What is the author doing by using 'has been constructed' rather than 'someone constructed'?",
        choices: [
          "The author is being vague because they don't know who constructed the narrative.",
          "The author is deliberately emphasising the constructed, artificial nature of the narrative while avoiding naming the constructor — perhaps to implicate a broader system rather than individual actors.",
          "The author is using academic hedging to avoid controversy.",
          "The passive voice here suggests the narrative emerged naturally, without human intervention."
        ],
        answer: "The author is deliberately emphasising the constructed, artificial nature of the narrative while avoiding naming the constructor — perhaps to implicate a broader system rather than individual actors.",
        explanation: "'Has been constructed' draws attention to the act of construction — the narrative is not natural or inevitable, it was made. By omitting the constructor, the author implies the responsibility is diffuse — perhaps an entire institution, media ecosystem, or power structure rather than any one person. This is a sophisticated rhetorical use of passive voice: attributing systemic responsibility without naming individuals.",
      },
      {
        difficulty: "easy",
        prompt: "'The decision was taken to close the factory.' What information is missing?",
        choices: ["When it will close", "Why it's closing", "Who made the decision", "How many workers affected"],
        answer: "Who made the decision",
        explanation: "Passive voice ('was taken') hides the agent â€” who took the decision? The construction may be hiding accountability.",
      },
      {
        difficulty: "easy",
        prompt: "Which sentence uses active voice? (A) 'The report was published by the ministry.' (B) 'The ministry published the report.' (C) 'The report has been widely discussed.' (D) 'It was decided that reforms were necessary.'",
        choices: ["A", "B", "C", "D"],
        answer: "B",
        explanation: "'The ministry published the report' â€” subject performs the action on the object. All other options use passive constructions that obscure the agent.",
      },
      {
        difficulty: "medium",
        prompt: "'Leading economists have argued that austerity is counterproductive. The government maintains that spending cuts are essential.' Whose view does the author appear to favour?",
        choices: ["The economists' â€” described as 'leading'", "The government's â€” gets the last word", "Neither â€” presented neutrally", "Both"],
        answer: "The economists' â€” described as 'leading'",
        explanation: "'Leading' is evaluative â€” it signals expertise and authority. The government merely 'maintains' (neutral verb). The asymmetry in attribution suggests the author gives more weight to the economists.",
      },
      {
        difficulty: "medium",
        prompt: "An author writes: 'It is generally accepted that climate change poses risks.' Later: 'What is beyond dispute is that immediate action is necessary.' How does attribution shift?",
        choices: ["Specific to general", "Tentative consensus to absolute certainty", "Passive to active", "Author's view to experts' view"],
        answer: "Tentative consensus to absolute certainty",
        explanation: "'Generally accepted' is hedged (most but not all agree). 'Beyond dispute' is absolute (no qualifier). The author escalates from consensus to certainty â€” growing conviction across the passage.",
      },
      {
        difficulty: "hard",
        prompt: "'The reforms were described as necessary by officials. Independent analysts characterised them as regressive. The public was never consulted.' What does the combined use of passive voice and attribution reveal?",
        choices: ["The reforms were popular.", "The author is neutral.", "The author subtly criticises both the reforms and the process.", "The author supports the government."],
        answer: "The author subtly criticises both the reforms and the process.",
        explanation: "Three layers: (1) 'described as necessary by officials' â€” attributed, not endorsed. (2) 'characterised as regressive' by analysts â€” competing, more critical attribution. (3) 'was never consulted' â€” passive highlighting exclusion. Combined effect: euphemism, counterpoint, and disenfranchisement.",
      },
      {
        difficulty: "hard",
        prompt: "'Smith (2019) argues cultural factors drive innovation. Patel (2021) demonstrates institutional frameworks are the primary determinant. The weight of evidence now favours the institutional explanation.' How does the author signal their position?",
        choices: ["Agrees with Smith (mentioned first).", "Agrees with Patel â€” 'demonstrates' is stronger than 'argues', and the final sentence drops attribution to assert the institutional view as fact.", "Neutral â€” both presented equally.", "Disagrees with both."],
        answer: "Agrees with Patel â€” 'demonstrates' is stronger than 'argues', and the final sentence drops attribution to assert the institutional view as fact.",
        explanation: "Three signals: (1) 'argues' (Smith) vs 'demonstrates' (Patel) â€” different verb strength. (2) 'challenged' weakens Smith. (3) 'The weight of evidence now favours' â€” author drops attribution and asserts directly. The shift from attribution to assertion reveals the author's position.",
      },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
// RC SEED (existing)
// ═══════════════════════════════════════════════════════════════
async function seedRc() {
  const [passage] = await db
    .insert(rcPassages)
    .values({
      examType: "CUSTOM",
      title: "Reading Loyalty",
      year: 0,
      passage:
        "A good reader does not ask whether an option sounds impressive. She asks whether it remains loyal to the author's logic.",
      sourceLabel: "Internal sample",
      difficulty: "medium",
      estimatedMinutes: 8,
    })
    .onConflictDoUpdate({
      target: [rcPassages.examType, rcPassages.title, rcPassages.year],
      set: {
        passage:
          "A good reader does not ask whether an option sounds impressive. She asks whether it remains loyal to the author's logic.",
        sourceLabel: "Internal sample",
      },
    })
    .returning();

  const [question] = await db
    .insert(rcQuestions)
    .values({
      passageId: passage.id,
      tag: "inference",
      prompt: "Which option best captures the author's advice?",
      correctOptionKey: "B",
      explanation:
        "The correct option preserves the author's emphasis on loyalty to logic rather than impressive wording.",
      toneClues: ["loyal to the author's logic"],
      trapWords: ["always", "only"],
      inferenceLogic:
        "The answer must retain the author's caution about subtle distortion.",
      sortOrder: 1,
    })
    .onConflictDoUpdate({
      target: [rcQuestions.passageId, rcQuestions.prompt],
      set: { correctOptionKey: "B", explanation: "The correct option preserves the author's emphasis on loyalty to logic rather than impressive wording." },
    })
    .returning();

  await db
    .insert(rcOptions)
    .values([
      {
        questionId: question.id,
        optionKey: "A",
        text: "CAT rewards the reader who memorizes many explanations.",
        explanation: "This reverses the passage and shifts from reading logic to memorization.",
        isCorrect: false,
      },
      {
        questionId: question.id,
        optionKey: "B",
        text: "A strong reader tracks logic while reading.",
        explanation: "This captures the central idea without overstating the claim.",
        isCorrect: true,
      },
    ])
    .onConflictDoNothing({ target: [rcOptions.questionId, rcOptions.optionKey] });
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log("ðŸŒ± Seeding article sources...");
  await seedArticleSources();
  
  console.log("âœ… Seeding checklist templates...");
  await seedChecklist();
  
  console.log("ðŸ“š Seeding Grammar Foundations...");
  console.log("  → Articles");
  await seedArticles();
  console.log("  → Subject-Verb Agreement");
  await seedSubjectVerbAgreement();
  console.log("  → Pronouns & Pronoun Reference");
  await seedPronouns();
  console.log("  → Modifiers");
  await seedModifiers();
  console.log("  → Parallelism");
  await seedParallelism();
  console.log("  → Tense Consistency");
  await seedTenseConsistency();
  
  console.log("ðŸ“– Seeding Reading Flow / Patterns...");
  console.log("  → Connector Words & Transitions");
  await seedConnectorWords();
  console.log("  → Tone & Register Shifts");
  await seedToneAndRegister();
  console.log("  → Qualifier Words");
  await seedQualifierWords();
  console.log("  → Argument Structure");
  await seedArgumentStructure();
  console.log("  → Scope & Specificity");
  await seedScopeAndSpecificity();
  console.log("  → Passive Voice & Attribution");
  await seedPassiveVoiceAttribution();
  
  console.log("ðŸŽ“ Seeding RC sample...");
  await seedRc();
  
  console.log("âœ… All seeds complete!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
