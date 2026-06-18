export const signalWordsTopic = {
  slug: "signal-words",
  title: "Signal Words & Transitions",
  description: "Learn how authors steer their arguments using words of addition, contrast, cause/effect, and conclusion.",
  sortOrder: 10,
};

export const signalWordsLesson = {
  title: "The Steering Wheel of a Paragraph",
  content: `### Intuition & Examples

Imagine a friend tells you: *"The new restaurant downtown has an incredibly talented chef. The ingredients are sourced locally and the presentation is beautiful. **However...**"*

Even before you hear the next word, your brain braces for bad news. The food is too expensive? The service is terrible? The word "**However**" completely overrides the positive setup. It is the steering wheel of the sentence.

### The Concept

Good readers don't just read words; they read *directions*. Authors use signal words to guide you through their logic. If you miss the signal word, you miss the author's intent, no matter how well you understand the vocabulary.

### The Categories of Signals

1. **Addition & Agreement** (*Furthermore, Moreover, Similarly*)
   - *What it means:* "I am continuing in the same direction. The next point supports my previous point."
   - *Example:* "The policy failed to reduce poverty. **Moreover**, it alienated the middle class." (Bad gets worse).

2. **Contrast & Shift** (*However, Conversely, Nevertheless, Yet*)
   - *What it means:* "I am hitting the brakes and changing direction. Pay attention, this is often the most important part of my argument."
   - *Example:* "Many economists predicted a recession. **Yet**, consumer spending reached an all-time high." (The expectation was broken).

3. **Cause & Effect** (*Consequently, Therefore, Thus, As a result*)
   - *What it means:* "Because of X, Y happened." This is crucial for tracing logic and finding the author's main conclusion.
   - *Example:* "The infrastructure was built on unstable soil; **consequently**, the foundation cracked within a year."

4. **Examples & Illustration** (*For instance, Namely, To illustrate*)
   - *What it means:* "I am about to prove the broad claim I just made."
   - *Reading Strategy:* If you understood the broad claim, you can read the example quickly. If you didn't understand the claim, the example will clarify it.

5. **Conclusion & Synthesis** (*Ultimately, In essence, Ultimately*)
   - *What it means:* "This is the big takeaway." 
   - *Reading Strategy:* Pay extreme attention. This is often the answer to 'Main Idea' questions.

### Reflection
Next time you read an article, try highlighting only the signal words. You'll find you can often guess what the paragraph is about without even reading the nouns and verbs.`,
  examples: [
    "The algorithm is highly efficient. Furthermore, it is open-source. (Continuing positive)",
    "The algorithm is highly efficient. However, it requires massive computing power. (Shifting to negative)"
  ]
};

