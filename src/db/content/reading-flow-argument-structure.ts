export const argumentStructureTopic = {
  slug: "argument-structure",
  title: "Argument Structure",
  description: "Deconstruct passages by identifying Claims, Evidence, Examples, Counterarguments, and Conclusions.",
  sortOrder: 11,
};

export const argumentStructureLesson = {
  title: "X-Ray Vision for Reading",
  content: `### Intuition & Examples

Imagine a lawyer in a courtroom. If they just stood up and said, "My client is innocent!" and sat down, they would lose. They must make a **Claim** ("My client is innocent"), provide **Evidence** ("Here is the security footage"), give an **Example** ("Notice how the person in the footage is left-handed, unlike my client"), address a **Counterargument** ("The prosecution says my client had a motive, but..."), and deliver a **Conclusion** ("Therefore, you must acquit").

Good reading isn't about memorizing the details of the security footage. It's about recognizing *why* the lawyer is showing you the footage in the first place.

### The Concept: The Building Blocks of Argument

Every persuasive text is built using five primary blocks. If you can label what block you are reading, you never get lost.

1. **The Claim (The "What")**
   - The primary point the author wants you to believe. It is an opinion or theory presented as truth.
   - *Example:* "Universal basic income (UBI) is the only viable solution to job displacement caused by AI."

2. **The Evidence (The "Why")**
   - Data, logic, or facts used to support the claim. Without evidence, a claim is just an assertion.
   - *Example:* "Studies from the Finland UBI trial show that recipient well-being increased without a significant drop in employment."

3. **The Example (The "How")**
   - A specific instance that brings the evidence or claim to life. It moves from abstract to concrete.
   - *Example:* "Take, for instance, a truck driver in Ohio who used the UBI stipend to retrain as a wind turbine technician."

4. **The Counterargument (The "Yeah, but...")**
   - Anticipating the opposing side's view. A strong author always addresses the counterargument to show they've thought of everything.
   - *Example:* "Critics argue that UBI will disincentivize work, leading to a stagnant economy."

5. **The Conclusion (The "So What?")**
   - The final synthesis. It often restates the claim but adds the weight of the evidence and the resolution of the counterargument.
   - *Example:* "Therefore, while the initial costs of UBI are high, the long-term socioeconomic stability it provides makes it a necessary evolution of capitalism."

### Reflection
When you encounter a dense, boring paragraph, ask yourself one question: *"What is this paragraph doing?"* Is it making a claim, proving a claim, or arguing against a claim? Label the block, and the density disappears.`,
  examples: [
    "[Claim] Sleep deprivation is a public health crisis. [Evidence] Chronic lack of sleep is linked to a 20% increase in cardiovascular disease. [Example] For instance, shift workers show drastically higher rates of heart attacks. [Counterargument] Some claim caffeine mitigates this, [Conclusion] but stimulants only mask the exhaustion without repairing the cellular damage."
  ]
};

