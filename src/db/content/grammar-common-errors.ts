export const commonErrorsTopic = {
  slug: "common-errors",
  title: "Navigating Structural Traps",
  description: "Learn how test makers use agreement errors, dangling modifiers, and broken parallelism to confuse readers and test logic.",
  sortOrder: 3,
};

export const commonErrorsLesson = {
  title: "The Logic of Grammar Rules",
  content: `### Intuition & Examples

Grammar rules are not arbitrary laws invented by angry teachers. They are rules of *logic* designed to prevent ambiguity. When a rule is broken, the logic of the sentence breaks. 

*Example:* "Walking down the street, the trees were beautiful."
Did the trees go for a walk? That's what the grammar implies. This is a **Dangling Modifier**. The rule isn't just a technicality; the sentence is literally stating something impossible.

### The Three Major Traps

Test makers (like the CAT) don't test grammar to see if you memorized a textbook. They test grammar to see if you can track logic through a complex sentence. They do this using three main traps:

1. **Subject-Verb Distance (The Agreement Trap)**
   - *The Trick:* Authors will place the Subject at the beginning of the sentence, insert 20 words of fluff, and then put the Verb. They will make the noun right next to the verb the wrong number (singular vs plural).
   - *Example:* "The **list** of regulations governing the massive, multi-national corporations **were** long."
   - *The Logic:* "Corporations were" sounds right to the ear. But the subject is "list" (singular). It should be "The list... was long."

2. **Dangling & Misplaced Modifiers (The Identity Trap)**
   - *The Trick:* A modifier must sit next to the thing it modifies. If it doesn't, the sentence says something ridiculous.
   - *Example:* "Exhausted from the marathon, the finish line was a welcome sight."
   - *The Logic:* The finish line didn't run the marathon. It should be: "Exhausted from the marathon, **the runner** saw the finish line."

3. **Parallelism (The Balance Trap)**
   - *The Trick:* Items in a list, or items being compared, must have the exact same grammatical shape. If they don't, the scale tips over.
   - *Example:* "The manager praised her for her intelligence, her dedication, and **because she was punctual**."
   - *The Logic:* Noun, Noun, Clause. It breaks the balance. It should be: "...her intelligence, her dedication, and **her punctuality**."

### Reflection
When you see a long, underlined sentence in a verbal section, do not trust your ear. Your ear only hears the words right next to each other. Trust the skeleton. Match the Subject to the Verb. Match the Modifier to the Actor. Match the items on the scale.`,
  examples: [
    "Broken: To invest in tech is riskier than buying bonds.",
    "Logical: To invest in tech is riskier than to invest in bonds. (Parallelism)"
  ]
};

