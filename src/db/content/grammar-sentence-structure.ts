export const sentenceStructureTopic = {
  slug: "sentence-structure",
  title: "Deconstructing Sentence Structure",
  description: "Learn to strip away the fluff and find the architectural core of complex, academic sentences.",
  sortOrder: 2,
};

export const sentenceStructureLesson = {
  title: "Finding the Skeleton",
  content: `### Intuition & Examples

Imagine looking at a massive, ornate cathedral. There are gargoyles, stained glass windows, and intricate carvings everywhere. But underneath all that decoration, there are steel beams holding the roof up. If you take away the beams, the cathedral collapses. If you take away the gargoyles, it's still a building.

Sentences work the exact same way.

*Example:* 
"The swift, brown fox, who was fleeing from the hunters through the dense, snow-covered forest, jumped elegantly over the lazy dog."

If you strip away the "gargoyles" (the modifiers and extra clauses), you are left with the steel beams:
**"The fox jumped over the dog."**

### The Concept: Core vs. Fluff

In CAT reading passages, authors deliberately bury simple ideas under mountains of complex vocabulary and structural fluff. If you try to memorize every word as you read, your working memory will crash. You must learn to read for the **Skeleton** (the Main Subject and Main Verb).

1. **The Main Subject (The "Who/What")**
   - The primary entity driving the sentence. 

2. **The Main Verb (The "Did What")**
   - The primary action of the main subject.

3. **The Fluff (Clauses and Phrases)**
   - **Relative Clauses:** Phrases starting with *who, which, that*. They are just long adjectives. (e.g., "The theory, *which was widely discredited in the 90s*, returned...")
   - **Prepositional Phrases:** (e.g., "*In the middle of the night*, he woke up.")
   - **Appositives:** A noun phrase renaming another noun right next to it. (e.g., "My friend, *a talented artist*, painted this.")

### The Strategy: Bracketing
When you encounter a 5-line sentence that makes no sense, mentally put brackets around the fluff and cross it out. 

*Passage Sentence:* "Cognitive dissonance, a psychological phenomenon first theorized by Leon Festinger in the 1950s, dictates that humans, when confronted with evidence contradicting their deeply held beliefs, will often double down on those beliefs rather than admit error."

*Mentally Bracketed:* "Cognitive dissonance [, a psychological phenomenon first theorized by Leon Festinger in the 1950s,] dictates that humans [, when confronted with evidence contradicting their deeply held beliefs,] will often double down on those beliefs [rather than admit error]."

*The Skeleton:* **"Cognitive dissonance dictates that humans will double down on beliefs."**

### Reflection
A 50-word sentence is almost always a 10-word sentence wearing a heavy coat. Take the coat off.`,
  examples: [
    "Original: The committee, after hours of grueling debate over the budget, finally reached a decision.",
    "Skeleton: The committee reached a decision."
  ]
};

