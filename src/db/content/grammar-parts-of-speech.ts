export const partsOfSpeechTopic = {
  slug: "parts-of-speech",
  title: "Functional Parts of Speech",
  description: "Stop memorizing grammar rules. Learn how words function to convey meaning, action, and description in complex sentences.",
  sortOrder: 1,
};

export const partsOfSpeechLesson = {
  title: "Words are Tools, Not Labels",
  content: `### Intuition & Examples

Imagine walking into a workshop. You don't need to memorize the brand name of every hammer; you just need to know *what a hammer does*. 

School grammar teaches you to label: "Noun, Verb, Adjective." 
Functional reading teaches you to ask: "What is this word *doing* right now?"

*Example:* 
1. "Water the plants." (Water is an action / Verb).
2. "The water is cold." (Water is a thing / Noun).

The word "water" doesn't have a fixed label. Its function depends entirely on its job in the sentence.

### The Core Functions

1. **The Actors & Entities (Nouns/Pronouns)**
   - *What they do:* They are the "Who" or "What" of the sentence. They do the acting, or they are acted upon.
   - *Reading Focus:* When reading a dense, 40-word sentence in a philosophy passage, your first job is to find the core Entity. Who is this sentence actually about?

2. **The Engines (Verbs)**
   - *What they do:* They provide the action or state of being. Without an engine, a sentence goes nowhere.
   - *Reading Focus:* Is the engine active ("The government implemented the policy") or passive ("The policy was implemented")? Passive engines often hide *who* is responsible.

3. **The Modifiers (Adjectives/Adverbs)**
   - *What they do:* They restrict, clarify, or judge the Entities and Engines.
   - *Reading Focus:* Modifiers contain the author's **Tone**. If an author writes about an "unprecedented" success or a "disastrous" failure, the modifiers tell you how the author feels. Modifiers are where the author's opinion lives.

4. **The Bridges (Prepositions/Conjunctions)**
   - *What they do:* They connect ideas. (See the *Signal Words* module for deep dives into conjunctions).
   - *Reading Focus:* Prepositions (in, on, under, through, against) show relationships in time or space. "The argument *against* capitalism" is entirely different from "The argument *for* capitalism." The bridge changes everything.

### Reflection
A CAT passage will try to confuse you by turning actions into entities (Nominalization) or burying the main engine under layers of modifiers. Your job is to strip away the modifiers and find the core Actor and their Engine.`,
  examples: [
    "School way: 'The remarkably swift gazelle escaped the lion.' (Adjective, adverb, noun, verb, noun).",
    "Functional way: [Modifier] [Actor] [Engine] [Entity acted upon]."
  ]
};