export const commonErrorsExercises = [
  // EASY QUESTIONS
  {
    difficulty: "easy" as const,
    prompt: "Identify the error in this sentence: 'The group of students are studying for the exam.'",
    choices: ["Dangling Modifier", "Subject-Verb Agreement", "Parallelism", "No error"],
    answer: "Subject-Verb Agreement",
    explanation: "Correct. The subject is 'group' (singular). The verb is 'are' (plural). It should be 'The group... is studying.' The phrase 'of students' is fluff designed to trick your ear."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the error in this sentence: 'She likes hiking, swimming, and to ride bicycles.'",
    choices: ["Dangling Modifier", "Subject-Verb Agreement", "Parallelism", "No error"],
    answer: "Parallelism",
    explanation: "Correct. The list uses -ing verbs (hiking, swimming) and then switches to an infinitive (to ride). It should be 'hiking, swimming, and riding'."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the error in this sentence: 'After reading the book, the movie made more sense.'",
    choices: ["Dangling Modifier", "Subject-Verb Agreement", "Parallelism", "No error"],
    answer: "Dangling Modifier",
    explanation: "Correct. 'After reading the book' is a modifier. It must immediately precede the person who did the reading. The movie didn't read the book. It should be: 'After reading the book, I found the movie made more sense.'"
  },
  {
    difficulty: "easy" as const,
    prompt: "Read: 'The CEO, along with his entire executive team, ____ attending the conference.' Fill in the blank with the logically correct verb.",
    choices: ["is", "are", "were", "have been"],
    answer: "is",
    explanation: "Correct. The core subject is 'The CEO' (singular). The phrase 'along with his entire executive team' is parenthetical fluff, not part of a compound subject. Therefore, the verb must be singular ('is')."
  },
  {
    difficulty: "easy" as const,
    prompt: "Which sentence has perfect parallelism?",
    choices: [
      "The policy aims to reduce poverty, increasing employment, and to stimulate growth.",
      "The policy aims to reduce poverty, to increase employment, and to stimulate growth.",
      "The policy aims at poverty reduction, increasing employment, and to stimulate growth.",
      "To reduce poverty, increasing employment, and stimulating growth are the policy's aims."
    ],
    answer: "The policy aims to reduce poverty, to increase employment, and to stimulate growth.",
    explanation: "Correct. It uses the infinitive form (to verb) for all three items in the list."
  },
  {
    difficulty: "easy" as const,
    prompt: "Why is 'Covered in mud, I washed the dog' logically flawed?",
    choices: [
      "It implies 'I' was covered in mud, rather than the dog.",
      "It lacks a main verb.",
      "It has a plural subject and singular verb.",
      "There is no logical flaw."
    ],
    answer: "It implies 'I' was covered in mud, rather than the dog.",
    explanation: "Correct. The modifier 'Covered in mud' attaches to the noun immediately following it ('I'). Unless you were the one rolling in the mud, it should be 'I washed the dog, which was covered in mud.'"
  },
  {
    difficulty: "easy" as const,
    prompt: "Fill in the blank: 'Either the manager or the employees ____ responsible for the error.'",
    choices: ["is", "are", "was", "has been"],
    answer: "are",
    explanation: "Correct. In 'Either/Or' constructions, the verb agrees with the noun closest to it. Because 'employees' is plural and is closest to the verb, the verb must be 'are'."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the error: 'The new software is faster, more reliable, and it costs less.'",
    choices: ["Subject-Verb Agreement", "Dangling Modifier", "Parallelism", "No error"],
    answer: "Parallelism",
    explanation: "Correct. 'faster' (adjective), 'more reliable' (adjective phrase), 'it costs less' (independent clause). It should be: 'faster, more reliable, and cheaper'."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the error: 'Each of the cars on the lot have a tracking device.'",
    choices: ["Subject-Verb Agreement", "Parallelism", "Dangling Modifier", "No error"],
    answer: "Subject-Verb Agreement",
    explanation: "Correct. 'Each' is a singular pronoun. The fluff is 'of the cars'. The core is 'Each... has'. It should be 'Each of the cars has'."
  },
  {
    difficulty: "easy" as const,
    prompt: "When reading a long sentence, what is the best way to avoid falling into a Subject-Verb agreement trap?",
    choices: [
      "Read it aloud to see if it sounds right.",
      "Mentally bracket the prepositional phrases and clauses between the subject and verb.",
      "Always assume the verb should be plural.",
      "Focus only on the nouns."
    ],
    answer: "Mentally bracket the prepositional phrases and clauses between the subject and verb.",
    explanation: "Correct. Your ear will deceive you if you just read it aloud. You must structurally isolate the skeleton to see if it matches."
  },

  // MEDIUM QUESTIONS
  {
    difficulty: "medium" as const,
    prompt: "Read: 'To accurately predict consumer behavior is ____.' Which of the following completes the sentence with perfect parallelism?",
    choices: [
      "more difficult than predicting stock market trends.",
      "harder than to predict the stock market.",
      "more difficult than to predict stock market trends.",
      "a harder task than predicting the stock market."
    ],
    answer: "more difficult than to predict stock market trends.",
    explanation: "Correct. The subject is an infinitive phrase ('To accurately predict'). The comparative element must also be an infinitive phrase ('to predict')."
  },
  {
    difficulty: "medium" as const,
    prompt: "Identify the error: 'The sheer volume of data generated by modern telescopes require new algorithms for processing.'",
    choices: ["Dangling Modifier", "Subject-Verb Agreement", "Parallelism", "No error"],
    answer: "Subject-Verb Agreement",
    explanation: "Correct. The subject is 'volume' (singular). The verb is 'require' (plural). The phrase 'of data generated by modern telescopes' is just a long prepositional phrase trying to trick you with the plural word 'telescopes'. It should be 'volume... requires'."
  },
  {
    difficulty: "medium" as const,
    prompt: "Which sentence correctly uses a participial phrase without dangling it?",
    choices: [
      "Having finished the assignment, the TV was turned on.",
      "Having finished the assignment, turning on the TV seemed like a good idea.",
      "Having finished the assignment, John turned on the TV.",
      "Having finished the assignment, the TV turned on."
    ],
    answer: "Having finished the assignment, John turned on the TV.",
    explanation: "Correct. 'Having finished the assignment' modifies the person who finished it. Only 'John' is a logical subject capable of finishing an assignment."
  },
  {
    difficulty: "medium" as const,
    prompt: "Identify the error: 'Not only did the startup secure funding, but they also recruit top talent.'",
    choices: ["Subject-Verb Agreement", "Parallelism", "Dangling Modifier", "No error"],
    answer: "Parallelism",
    explanation: "Correct. This is a subtle parallelism error involving verb tense. The first half is past tense ('did secure'). The second half must match ('recruited')."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read: 'The coalition of environmental groups, indigenous leaders, and local farmers ____ a strict ban on deforestation.' Fill in the blank.",
    choices: ["demand", "demands", "are demanding", "have demanded"],
    answer: "demands",
    explanation: "Correct. The core subject is 'coalition', which is a singular collective noun. The list in the prepositional phrase ('groups, leaders, farmers') is plural, but it does not change the singularity of 'coalition'. The verb must be 'demands'."
  },
  {
    difficulty: "medium" as const,
    prompt: "Identify the logical flaw: 'Unlike his previous novels, the author's new book features a sci-fi setting.'",
    choices: [
      "It compares novels to an author.",
      "It has a plural subject and singular verb.",
      "It is a dangling modifier.",
      "It breaks parallelism in a list."
    ],
    answer: "It compares novels to an author.",
    explanation: "Correct. This is an illogcial comparison (a type of modifier/parallelism error). 'Unlike his previous novels' modifies the noun immediately following it, which is 'the author'. You cannot compare novels to an author. It should be 'Unlike his previous novels, the author's new novel...'"
  },
  {
    difficulty: "medium" as const,
    prompt: "Identify the error: 'He is considered not only a brilliant scientist but also is a talented musician.'",
    choices: ["Subject-Verb Agreement", "Parallelism", "Dangling Modifier", "No error"],
    answer: "Parallelism",
    explanation: "Correct. The 'not only X but also Y' structure requires X and Y to be exactly parallel. X is 'a brilliant scientist' (noun phrase). Y is 'is a talented musician' (verb phrase). It should be: 'not only a brilliant scientist but also a talented musician.'"
  },
  {
    difficulty: "medium" as const,
    prompt: "Fill in the blank: 'None of the information provided by the witnesses ____ reliable.'",
    choices: ["were", "are", "was", "have been"],
    answer: "was",
    explanation: "Correct. 'Information' is an uncountable (singular) noun. When 'None' refers to an uncountable noun, it takes a singular verb. 'Witnesses' is fluff."
  },
  {
    difficulty: "medium" as const,
    prompt: "Which of the following is an example of a 'Squinting Modifier' (a modifier that could logically apply to the phrase before it OR after it)?",
    choices: [
      "Running quickly, the race was won.",
      "The teacher told the student frequently to study.",
      "The dogs barked loudly all night.",
      "Because of the rain, the game was canceled."
    ],
    answer: "The teacher told the student frequently to study.",
    explanation: "Correct. Does 'frequently' apply to the telling (The teacher frequently told) or the studying (to study frequently)? Because it sits exactly between them, the logic is ambiguous."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read: 'A number of the world's most prominent economists ____ predicting a recession.' Fill in the blank.",
    choices: ["is", "are", "was", "has been"],
    answer: "are",
    explanation: "Correct. The phrase 'A number of' acts as an adjective meaning 'several' or 'many', making the subject plural. (Contrast this with 'The number of', which is singular)."
  },

  // HARD QUESTIONS
  {
    difficulty: "hard" as const,
    prompt: "Read the excerpt: 'The proliferation of algorithmic trading bots, designed to exploit microsecond inefficiencies in the market, have exacerbated market volatility.'\nIdentify the exact grammatical error.",
    choices: [
      "The modifier 'designed to exploit...' is dangling.",
      "The subject 'proliferation' (singular) disagrees with the verb 'have' (plural).",
      "The phrase 'microsecond inefficiencies' breaks parallelism with 'market volatility'.",
      "There is no error."
    ],
    answer: "The subject 'proliferation' (singular) disagrees with the verb 'have' (plural).",
    explanation: "Correct. Subject: 'proliferation'. Fluff 1: 'of algorithmic trading bots'. Fluff 2: ', designed to... market,'. The verb immediately following this massive chunk of plural fluff is 'have'. It must be 'has' to match 'proliferation'."
  },
  {
    difficulty: "hard" as const,
    prompt: "Analyze the logical comparison: 'The bone density of prehistoric hunter-gatherers was significantly higher than modern agriculturalists.' What is the fatal flaw?",
    choices: [
      "It incorrectly uses 'higher' instead of 'more high'.",
      "It compares 'bone density' (a physical trait) directly to 'modern agriculturalists' (people).",
      "It uses a singular subject with a plural comparison.",
      "It uses passive voice."
    ],
    answer: "It compares 'bone density' (a physical trait) directly to 'modern agriculturalists' (people).",
    explanation: "Correct. This is a faulty comparison. You must compare density to density. It should read '...higher than THAT OF modern agriculturalists' or '...higher than modern agriculturalists' bone density'."
  },
  {
    difficulty: "hard" as const,
    prompt: "Identify the structural issue: 'Buried deep within the 100-page regulatory filing, the journalists discovered a clause that completely exempted the company from environmental liability.'",
    choices: [
      "Subject-Verb Agreement error.",
      "Dangling Modifier.",
      "Parallelism error.",
      "There is no issue; it is perfectly structured."
    ],
    answer: "Dangling Modifier.",
    explanation: "Correct. 'Buried deep within the 100-page regulatory filing' is an introductory modifier. Grammatically, it must modify the noun immediately following it ('the journalists'). The sentence literally states that the journalists were buried in the filing. It should be: '...filing, a clause was discovered by the journalists that...'"
  },
  {
    difficulty: "hard" as const,
    prompt: "Which sentence uses the subjunctive mood correctly to express a hypothetical or counterfactual situation?",
    choices: [
      "If the CEO was aware of the fraud, he would have resigned.",
      "If the CEO were aware of the fraud, he would have resigned.",
      "If the CEO is aware of the fraud, he would resign.",
      "If the CEO has been aware of the fraud, he would have resigned."
    ],
    answer: "If the CEO were aware of the fraud, he would have resigned.",
    explanation: "Correct. In formal English, hypothetical or contrary-to-fact statements ('If I were a rich man') require the subjunctive 'were', even for singular subjects like 'CEO' or 'I'."
  },
  {
    difficulty: "hard" as const,
    prompt: "Read: 'The committee’s decision to allocate funds to the arts, subsidize public transport, and the building of a new community center drew intense criticism.'\nIdentify the error.",
    choices: [
      "Subject-Verb Agreement (decision drew)",
      "Parallelism (to allocate, subsidize, the building)",
      "Misplaced Modifier (to the arts)",
      "No error"
    ],
    answer: "Parallelism (to allocate, subsidize, the building)",
    explanation: "Correct. The list of infinitives starts with 'to allocate' (infinitive verb), continues with '[to] subsidize' (infinitive verb), and then crashes into 'the building' (gerund noun phrase). It should be 'to allocate, [to] subsidize, and [to] build'."
  }
];