export const sentenceStructureExercises = [
  // EASY QUESTIONS
  {
    difficulty: "easy" as const,
    prompt: "Identify the 'skeleton' (Core Subject + Core Verb) of the following sentence: 'The heavy, dark clouds gathered ominously over the mountains.'",
    choices: [
      "Heavy clouds gathered",
      "Clouds gathered",
      "Clouds over mountains",
      "Dark clouds gathered ominously"
    ],
    answer: "Clouds gathered",
    explanation: "Correct. 'Clouds' is the main subject. 'Gathered' is the main verb. Everything else (heavy, dark, ominously, over the mountains) is descriptive fluff."
  },
  {
    difficulty: "easy" as const,
    prompt: "Read: 'The young athlete, despite a lingering knee injury, broke the world record.' What is the phrase 'despite a lingering knee injury' functioning as?",
    choices: [
      "The main subject",
      "The main verb",
      "A prepositional phrase adding context (Fluff)",
      "An independent clause"
    ],
    answer: "A prepositional phrase adding context (Fluff)",
    explanation: "Correct. It is extra information interrupting the core sentence ('The athlete broke the record'). You can remove it and the sentence still functions."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the skeleton: 'The novel, written by an unknown author in the 19th century, became a massive bestseller overnight.'",
    choices: [
      "The novel became",
      "Unknown author wrote",
      "Novel became a bestseller",
      "Written in the 19th century"
    ],
    answer: "The novel became",
    explanation: "Correct. 'Novel' is the subject. 'Became' is the main verb. The comma-separated phrase 'written by...' is an appositive modifier. 'A bestseller' is the object, but 'The novel became' is the core engine."
  },
  {
    difficulty: "easy" as const,
    prompt: "What is the danger of reading every word of a complex sentence with equal weight?",
    choices: [
      "You will read too quickly.",
      "Your working memory will get overwhelmed by minor details, causing you to miss the main idea.",
      "You will improve your vocabulary.",
      "It is actually the best way to read."
    ],
    answer: "Your working memory will get overwhelmed by minor details, causing you to miss the main idea.",
    explanation: "Correct. Human working memory can only hold so much. If you try to memorize the 'gargoyles', you won't see the 'steel beams'."
  },
  {
    difficulty: "easy" as const,
    prompt: "Which of the following phrases is a relative clause (a type of fluff)?",
    choices: [
      "The dog barked loudly.",
      ", which was entirely unexpected,",
      "Under the table",
      "She went to the store."
    ],
    answer: ", which was entirely unexpected,",
    explanation: "Correct. Clauses starting with 'who', 'which', or 'that' are relative clauses. They attach to a noun to give more information about it, acting as a long adjective."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the skeleton: 'In the middle of a chaotic election year, the incumbent senator miraculously passed the controversial bill.'",
    choices: [
      "Middle of chaotic year",
      "Senator passed",
      "Senator miraculously passed",
      "Election passed bill"
    ],
    answer: "Senator passed",
    explanation: "Correct. 'In the middle of...' is a prepositional phrase setting the scene. The core action is the 'Senator' (subject) who 'passed' (verb) something."
  },
  {
    difficulty: "easy" as const,
    prompt: "Read: 'Photosynthesis, the process by which plants make food, requires sunlight.' What is the grammatical term for the phrase enclosed in commas?",
    choices: ["Main Verb", "Appositive", "Dependent Clause", "Preposition"],
    answer: "Appositive",
    explanation: "Correct. An appositive is a noun or noun phrase placed next to another noun to rename or describe it. It is structurally 'fluff'."
  },
  {
    difficulty: "easy" as const,
    prompt: "True or False: If you cross out all the fluff in a sentence, the remaining sentence should still be grammatically correct and make logical sense.",
    choices: ["True", "False"],
    answer: "True",
    explanation: "Correct. The skeleton is the grammatical foundation. If removing the fluff breaks the grammar, you accidentally removed part of the skeleton."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the core subject: 'To understand the origins of the universe requires advanced mathematics.'",
    choices: [
      "Universe",
      "Origins",
      "Mathematics",
      "To understand the origins of the universe"
    ],
    answer: "To understand the origins of the universe",
    explanation: "Correct. The entire infinitive phrase acts as the subject here. 'What requires math? To understand the origins.' Therefore, the phrase is the subject."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the main verb: 'The scientist who discovered the cure won the Nobel Prize.'",
    choices: ["Discovered", "Cure", "Won", "Prize"],
    answer: "Won",
    explanation: "Correct. 'Discovered' is a verb, but it belongs to the relative clause ('who discovered the cure'). The main action of the main subject ('The scientist') is 'won'."
  },

  // MEDIUM QUESTIONS
  {
    difficulty: "medium" as const,
    prompt: "Read: 'The profound realization that economic growth does not automatically translate into societal well-being has shifted the focus of modern policy-makers.' What is the core skeleton?",
    choices: [
      "Economic growth does not translate",
      "Realization has shifted focus",
      "Policy-makers shifted focus",
      "Well-being has shifted policy-makers"
    ],
    answer: "Realization has shifted focus",
    explanation: "Correct. 'The profound realization' is the subject. 'that economic growth... well-being' is a massive clause describing the realization. The main action that the realization takes is that it 'has shifted' the focus."
  },
  {
    difficulty: "medium" as const,
    prompt: "Why do authors frequently place long clauses between the Subject and the Verb?",
    choices: [
      "To make the sentence grammatically incorrect.",
      "To deliberately slow down the reader and test their ability to hold the subject in their working memory.",
      "Because it is the only way to write in English.",
      "To make the text easier for beginners."
    ],
    answer: "To deliberately slow down the reader and test their ability to hold the subject in their working memory.",
    explanation: "Correct. This is a classic hallmark of academic writing. By separating the subject and verb, the author forces you to remember 'who' is acting while they bombard you with 'fluff' details."
  },
  {
    difficulty: "medium" as const,
    prompt: "Strip this sentence: 'Although often overshadowed by his more flamboyant contemporaries, the quiet inventor from Ohio was responsible for the patents that made early flight possible.' What is the skeleton of the main clause?",
    choices: [
      "Although overshadowed",
      "Inventor was responsible",
      "Patents made flight possible",
      "Contemporaries overshadowed inventor"
    ],
    answer: "Inventor was responsible",
    explanation: "Correct. 'Although...' is a dependent clause setting context. The main independent clause starts with 'the quiet inventor'. Subject: Inventor. Verb: was."
  },
  {
    difficulty: "medium" as const,
    prompt: "Identify the skeleton: 'The rapid proliferation of misinformation across largely unregulated social media networks threatens the foundational stability of democratic institutions.'",
    choices: [
      "Misinformation threatens stability",
      "Networks threatens institutions",
      "Proliferation threatens stability",
      "Democracy threatens networks"
    ],
    answer: "Proliferation threatens stability",
    explanation: "Correct. 'Proliferation' (growth/spread) is the core subject. 'of misinformation...' is a prepositional phrase modifying it. 'Threatens' is the verb. 'Stability' is the object."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read: 'Only after the devastating earthquake, which leveled three major cities and caused billions in damage, did the government upgrade building codes.' What is the main subject?",
    choices: ["Earthquake", "Cities", "Damage", "Government"],
    answer: "Government",
    explanation: "Correct. The entire first half of the sentence ('Only after... damage') is a massive prepositional and relative clause indicating *when* the action happened. The core action is 'the government upgraded'."
  },
  {
    difficulty: "medium" as const,
    prompt: "What is the structural difference between these two sentences? (A) 'The committee delayed the vote because they lacked information.' (B) 'Lacking information, the committee delayed the vote.'",
    choices: [
      "Sentence A has a different skeleton than Sentence B.",
      "Sentence B is passive.",
      "They have the exact same skeleton, but the modifier is placed differently.",
      "Sentence A is grammatically incorrect."
    ],
    answer: "They have the exact same skeleton, but the modifier is placed differently.",
    explanation: "Correct. In both, the skeleton is 'Committee delayed'. In A, the reason is a dependent clause at the end. In B, the reason is a participial phrase at the beginning."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read: 'Determining the exact age of the artifact, given the contamination of the soil samples, proved virtually impossible for the archeology team.' What is the main verb?",
    choices: ["Determining", "Given", "Proved", "Contamination"],
    answer: "Proved",
    explanation: "Correct. The subject is the gerund phrase 'Determining the exact age...'. The phrase 'given the contamination...' is a parenthetical modifier. The action the subject takes is 'proved'."
  },
  {
    difficulty: "medium" as const,
    prompt: "Identify the skeleton: 'That the universe is expanding at an accelerating rate was a discovery that shocked the scientific community.'",
    choices: [
      "Universe is expanding",
      "That the universe... rate was a discovery",
      "Discovery shocked community",
      "Rate was expanding"
    ],
    answer: "That the universe... rate was a discovery",
    explanation: "Correct. The entire noun clause 'That the universe is expanding at an accelerating rate' is the Subject. The verb is 'was'. The object is 'discovery'."
  },
  {
    difficulty: "medium" as const,
    prompt: "When bracketing fluff, what should you do with a phrase enclosed in em-dashes (like —this phrase here—)?",
    choices: [
      "Assume it contains the main subject.",
      "Treat it as the skeleton.",
      "Mentally bracket it and skip it on the first read to find the core sentence.",
      "Stop reading and analyze it deeply."
    ],
    answer: "Mentally bracket it and skip it on the first read to find the core sentence.",
    explanation: "Correct. Em-dashes almost always enclose parenthetical fluff. Skipping it helps you connect the main subject before the dashes to the main verb after the dashes."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read: 'The tendency of human beings to mistakenly attribute success to inherent skill rather than luck is known as the self-serving bias.' What is the core subject?",
    choices: ["Human beings", "Success", "Skill", "Tendency"],
    answer: "Tendency",
    explanation: "Correct. 'Tendency' is the subject. Everything from 'of human beings...' to '...luck' is a giant prepositional/infinitive phrase modifying what *kind* of tendency it is."
  },

  // HARD QUESTIONS
  {
    difficulty: "hard" as const,
    prompt: "Read the excerpt: 'The paradoxical nature of the placebo effect—wherein the sheer belief in a treatment’s efficacy triggers genuine physiological healing—challenges the rigid, materialistic paradigm that has dominated Western medicine since the Enlightenment.'\n\nWhat is the exact skeleton of this complex sentence?",
    choices: [
      "Placebo effect triggers healing",
      "Belief challenges paradigm",
      "Nature challenges paradigm",
      "Medicine dominated Enlightenment"
    ],
    answer: "Nature challenges paradigm",
    explanation: "Correct. Subject: 'Nature' (specifically, the paradoxical nature). Fluff 1: 'of the placebo effect'. Fluff 2 (em-dashes): 'wherein... healing'. Verb: 'challenges'. Object: 'paradigm'. Fluff 3: 'that has dominated...'. Therefore, 'Nature challenges paradigm' is the core structural beam."
  },
  {
    difficulty: "hard" as const,
    prompt: "Consider the sentence: 'Embedded deep within the genetic code of the virus lies the key to its rapid mutation rate.' What is the grammatical subject of this sentence?",
    choices: [
      "Genetic code",
      "Virus",
      "The key",
      "Rapid mutation rate"
    ],
    answer: "The key",
    explanation: "Correct. This is an inverted sentence structure. Normal order: 'The key to its rapid mutation rate lies embedded deep within the genetic code.' The author inverted it for stylistic emphasis, putting the prepositional phrase first. The thing that 'lies' (the verb) is 'the key'."
  },
  {
    difficulty: "hard" as const,
    prompt: "Read: 'For the Federal Reserve to aggressively raise interest rates while inflation is already cooling would risk engineering an entirely avoidable recession.'\nWhat is the main verb of this sentence?",
    choices: ["Raise", "Cooling", "Would risk", "Engineering"],
    answer: "Would risk",
    explanation: "Correct. The subject is the entire infinitive phrase 'For the Federal Reserve to aggressively raise interest rates while inflation is already cooling'. What would that entire action do? It 'would risk'. 'Raise', 'cooling', and 'engineering' are verbs inside the dependent clauses or acting as gerunds."
  },
  {
    difficulty: "hard" as const,
    prompt: "An author writes: 'The philosopher's central thesis, derived from a highly selective reading of Kant, posits that morality is subjective.' \nIf the phrase 'derived from a highly selective reading of Kant' is the fluff, what purpose does it serve?",
    choices: [
      "It provides objective evidence to support the thesis.",
      "It subtly undermines the philosopher's thesis by suggesting his research is biased.",
      "It is purely decorative and provides no meaning.",
      "It proves that Kant believed morality is subjective."
    ],
    answer: "It subtly undermines the philosopher's thesis by suggesting his research is biased.",
    explanation: "Correct. While it is structurally 'fluff' (it is an appositive modifier that can be removed), its *functional* purpose is to inject the author's critical tone ('highly selective') and cast doubt on the philosopher's credibility before even stating the thesis."
  },
  {
    difficulty: "hard" as const,
    prompt: "Read: 'Rarely have historical transitions from autocracy to democracy occurred without significant, often violent, economic upheaval.'\nTranslate this inverted rhetorical structure into a standard, direct skeleton.",
    choices: [
      "Transitions have rarely occurred.",
      "Autocracy occurred to democracy.",
      "Economic upheaval occurred.",
      "History has transitions."
    ],
    answer: "Transitions have rarely occurred.",
    explanation: "Correct. The sentence starts with the adverb 'Rarely', which forces an inversion of the subject and auxiliary verb ('have historical transitions...'). Standard order: 'Historical transitions have rarely occurred...' Thus, the skeleton is 'Transitions have occurred' (with the modifier 'rarely' applying)."
  }
];