export const signalWordsExercises = [
  // EASY QUESTIONS (Single concept, obvious application)
  {
    difficulty: "easy" as const,
    prompt: "Read the sentence: 'The team lacked a star player; _________, they managed to win the championship through superior coordination.' Which signal word best completes the logic?",
    choices: ["Furthermore", "Therefore", "Nevertheless", "For example"],
    answer: "Nevertheless",
    explanation: "Correct: 'Nevertheless'. The first clause sets up a negative situation (lacking a star player), which normally leads to a negative result. The second clause is a positive result (winning). We need a Contrast word to shift directions. 'Furthermore' adds to the negative. 'Therefore' implies cause/effect. 'For example' provides an instance."
  },
  {
    difficulty: "easy" as const,
    prompt: "Read the following: 'Artificial intelligence models require vast amounts of electricity. _________, data centers are increasingly being built near renewable energy sources.'",
    choices: ["Consequently", "Conversely", "Similarly", "However"],
    answer: "Consequently",
    explanation: "Correct: 'Consequently'. The first sentence provides a cause (requiring electricity). The second sentence provides the effect (building near power sources). 'Conversely' and 'However' show contrast, and 'Similarly' shows comparison, none of which fit the cause-effect logic here."
  },
  {
    difficulty: "easy" as const,
    prompt: "Which of the following signal words would an author use to introduce a specific real-world case that proves their previous theoretical claim?",
    choices: ["To illustrate", "Consequently", "Moreover", "Nevertheless"],
    answer: "To illustrate",
    explanation: "Correct: 'To illustrate'. This phrase signals an impending example. 'Consequently' shows effect, 'Moreover' shows addition, and 'Nevertheless' shows contrast."
  },
  {
    difficulty: "easy" as const,
    prompt: "'Historical narratives are often written by the victors. ________, we must analyze primary sources with a healthy degree of skepticism.'",
    choices: ["Therefore", "Yet", "In addition", "For instance"],
    answer: "Therefore",
    explanation: "Correct: 'Therefore'. The first sentence is a premise (victors write history). The second is a logical conclusion derived from that premise (we must be skeptical). This is a Cause/Effect relationship."
  },
  {
    difficulty: "easy" as const,
    prompt: "'The chemical compound is highly volatile at room temperature. _________, it must be stored in specialized cooling units.'",
    choices: ["Thus", "However", "Similarly", "In contrast"],
    answer: "Thus",
    explanation: "Correct: 'Thus'. The volatility is the cause; the cooling units are the effect. 'Thus' perfectly bridges this logic."
  },
  {
    difficulty: "easy" as const,
    prompt: "'Many critics panned the movie for its pacing. _________, audiences flocked to the theaters, breaking box office records.'",
    choices: ["Yet", "Furthermore", "Therefore", "As a result"],
    answer: "Yet",
    explanation: "Correct: 'Yet'. The critics panning the movie sets an expectation of failure. The box office records break that expectation. We need a strong contrast word."
  },
  {
    difficulty: "easy" as const,
    prompt: "'The CEO implemented a strict four-day workweek. _________, employee retention increased by 40% over the following year.'",
    choices: ["As a result", "On the other hand", "For example", "Instead"],
    answer: "As a result",
    explanation: "Correct: 'As a result'. This is a direct cause and effect. The policy was implemented, and the effect was higher retention."
  },
  {
    difficulty: "easy" as const,
    prompt: "An author writes: 'The diet was initially successful in reducing weight. ________, long-term studies showed severe metabolic damage.' Which word best fits?",
    choices: ["However", "Consequently", "Moreover", "Thus"],
    answer: "However",
    explanation: "Correct: 'However'. The initial success is positive. The long-term damage is negative. A contrast word is required."
  },
  {
    difficulty: "easy" as const,
    prompt: "'Urban planning in the 20th century prioritized the automobile. _________, cities like Los Angeles feature massive highway systems rather than robust public transit.'",
    choices: ["For instance", "Nevertheless", "Conversely", "In spite of this"],
    answer: "For instance",
    explanation: "Correct: 'For instance'. The first sentence makes a broad claim about 20th-century urban planning. The second sentence provides a specific example (Los Angeles) that proves it."
  },
  {
    difficulty: "easy" as const,
    prompt: "What is the primary function of the word 'Moreover' in a paragraph?",
    choices: ["To add another supporting point in the same direction.", "To contradict the previous sentence.", "To summarize the main idea.", "To introduce an exception to the rule."],
    answer: "To add another supporting point in the same direction.",
    explanation: "Correct: 'Moreover' is an Addition signal. It tells the reader that the author is continuing to build on their current argument, not shifting or concluding it."
  },

  // MEDIUM QUESTIONS (Multiple concepts, minor traps)
  {
    difficulty: "medium" as const,
    prompt: "'While early theories of human migration suggested a single massive wave out of Africa, recent genetic evidence indicates multiple, smaller dispersals over tens of thousands of years. ________, the timeline of human settlement in Eurasia must be entirely reevaluated.'",
    choices: ["Consequently", "Nevertheless", "Similarly", "For instance"],
    answer: "Consequently",
    explanation: "Correct: 'Consequently'. The 'While' sets up a contrast between old theories and new evidence within the first sentence. The second sentence is the logical *result* of the new evidence. Trap: Students might see the contrast in the first sentence and choose 'Nevertheless', but the blank connects the *new evidence* to its *impact* (reevaluating the timeline)."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read the excerpt: 'The government subsidized the agricultural sector to lower the cost of food for urban populations. The policy, ________, led to massive overproduction and ecological degradation, ultimately harming the rural economy it ostensibly supported.'",
    choices: ["however", "therefore", "in addition", "subsequently"],
    answer: "however",
    explanation: "Correct: 'however'. The first sentence outlines a well-intentioned goal (lower food costs). The second sentence describes a disastrous reality (overproduction, ecological damage). The contrast between intent and reality requires 'however'. 'Therefore' is a trap; while the policy *caused* the damage, the rhetorical structure emphasizes the *irony/contrast* between the goal and the outcome."
  },
  {
    difficulty: "medium" as const,
    prompt: "Which pair of signal words would best map the following argument structure: [Broad Claim] -> [Specific Proof] -> [Final Takeaway]?",
    choices: ["For instance / Ultimately", "Furthermore / However", "Conversely / Therefore", "Namely / Moreover"],
    answer: "For instance / Ultimately",
    explanation: "Correct: 'For instance' bridges a broad claim to a specific proof. 'Ultimately' bridges the proof to a final takeaway/conclusion. The other pairs do not follow the Example -> Synthesis logic."
  },
  {
    difficulty: "medium" as const,
    prompt: "'Some philosophers argue that morality is entirely subjective, a product of cultural conditioning. ________, evolutionary biologists point to universal moral impulses—like empathy and fairness—found even in pre-verbal infants, suggesting a biological baseline.'",
    choices: ["Conversely", "Moreover", "Consequently", "Thus"],
    answer: "Conversely",
    explanation: "Correct: 'Conversely'. The first sentence presents a theory (morality is subjective/cultural). The second sentence presents a diametrically opposed theory (morality is biological/universal). 'Conversely' perfectly highlights this oppositional shift."
  },
  {
    difficulty: "medium" as const,
    prompt: "'The startup's initial product launch was plagued by software bugs and terrible press. _________, the core underlying technology was so revolutionary that enterprise clients bought it anyway.'",
    choices: ["Nevertheless", "As a result", "Furthermore", "To illustrate"],
    answer: "Nevertheless",
    explanation: "Correct: 'Nevertheless'. The bugs and bad press should logically lead to failure. The fact that clients bought it anyway is a surprising shift. 'Nevertheless' means 'in spite of what was just said'."
  },
  {
    difficulty: "medium" as const,
    prompt: "'Classical economics assumes that human beings act as perfectly rational agents seeking to maximize utility. Behavioral economics, _________, demonstrates that humans are reliably irrational, heavily influenced by cognitive biases and emotional states.'",
    choices: ["by contrast", "in essence", "therefore", "similarly"],
    answer: "by contrast",
    explanation: "Correct: 'by contrast'. The passage sets up two opposing schools of thought: Classical (rational) vs. Behavioral (irrational). 'By contrast' clearly defines the relationship."
  },
  {
    difficulty: "medium" as const,
    prompt: "'The author spends three paragraphs describing the intricate beauty of the coral reef ecosystem. _________, she abruptly shifts to detailing the devastating effects of ocean acidification, leaving the reader with a sense of profound loss.'",
    choices: ["Then", "Therefore", "Moreover", "For example"],
    answer: "Then",
    explanation: "Correct: 'Then'. The blank requires a temporal or sequential shift, noting the change in the author's focus. 'Therefore' implies the beauty caused the acidification. 'Moreover' would mean she continued talking about beauty."
  },
  {
    difficulty: "medium" as const,
    prompt: "If an author uses the word 'Indeed' at the beginning of a sentence, what are they most likely doing?",
    choices: ["Emphasizing and strengthening the previous point.", "Introducing a counterargument.", "Concluding the essay.", "Providing a completely new, unrelated idea."],
    answer: "Emphasizing and strengthening the previous point.",
    explanation: "Correct: 'Indeed' is an intensifier. It tells the reader 'Not only is the previous statement true, but I am going to double down on it to prove how true it is.'"
  },
  {
    difficulty: "medium" as const,
    prompt: "'The treaty was designed to establish long-lasting peace in the region. ________, it ignored the deep-seated ethnic tensions that had caused the war in the first place, guaranteeing future conflict.'",
    choices: ["Yet", "Hence", "In addition", "Thus"],
    answer: "Yet",
    explanation: "Correct: 'Yet'. There is a sharp contrast between the *design* of the treaty (peace) and its *flaw* (ignoring tensions). 'Hence' and 'Thus' imply a logical progression, which is incorrect here."
  },
  {
    difficulty: "medium" as const,
    prompt: "'Many assume that introverts make poor leaders because they are less gregarious. ________, studies show that introverted leaders are often more effective because they listen closely and allow proactive employees to thrive.'",
    choices: ["In reality", "Consequently", "Similarly", "Furthermore"],
    answer: "In reality",
    explanation: "Correct: 'In reality'. The first sentence is a common assumption (myth). The second sentence is the empirical truth that contradicts the myth. 'In reality' effectively signals the shift from myth to fact."
  },

  // HARD QUESTIONS (Require reasoning, interpretation, attention to detail)
  {
    difficulty: "hard" as const,
    prompt: "Read carefully: 'The historian's analysis of the French Revolution is meticulously researched, drawing on thousands of previously unexamined parish records. _________, her narrative is so dense and academic that it remains completely inaccessible to the general public, sharply limiting its impact.'\n\nIf the blank were filled with 'Moreover', how would the meaning of the entire passage change compared to filling it with 'However'?",
    choices: [
      "With 'Moreover', the author is adding another criticism; with 'However', the author is contrasting praise with a criticism.",
      "With 'Moreover', the passage becomes a glowing review; with 'However', it becomes entirely negative.",
      "With 'Moreover', the second sentence acts as an example of the first sentence.",
      "The meaning would not significantly change, as both words connect related ideas."
    ],
    answer: "With 'Moreover', the author is adding another criticism; with 'However', the author is contrasting praise with a criticism.",
    explanation: "Correct. The first sentence is positive ('meticulously researched'). The second sentence is negative ('inaccessible'). If we use 'However', we acknowledge the shift from praise to criticism. If an author incorrectly used 'Moreover' here, it would imply the first sentence was *also* a criticism (e.g., 'Her research is overly pedantic. Moreover, her narrative is dense'). Since the first sentence is actually praise, 'Moreover' breaks the logic."
  },
  {
    difficulty: "hard" as const,
    prompt: "Consider the following argument structure: \n[Sentence 1: Broad observation about modern art.]\n[Sentence 2: Specific critique of a famous modern painting.]\n[Sentence 3: The reason why this painting failed to evoke emotion.]\n\nWhich sequence of implicit signal words best maps the transitions between these sentences?",
    choices: [
      "[For instance] -> [Because]",
      "[Furthermore] -> [However]",
      "[Nevertheless] -> [Thus]",
      "[Conversely] -> [Moreover]"
    ],
    answer: "[For instance] -> [Because]",
    explanation: "Correct. Moving from a 'broad observation' to a 'specific critique' requires an exemplification signal (like 'For instance'). Moving from the critique to the 'reason why' requires a causal signal (like 'Because')."
  },
  {
    difficulty: "hard" as const,
    prompt: "'The company's pivot to a subscription model initially enraged its user base, leading to a 20% drop in active accounts. ________, the steady, predictable revenue allowed the company to weather the subsequent economic downturn far better than its ad-reliant competitors.'",
    choices: ["Ultimately", "Furthermore", "As a result", "To illustrate"],
    answer: "Ultimately",
    explanation: "Correct: 'Ultimately'. The first sentence is an immediate, short-term negative effect. The second sentence is a long-term, synthesis positive effect. 'Ultimately' correctly signals a shift to the final, overriding conclusion of the situation. 'As a result' is a trap; the predictable revenue wasn't a result of the *drop* in accounts, it was the result of the *pivot*."
  },
  {
    difficulty: "hard" as const,
    prompt: "An author writes: 'While quantum mechanics provides incredibly accurate predictions for subatomic particles, it completely breaks down when applied to the macroscopic scales governed by general relativity.'\n\nIf the author follows this sentence with 'Therefore...', what is the most logical next statement?",
    choices: [
      "Therefore, a unifying theory of quantum gravity is required to reconcile the two frameworks.",
      "Therefore, general relativity is fundamentally flawed and must be discarded.",
      "Therefore, subatomic particles do not actually exist.",
      "Therefore, quantum mechanics is highly accurate."
    ],
    answer: "Therefore, a unifying theory of quantum gravity is required to reconcile the two frameworks.",
    explanation: "Correct. The previous sentence establishes a conflict/gap (two theories work in their own domains but clash). A 'Therefore' (conclusion) drawn from a scientific conflict is typically the need for a solution or a new framework to bridge the gap. The other options make illogical leaps not supported by the premise."
  },
  {
    difficulty: "hard" as const,
    prompt: "Read the excerpt: 'Author A argues that automation will lead to widespread unemployment. Author B, ________, contends that automation will create new, previously unimaginable industries.'\n\nWhich signal word is LEAST appropriate for the blank?",
    choices: ["consequently", "conversely", "on the other hand", "by contrast"],
    answer: "consequently",
    explanation: "Correct: 'consequently'. Author A and Author B hold opposing views. 'Conversely', 'on the other hand', and 'by contrast' all correctly signal this opposition. 'Consequently' signals cause and effect (e.g., Author B thinks this *because* Author A thinks that), which makes no logical sense in this context."
  }
];
