/**
 * Generates an empty scaffold for explanations for a given paragraph.
 * This can be filled out manually later, or partially populated if basic rules are met.
 */
export function generateExplanationScaffold(_paragraphText: string) {
  return {
    simplifiedMeaning: "",
    paragraphPurpose: "",
    keyIdea: "",
    source: "manual" as const,
  };
}
