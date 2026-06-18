import { config } from "dotenv";
import { getDb, closeDb } from ".";
import { rcPassages, rcQuestions, rcOptions } from "./schema";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });
config();

const db = getDb();

async function seedRC() {
  console.log("Seeding CAT RC passages...");

  const passageData = {
    examType: "CAT" as const,
    year: 2023,
    title: "Return of Wolves to Lozère",
    sourceLabel: "Slot 1",
    difficulty: "hard" as const,
    estimatedMinutes: 12,
    passage: `The return of the wolf to the French region of Lozère has sparked a complex socio-economic debate. For over a century, the region's sheep farmers operated without the threat of apex predators, developing grazing practices that relied on minimal supervision. However, the reintroduction of wolves, protected under European conservation laws, has fundamentally altered this landscape.

Environmental NGOs and conservationists celebrate the wolf's return as a triumph of rewilding, pointing to the restoration of ecological balance and the control of ungulate populations. They also highlight a burgeoning eco-tourism industry, with 'wolf-tracking' tours bringing new revenue to economically depressed rural towns.

Conversely, local farmers argue that the economic burden falls entirely on them. The loss of livestock, coupled with the high cost of implementing new protective measures—such as specialized fencing and the maintenance of Patou guard dogs—threatens the viability of traditional pastoralism. While government compensation exists for proven wolf kills, farmers contend that it does not account for the indirect costs: the stress on the flock leading to lower birth rates, and the immense psychological toll on the shepherds themselves.

The conflict in Lozère is emblematic of a broader tension in modern conservation: the desire of urban populations to restore wild nature, often at the direct expense of rural communities whose livelihoods are intimately tied to the modified landscape.`,
  };

  const [insertedPassage] = await db
    .insert(rcPassages)
    .values(passageData)
    .onConflictDoUpdate({
      target: [rcPassages.examType, rcPassages.title, rcPassages.year],
      set: passageData,
    })
    .returning();

  if (!insertedPassage) {
    console.error("Failed to insert passage");
    return;
  }

  const questionsData = [
    {
      tag: "main_idea" as const,
      prompt: "Which of the following best captures the central theme of the passage?",
      correctOptionKey: "C",
      explanation: "The passage focuses on the conflicting viewpoints between conservationists (who see ecological and tourism benefits) and farmers (who bear the economic and psychological costs), illustrating a broader urban-rural divide in conservation efforts.",
      toneClues: ["complex socio-economic debate", "emblematic of a broader tension"],
      trapWords: ["solely", "unanimously"],
      inferenceLogic: "Identify the option that balances both sides of the argument presented in the text without taking a definitive stance for either.",
      sortOrder: 1,
      options: [
        { key: "A", text: "The devastating economic impact of wolf reintroduction on traditional French agriculture.", isCorrect: false, explanation: "This ignores the conservationist perspective and the mention of eco-tourism benefits." },
        { key: "B", text: "The success of European conservation laws in restoring ecological balance in Lozère.", isCorrect: false, explanation: "This ignores the severe negative impact on the local farming community." },
        { key: "C", text: "The socio-economic tensions arising from the reintroduction of wolves, highlighting the clash between conservation goals and rural livelihoods.", isCorrect: true, explanation: "This accurately captures both sides of the conflict discussed in the passage." },
        { key: "D", text: "The psychological toll that apex predators take on livestock and shepherds in modern Europe.", isCorrect: false, explanation: "This is a supporting detail, not the central theme." }
      ]
    },
    {
      tag: "inference" as const,
      prompt: "It can be inferred from the passage that prior to the return of the wolves, sheep farming in Lozère was characterized by:",
      correctOptionKey: "B",
      explanation: "The passage states farmers developed 'grazing practices that relied on minimal supervision' because they operated without the threat of apex predators.",
      toneClues: ["without the threat", "minimal supervision"],
      trapWords: ["intensive", "technological"],
      inferenceLogic: "Look for the direct description of past practices and infer the conditions that allowed them.",
      sortOrder: 2,
      options: [
        { key: "A", text: "The heavy use of Patou guard dogs to deter human theft.", isCorrect: false, explanation: "Guard dogs are mentioned as a *new* protective measure necessitated by the wolves, not a past practice." },
        { key: "B", text: "A reliance on grazing methods that required relatively little direct oversight by shepherds.", isCorrect: true, explanation: "Directly supported by the phrase 'relied on minimal supervision'." },
        { key: "C", text: "Constant conflict with environmental NGOs over land use.", isCorrect: false, explanation: "The conflict with NGOs is presented as a current issue arising from the wolves' return." },
        { key: "D", text: "A struggling economy that was completely revitalized by the agricultural sector.", isCorrect: false, explanation: "The passage mentions the towns are 'economically depressed', but doesn't state agriculture previously revitalized them." }
      ]
    },
    {
      tag: "detail" as const,
      prompt: "According to the passage, why do local farmers find the government compensation inadequate?",
      correctOptionKey: "A",
      explanation: "The passage explicitly states that farmers contend the compensation does not account for indirect costs like 'stress on the flock leading to lower birth rates' and the 'psychological toll'.",
      toneClues: ["contend that it does not account"],
      trapWords: ["refuses", "never"],
      inferenceLogic: "Locate the specific sentence mentioning government compensation and the farmers' specific grievance against it.",
      sortOrder: 3,
      options: [
        { key: "A", text: "It fails to cover the secondary financial and emotional damages caused by the wolves' presence.", isCorrect: true, explanation: "Matches the text's mention of indirect costs (lower birth rates) and psychological toll." },
        { key: "B", text: "The government outright refuses to acknowledge that wolves kill livestock.", isCorrect: false, explanation: "The text says compensation exists for 'proven wolf kills'." },
        { key: "C", text: "The compensation is entirely diverted to fund eco-tourism initiatives.", isCorrect: false, explanation: "Not stated in the text." },
        { key: "D", text: "It only pays for the cost of specialized fencing, not the livestock lost.", isCorrect: false, explanation: "The text says the opposite: it pays for 'proven wolf kills' but ignores other costs." }
      ]
    }
  ];

  for (const q of questionsData) {
    const [insertedQuestion] = await db
      .insert(rcQuestions)
      .values({
        passageId: insertedPassage.id,
        tag: q.tag,
        prompt: q.prompt,
        correctOptionKey: q.correctOptionKey,
        explanation: q.explanation,
        toneClues: q.toneClues,
        trapWords: q.trapWords,
        inferenceLogic: q.inferenceLogic,
        sortOrder: q.sortOrder,
      })
      .onConflictDoUpdate({
        target: [rcQuestions.passageId, rcQuestions.prompt],
        set: {
          correctOptionKey: q.correctOptionKey,
          explanation: q.explanation,
          toneClues: q.toneClues,
          trapWords: q.trapWords,
          inferenceLogic: q.inferenceLogic,
          sortOrder: q.sortOrder,
        },
      })
      .returning();

    if (insertedQuestion) {
      for (const opt of q.options) {
        await db
          .insert(rcOptions)
          .values({
            questionId: insertedQuestion.id,
            optionKey: opt.key,
            text: opt.text,
            explanation: opt.explanation,
            isCorrect: opt.isCorrect,
          })
          .onConflictDoUpdate({
            target: [rcOptions.questionId, rcOptions.optionKey],
            set: {
              text: opt.text,
              explanation: opt.explanation,
              isCorrect: opt.isCorrect,
            },
          });
      }
    }
  }

  console.log("Successfully seeded CAT RC passage: Return of Wolves to Lozère");
}

async function main() {
  try {
    await seedRC();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}

main();