export const argumentStructureExercises = [
  // EASY QUESTIONS
  {
    difficulty: "easy" as const,
    prompt: "Identify the function of the following sentence: 'A recent study by the National Institute of Health found that participants who meditated daily lowered their cortisol levels by 15%.'",
    choices: ["Claim", "Evidence", "Counterargument", "Conclusion"],
    answer: "Evidence",
    explanation: "Correct: Evidence. This sentence provides a specific statistic and cites a study. It is data used to prove a broader point. It is not an opinion (Claim), nor does it conclude an argument or argue against one."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the function of the following sentence: 'Mandatory voting should be implemented in all democratic nations to ensure true representation.'",
    choices: ["Claim", "Evidence", "Example", "Counterargument"],
    answer: "Claim",
    explanation: "Correct: Claim. This is a debatable opinion or thesis that the author is arguing for. It contains no data (Evidence), is not a specific instance (Example), and is not an opposing view (Counterargument)."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the function of the following sentence: 'Some economists worry that raising the minimum wage will force small businesses to close.'",
    choices: ["Claim", "Evidence", "Counterargument", "Conclusion"],
    answer: "Counterargument",
    explanation: "Correct: Counterargument. The phrase 'Some economists worry that...' signals that the author is introducing an opposing viewpoint to address it."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the function of the following sentence: 'Take the city of Copenhagen, where extensive bike lane infrastructure has reduced car traffic by 30%.'",
    choices: ["Claim", "Example", "Counterargument", "Conclusion"],
    answer: "Example",
    explanation: "Correct: Example. The phrase 'Take the city of Copenhagen' shows the author is moving from a broad concept (presumably about urban planning) to a specific, concrete instance."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the function of the following sentence: 'Ultimately, prioritizing short-term shareholder profits at the expense of environmental sustainability guarantees long-term corporate failure.'",
    choices: ["Evidence", "Example", "Counterargument", "Conclusion"],
    answer: "Conclusion",
    explanation: "Correct: Conclusion. The word 'Ultimately' signals a final synthesis. It takes a broad stance based on the preceding arguments."
  },
  {
    difficulty: "easy" as const,
    prompt: "If an author writes an entire paragraph explaining how the human immune system fights off a virus, what block is this most likely serving for the broader essay about vaccine efficacy?",
    choices: ["Evidence", "Claim", "Conclusion", "Counterargument"],
    answer: "Evidence",
    explanation: "Correct: Evidence. The factual, scientific explanation of the immune system serves as the foundational data (evidence) that will later prove the essay's claim about vaccines."
  },
  {
    difficulty: "easy" as const,
    prompt: "Which structural block is most likely to contain the phrase 'Despite these valid concerns...'?",
    choices: ["The start of a Claim", "The transition out of a Counterargument", "An Example", "The introduction of Evidence"],
    answer: "The transition out of a Counterargument",
    explanation: "Correct: The transition out of a Counterargument. The author is acknowledging the opposing view ('valid concerns') but is about to pivot ('Despite') back to their own conclusion."
  },
  {
    difficulty: "easy" as const,
    prompt: "Read: 'The diet is unsustainable. People who follow it eventually binge eat.' What is the relationship between the two sentences?",
    choices: [
      "The first is Evidence; the second is a Claim.",
      "The first is a Claim; the second is Evidence.",
      "Both are Counterarguments.",
      "The first is an Example; the second is a Conclusion."
    ],
    answer: "The first is a Claim; the second is Evidence.",
    explanation: "Correct. 'The diet is unsustainable' is an opinion/assertion (Claim). 'People who follow it eventually binge eat' provides the behavioral proof/reason (Evidence) supporting the claim."
  },
  {
    difficulty: "easy" as const,
    prompt: "Which of the following is NOT an example of Evidence?",
    choices: [
      "A quote from a leading historian.",
      "Data from a 10-year longitudinal study.",
      "The author's belief that society is becoming less empathetic.",
      "Statistics regarding rising global temperatures."
    ],
    answer: "The author's belief that society is becoming less empathetic.",
    explanation: "Correct. The author's belief is a Claim. Evidence is the external data, quotes, or facts used to support that belief."
  },
  {
    difficulty: "easy" as const,
    prompt: "Why do authors use Examples?",
    choices: [
      "To state their main opinion.",
      "To disagree with their own thesis.",
      "To summarize the entire essay.",
      "To make abstract evidence or claims concrete and understandable."
    ],
    answer: "To make abstract evidence or claims concrete and understandable.",
    explanation: "Correct. Examples bridge the gap between abstract theory and reality, making the argument easier for the reader to grasp."
  },

  // MEDIUM QUESTIONS
  {
    difficulty: "medium" as const,
    prompt: "Read the passage: '(1) Telecommuting increases employee productivity. (2) Without the distraction of office politics, workers can focus deeply on tasks. (3) A Stanford study showed a 13% performance increase among remote workers.'\nMatch the sentences to their functions.",
    choices: [
      "1: Claim, 2: Evidence (Logic), 3: Evidence (Data)",
      "1: Conclusion, 2: Claim, 3: Example",
      "1: Evidence, 2: Example, 3: Claim",
      "1: Claim, 2: Example, 3: Counterargument"
    ],
    answer: "1: Claim, 2: Evidence (Logic), 3: Evidence (Data)",
    explanation: "Correct. Sentence 1 is the core assertion (Claim). Sentence 2 provides logical reasoning (Evidence). Sentence 3 provides empirical data (Evidence)."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read the passage: 'Skeptics argue that electric vehicles (EVs) are not truly green because the electricity used to charge them often comes from coal. While this is true in certain regions, an EV charged on a coal grid over its lifetime still produces 30% fewer emissions than a gas-powered car.'\nWhat is the function of the second sentence?",
    choices: [
      "It concedes to the counterargument entirely.",
      "It refutes the counterargument by providing new evidence.",
      "It serves as the main claim of the passage.",
      "It provides a specific example of an EV."
    ],
    answer: "It refutes the counterargument by providing new evidence.",
    explanation: "Correct. The first sentence introduces the counterargument (EVs use coal). The second sentence acknowledges it ('While this is true') but refutes its conclusion by providing evidence (still 30% fewer emissions)."
  },
  {
    difficulty: "medium" as const,
    prompt: "An author introduces a complex philosophical theory in paragraph 1. Paragraph 2 is entirely a story about two friends trying to split a restaurant bill fairly. What is paragraph 2 doing?",
    choices: [
      "It is a counterargument proving the theory wrong.",
      "It is an extended example used to ground the abstract theory in reality.",
      "It is the author's primary claim.",
      "It is irrelevant filler."
    ],
    answer: "It is an extended example used to ground the abstract theory in reality.",
    explanation: "Correct. Splitting a bill is a concrete, relatable scenario. Authors use these extended examples (analogies) to make abstract theories (like justice or fairness) understandable."
  },
  {
    difficulty: "medium" as const,
    prompt: "If you remove all the 'Evidence' from an essay, what are you left with?",
    choices: [
      "An unconvincing list of unsupported opinions (Claims).",
      "A highly factual report.",
      "Only counterarguments.",
      "A collection of pure data."
    ],
    answer: "An unconvincing list of unsupported opinions (Claims).",
    explanation: "Correct. Claims without evidence are just opinions. The evidence is the load-bearing structure that supports the claims."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read: '(1) The new tax law will harm the middle class. (2) The deduction limit for state taxes disproportionately affects households earning between $50k and $100k. (3) Therefore, the legislation is fundamentally regressive.'\nWhich sentence is the Conclusion?",
    choices: ["Sentence 1", "Sentence 2", "Sentence 3", "None of them"],
    answer: "Sentence 3",
    explanation: "Correct: Sentence 3. 'Therefore' signals the conclusion. Sentence 1 is the initial claim. Sentence 2 is the evidence explaining the mechanics. Sentence 3 synthesizes them into a final judgment."
  },
  {
    difficulty: "medium" as const,
    prompt: "When reading a dense passage about quantum physics, a student feels lost in the terminology of paragraph 3. However, they notice paragraph 4 begins with 'To put this in perspective...' How should the student approach paragraph 4?",
    choices: [
      "Skip it, because it is just repetition.",
      "Read it slowly, as it contains a new, more difficult claim.",
      "Read it carefully, because it is an Example that will clarify the confusing concepts of paragraph 3.",
      "Assume it is a counterargument challenging the physics."
    ],
    answer: "Read it carefully, because it is an Example that will clarify the confusing concepts of paragraph 3.",
    explanation: "Correct. 'To put this in perspective' signals an analogy or example. Good readers know that if they fail to grasp the abstract Claim/Evidence, the Example is their lifeline to understanding the concept."
  },
  {
    difficulty: "medium" as const,
    prompt: "Which of the following describes the relationship between a Claim and a Counterargument?",
    choices: [
      "They support the exact same idea.",
      "The counterargument is the data that proves the claim.",
      "The claim is the author's stance; the counterargument represents the opposing stance.",
      "The claim is specific, while the counterargument is broad."
    ],
    answer: "The claim is the author's stance; the counterargument represents the opposing stance.",
    explanation: "Correct. They are inherently adversarial. The author presents their claim, then introduces the counterargument to acknowledge the other side before dismissing it."
  },
  {
    difficulty: "medium" as const,
    prompt: "In a CAT Reading Comprehension passage, if a question asks 'Why does the author mention the incident in 1984?', what is the question actually asking you to identify?",
    choices: [
      "The date the article was written.",
      "The structural function of the Example or Evidence within the broader argument.",
      "The author's tone.",
      "The definition of a specific word in that sentence."
    ],
    answer: "The structural function of the Example or Evidence within the broader argument.",
    explanation: "Correct. 'Why does the author mention X' is a classic structure question. The author never mentions an incident randomly; it is always serving as Evidence or an Example to support a specific Claim."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read: 'Traditional agriculture relies heavily on chemical fertilizers, which degrade soil health over decades. Regenerative agriculture, however, uses crop rotation to restore soil microbiomes.'\nWhat is the function of the first sentence?",
    choices: [
      "It is the main Conclusion.",
      "It is a Counterargument against regenerative agriculture.",
      "It is the problem (Context/Evidence) that sets up the claim for the solution (regenerative agriculture).",
      "It is an Example of regenerative agriculture."
    ],
    answer: "It is the problem (Context/Evidence) that sets up the claim for the solution (regenerative agriculture).",
    explanation: "Correct. In many arguments, authors establish a 'Problem' (traditional ag harms soil) before introducing their 'Claim/Solution' (regenerative ag is better)."
  },
  {
    difficulty: "medium" as const,
    prompt: "A student notes that an author wrote: 'Critics might suggest that space exploration is a waste of funds.' The student expects the author's next sentence to agree with the critics. Is the student's expectation correct?",
    choices: [
      "Yes, authors usually agree with their critics.",
      "Yes, because space exploration is expensive.",
      "No, 'Critics might suggest' signals a counterargument that the author is about to refute.",
      "No, the author is just listing random facts."
    ],
    answer: "No, 'Critics might suggest' signals a counterargument that the author is about to refute.",
    explanation: "Correct. A strong reader knows that introducing a critic is a setup. The author is teeing up the opposing view specifically so they can strike it down and strengthen their own claim."
  },

  // HARD QUESTIONS
  {
    difficulty: "hard" as const,
    prompt: "Read the excerpt: '(1) The assertion that social media echo chambers are the primary driver of political polarization is intuitively appealing but empirically flawed. (2) A comprehensive study of internet usage across 12 democracies shows that polarization has risen most sharply among demographics that use the internet the least, such as those over 65. (3) Furthermore, cable television news algorithms exhibit a much higher degree of ideological siloing than social feeds. (4) Clearly, the digital scapegoat masks a broader institutional decay.'\nWhich sentence serves as the author's primary Claim?",
    choices: [
      "Sentence 1",
      "Sentence 2",
      "Sentence 3",
      "Sentence 4"
    ],
    answer: "Sentence 4",
    explanation: "Correct: Sentence 4. Sentence 1 rejects a popular claim (it's a counter-claim to the public narrative). Sentences 2 and 3 provide evidence (data and logic) dismantling the popular claim. Sentence 4 is the author's true, synthesized conclusion/claim: the real issue is institutional decay, not social media."
  },
  {
    difficulty: "hard" as const,
    prompt: "Consider an essay structured as follows:\nPara 1: Describes a new educational policy.\nPara 2: Explains why the policy's creators believe it will work.\nPara 3: Outlines statistical evidence showing the policy failing in three test districts.\nPara 4: Argues the policy should be repealed.\n\nWhat is the function of Paragraph 2 within the author's overall argument?",
    choices: [
      "It is the author's main Claim.",
      "It is the Evidence supporting the author's Claim.",
      "It is the Counterargument to the author's eventual Claim.",
      "It is an Example of the policy failing."
    ],
    answer: "It is the Counterargument to the author's eventual Claim.",
    explanation: "Correct. The author's ultimate claim (Para 4) is that the policy should be repealed. Paragraph 2 explains the *opposing* side's logic (why creators think it will work). Presenting the opposing logic before dismantling it with evidence (Para 3) is a classic counterargument structure."
  },
  {
    difficulty: "hard" as const,
    prompt: "Read: 'Historical determinism—the idea that events are inevitably caused by preceding events—strips humanity of agency. If determinism is true, the architect of a brilliant monument deserves no praise, and the perpetrator of a heinous crime deserves no punishment. Because we fundamentally organize society around moral responsibility, we must reject strict determinism.'\n\nHow does the author construct Evidence against determinism?",
    choices: [
      "By citing historical data.",
      "By using an ad hominem attack against determinists.",
      "By exploring the logical consequences (reductio ad absurdum) of the premise.",
      "By providing a statistical example."
    ],
    answer: "By exploring the logical consequences (reductio ad absurdum) of the premise.",
    explanation: "Correct. The author provides no data or statistics. Instead, their 'evidence' is logical: they take the premise of determinism to its extreme conclusion (no praise, no punishment) to show that it is incompatible with how human society functions."
  },
  {
    difficulty: "hard" as const,
    prompt: "An author writes: 'The reliance on standardized testing assumes that intellectual capability can be quantified as easily as physical weight. But one cannot measure a forest's health solely by counting its trees.'\n\nWhat is the function of the second sentence?",
    choices: [
      "It provides empirical data to refute the first sentence.",
      "It serves as a metaphorical Example illustrating the flaw in the logic of the first sentence.",
      "It introduces a counterargument about environmentalism.",
      "It is the final conclusion of the essay."
    ],
    answer: "It serves as a metaphorical Example illustrating the flaw in the logic of the first sentence.",
    explanation: "Correct. The author is using an analogy/metaphor (forest's health) to serve as an Example. It highlights the logical flaw (reductionism) of the Claim presented in the first sentence."
  },
  {
    difficulty: "hard" as const,
    prompt: "Which of the following shifts in structure is most characteristic of a highly nuanced, CAT-level reading passage?",
    choices: [
      "Claim -> Evidence -> Conclusion.",
      "Example -> Example -> Example -> Claim.",
      "Counterargument -> Concession -> Qualified Claim -> Evidence.",
      "Claim -> Counterargument -> Immediate rejection without evidence."
    ],
    answer: "Counterargument -> Concession -> Qualified Claim -> Evidence.",
    explanation: "Correct. Nuanced arguments rarely present things as black-and-white. The author acknowledges the opposing view (Counterargument), admits it has some valid points (Concession), but then presents a more precise, nuanced version of their own view (Qualified Claim), backed by Evidence."
  }
];