export const partsOfSpeechExercises = [
  // EASY QUESTIONS
  {
    difficulty: "easy" as const,
    prompt: "In the sentence 'The CEO will chair the meeting tomorrow', what function is the word 'chair' performing?",
    choices: ["An Entity (Noun)", "An Engine (Verb)", "A Modifier (Adjective)", "A Bridge (Preposition)"],
    answer: "An Engine (Verb)",
    explanation: "Correct: An Engine (Verb). It is the action being performed by the CEO. Even though 'chair' is usually an object/entity, here it is functioning as the action of leading the meeting."
  },
  {
    difficulty: "easy" as const,
    prompt: "Read: 'The incredibly wealthy investor bought the startup.' Which word contains the author's judgment or tone regarding the investor?",
    choices: ["Investor", "Bought", "Incredibly", "Startup"],
    answer: "Incredibly",
    explanation: "Correct: 'Incredibly'. 'Investor', 'bought', and 'startup' are just facts (entities and engines). 'Incredibly' is a modifier that amplifies the wealth, adding a layer of emphasis."
  },
  {
    difficulty: "easy" as const,
    prompt: "Identify the core Engine (Verb) in this sentence: 'Despite the pouring rain and the freezing wind, she ran the marathon.'",
    choices: ["Pouring", "Freezing", "Ran", "Marathon"],
    answer: "Ran",
    explanation: "Correct: 'Ran'. While 'pouring' and 'freezing' look like actions, they are functioning as modifiers describing the rain and wind. 'Ran' is the primary action of the main actor (she)."
  },
  {
    difficulty: "easy" as const,
    prompt: "What is the primary function of a Modifier (Adjective/Adverb) in reading comprehension?",
    choices: ["To connect two separate sentences.", "To reveal the author's tone, opinion, or specific conditions.", "To act as the main subject of the sentence.", "To replace a noun to avoid repetition."],
    answer: "To reveal the author's tone, opinion, or specific conditions.",
    explanation: "Correct. Modifiers carry the descriptive weight. An author calling a policy 'flawed' vs. 'innovative' entirely changes the tone of the passage."
  },
  {
    difficulty: "easy" as const,
    prompt: "In the sentence 'He gave the book to the girl', what function does the word 'to' serve?",
    choices: ["It is the main Engine.", "It is the primary Actor.", "It is a Bridge establishing a directional relationship.", "It is a Modifier describing the book."],
    answer: "It is a Bridge establishing a directional relationship.",
    explanation: "Correct. 'To' is a preposition acting as a bridge, showing the direction of the action (giving) from the boy toward the girl."
  },
  {
    difficulty: "easy" as const,
    prompt: "'The government's rapid deployment of resources saved lives.' What is the core Actor (subject) of this sentence?",
    choices: ["Government", "Deployment", "Resources", "Lives"],
    answer: "Deployment",
    explanation: "Correct: 'Deployment'. The action (saved) was done by the deployment. 'Government's' is modifying *whose* deployment it was. This is an example of an action turned into an entity."
  },
  {
    difficulty: "easy" as const,
    prompt: "Which of the following is NOT a functional category?",
    choices: ["Actors (Nouns)", "Engines (Verbs)", "Paragraphs", "Modifiers (Adjectives/Adverbs)"],
    answer: "Paragraphs",
    explanation: "Correct. Paragraphs are structural units of an essay, not functional units of a single sentence."
  },
  {
    difficulty: "easy" as const,
    prompt: "'The bark of the dog was loud.' vs 'The dog will bark loudly.' What is the function of 'bark' in the first sentence?",
    choices: ["Engine (Verb)", "Actor/Entity (Noun)", "Modifier (Adjective)", "Bridge (Preposition)"],
    answer: "Actor/Entity (Noun)",
    explanation: "Correct. In the first sentence, 'bark' is the thing that was loud. It is an entity. In the second sentence, it is the action."
  },
  {
    difficulty: "easy" as const,
    prompt: "Why is it dangerous to memorize strict definitions for words?",
    choices: ["Because the dictionary is often wrong.", "Because words change their function based on how they are used in a sentence.", "Because CAT does not test vocabulary.", "Because grammar rules never apply."],
    answer: "Because words change their function based on how they are used in a sentence.",
    explanation: "Correct. A word's function is fluid. 'Run' can be a verb ('I run') or a noun ('I went for a run'). Reading relies on context, not fixed labels."
  },
  {
    difficulty: "easy" as const,
    prompt: "'She spoke elegantly.' Which word is the Modifier?",
    choices: ["She", "Spoke", "Elegantly", "There is no modifier."],
    answer: "Elegantly",
    explanation: "Correct. 'Elegantly' modifies the engine ('spoke'), telling us *how* the action was performed."
  },

  // MEDIUM QUESTIONS
  {
    difficulty: "medium" as const,
    prompt: "Read: 'The ostensibly philanthropic billionaire donated millions to secure political favors.' Which word completely reverses the apparent meaning of the sentence?",
    choices: ["Philanthropic", "Donated", "Millions", "Ostensibly"],
    answer: "Ostensibly",
    explanation: "Correct: 'Ostensibly'. It means 'apparently or purportedly, but perhaps not actually.' This single modifier changes the billionaire from a hero into a manipulator. If you miss this modifier, you misinterpret the entire passage."
  },
  {
    difficulty: "medium" as const,
    prompt: "Find the core Engine in this complex sentence: 'The ancient manuscript, hidden for centuries beneath the ruins of the forgotten monastery, revealed secrets about the early cosmos.'",
    choices: ["Hidden", "Forgotten", "Revealed", "Cosmos"],
    answer: "Revealed",
    explanation: "Correct: 'Revealed'. 'Hidden' and 'forgotten' look like verbs, but they are functioning as modifiers describing the manuscript and the monastery. The main action the manuscript takes is 'revealed'."
  },
  {
    difficulty: "medium" as const,
    prompt: "'The implementation of the new, highly controversial tax policy was delayed by the hostile legislature.' What is the core Actor and Engine of this sentence?",
    choices: [
      "Actor: Legislature | Engine: Hostile",
      "Actor: Implementation | Engine: Was delayed",
      "Actor: Policy | Engine: Delayed",
      "Actor: Tax | Engine: Controversial"
    ],
    answer: "Actor: Implementation | Engine: Was delayed",
    explanation: "Correct. The core subject is 'implementation' (an action turned into a noun). What happened to it? It 'was delayed' (a passive verb). The legislature is the agent doing the delaying, but grammatically, the implementation is the subject."
  },
  {
    difficulty: "medium" as const,
    prompt: "How does the use of nominalization (turning a verb into a noun, e.g., 'decide' -> 'decision') affect reading flow?",
    choices: [
      "It makes sentences shorter and punchier.",
      "It often makes sentences denser and more abstract, requiring the reader to unpack the hidden action.",
      "It clarifies who is performing the action.",
      "It eliminates the need for modifiers."
    ],
    answer: "It often makes sentences denser and more abstract, requiring the reader to unpack the hidden action.",
    explanation: "Correct. 'The committee decided' is clear and active. 'The decision of the committee was finalized' is dense and abstract. Academic writing uses nominalization heavily, making it harder to read."
  },
  {
    difficulty: "medium" as const,
    prompt: "'His apocryphal anecdotes entertained the crowd.' What does the modifier 'apocryphal' tell you about the author's view of the anecdotes?",
    choices: ["The author believes they are 100% factual.", "The author believes they are humorous.", "The author doubts their authenticity.", "The author finds them offensive."],
    answer: "The author doubts their authenticity.",
    explanation: "Correct. 'Apocryphal' means of doubtful authenticity, although widely circulated as being true. The modifier carries the author's skepticism."
  },
  {
    difficulty: "medium" as const,
    prompt: "Which sentence uses 'impact' as an Engine?",
    choices: [
      "The impact of the meteor was devastating.",
      "We must measure the environmental impact.",
      "The new regulations will severely impact small businesses.",
      "An impact crater was found in the desert."
    ],
    answer: "The new regulations will severely impact small businesses.",
    explanation: "Correct. Here, 'impact' is functioning as an action (verb) being performed by the regulations. In the other choices, it functions as an entity or a modifier."
  },
  {
    difficulty: "medium" as const,
    prompt: "In the phrase 'the devastatingly simple solution', how are the words functioning?",
    choices: [
      "Two modifiers modifying an entity.",
      "An engine modifying a modifier.",
      "A modifier modifying another modifier, which modifies an entity.",
      "Two entities modifying an engine."
    ],
    answer: "A modifier modifying another modifier, which modifies an entity.",
    explanation: "Correct. 'Devastatingly' modifies 'simple'. 'Simple' modifies 'solution'. This stacking of modifiers is common in complex texts."
  },
  {
    difficulty: "medium" as const,
    prompt: "'The panel investigated the CEO.' vs 'An investigation of the CEO was conducted by the panel.' What is lost in the second (passive) sentence?",
    choices: [
      "The meaning is entirely changed.",
      "The second sentence is grammatically incorrect.",
      "The directness and speed of the action; the actor is buried at the end.",
      "The second sentence uses incorrect modifiers."
    ],
    answer: "The directness and speed of the action; the actor is buried at the end.",
    explanation: "Correct. Passive voice takes the Engine ('investigated') and turns it into an Entity ('investigation'), slowing down the sentence and hiding the Actor ('panel') until the very end."
  },
  {
    difficulty: "medium" as const,
    prompt: "Read: 'Unbridled capitalism eventually commodifies human interaction.' Strip away the modifiers. What is the core Actor and Engine?",
    choices: [
      "Actor: Capitalism | Engine: Commodifies",
      "Actor: Unbridled | Engine: Eventually",
      "Actor: Human | Engine: Interaction",
      "Actor: Capitalism | Engine: Interaction"
    ],
    answer: "Actor: Capitalism | Engine: Commodifies",
    explanation: "Correct. 'Unbridled' and 'eventually' are modifiers. 'Human' modifies interaction. The core idea is: Capitalism (Actor) commodifies (Engine)."
  },
  {
    difficulty: "medium" as const,
    prompt: "Why should a reader pay special attention to Bridge words (prepositions like 'despite', 'because of', 'without')?",
    choices: [
      "They are usually the main subject of the sentence.",
      "They dictate the logical relationship between the entities and actions.",
      "They contain the author's tone.",
      "They are often misspelled."
    ],
    answer: "They dictate the logical relationship between the entities and actions.",
    explanation: "Correct. Bridges establish the logic. 'The law passed *because of* protests' means something entirely different than 'The law passed *despite* protests.'"
  },

  // HARD QUESTIONS
  {
    difficulty: "hard" as const,
    prompt: "Read carefully: 'The administration’s ostensibly pragmatic pivot toward renewable energy subsidies masked a deeply entrenched allegiance to legacy fossil fuel conglomerates, effectively neutering the legislation’s impact.'\nWhat is the core Engine of the main clause, and what is its Actor?",
    choices: [
      "Actor: Pivot | Engine: Masked",
      "Actor: Administration | Engine: Pivot",
      "Actor: Allegiance | Engine: Neutering",
      "Actor: Subsidies | Engine: Masked"
    ],
    answer: "Actor: Pivot | Engine: Masked",
    explanation: "Correct. Stripping the modifiers: 'The... pivot... masked a... allegiance...'. The pivot (Actor) did the masking (Engine). The administration is modifying *whose* pivot it was."
  },
  {
    difficulty: "hard" as const,
    prompt: "In the sentence from the previous question, what is the function of the word 'neutering'?",
    choices: [
      "It is the main Engine of the sentence.",
      "It is an Entity representing the outcome.",
      "It functions as a modifier (participle) describing the consequence of the main action.",
      "It is a Bridge connecting the subsidies to the conglomerates."
    ],
    answer: "It functions as a modifier (participle) describing the consequence of the main action.",
    explanation: "Correct. 'Neutering' is an 'ing' word acting as a modifier phrase. It describes the *result* of the masking action. It is not the main verb of the sentence."
  },
  {
    difficulty: "hard" as const,
    prompt: "Consider the phrase: 'The democratization of information.' This is an example of nominalization, where the verb 'democratize' becomes a noun. How does an author use this structural choice to manipulate an argument?",
    choices: [
      "By turning an action into a 'thing', the author can treat a complex, debatable process as an accepted, undeniable fact.",
      "It allows the author to avoid using any modifiers.",
      "It makes the sentence active and aggressive.",
      "It reveals the author's bias against democracy."
    ],
    answer: "By turning an action into a 'thing', the author can treat a complex, debatable process as an accepted, undeniable fact.",
    explanation: "Correct. If I say 'We are democratizing information', you can ask 'Are you really?' or 'Who is doing it?'. If I say 'The democratization of information has led to...', I have taken a verb, frozen it into a noun, and forced you to accept it as an existing reality so I can move on to my next point."
  },
  {
    difficulty: "hard" as const,
    prompt: "Read: 'To suggest that artificial intelligence possesses genuine sentience is to fundamentally misunderstand both the biological necessity of consciousness and the algorithmic nature of machine learning.'\nWhat is the grammatical subject (the main Actor) of this sentence?",
    choices: [
      "Artificial intelligence",
      "Genuine sentience",
      "To suggest that artificial intelligence possesses genuine sentience",
      "Biological necessity"
    ],
    answer: "To suggest that artificial intelligence possesses genuine sentience",
    explanation: "Correct. The entire infinitive phrase ('To suggest...') is functioning as the subject of the sentence. The main engine is 'is'. (To do X is to do Y). This is a highly complex structure often found in philosophical texts."
  },
  {
    difficulty: "hard" as const,
    prompt: "Which of the following sentences uses modifiers to subtly attack the subject while pretending to be objective?",
    choices: [
      "The senator's radical policies destroyed the economy.",
      "The senator implemented policies that resulted in a 4% GDP drop.",
      "The senator's ambitious, if somewhat quixotic, economic proposals ultimately failed to yield the promised dividends.",
      "The senator is a terrible leader."
    ],
    answer: "The senator's ambitious, if somewhat quixotic, economic proposals ultimately failed to yield the promised dividends.",
    explanation: "Correct. 'Quixotic' means idealistic but impractical. By wrapping it in 'ambitious, if somewhat...', the author maintains an academic tone while delivering a fatal critique of the senator's competence. The other options are either overtly hostile or purely objective."
  }
];
