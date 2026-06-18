'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Trophy } from 'lucide-react';

type ExerciseType = { id: string; answer: string; difficulty: string; prompt: string; choices: string[]; explanation: string };
type TopicType = { slug: string };

export default function GrammarPracticeClient({ 
  topic, 
  exercises 
}: { 
  topic: TopicType | Record<string, unknown>; 
  exercises: ExerciseType[] | Record<string, unknown>[];
}) {
  const typedExercises = exercises as ExerciseType[];
  
  // Group by difficulty
  const easyExercises = typedExercises.filter(e => e.difficulty === 'easy');
  const mediumExercises = typedExercises.filter(e => e.difficulty === 'medium');
  const hardExercises = typedExercises.filter(e => e.difficulty === 'hard');
  
  const difficulties = [
    { level: 'easy', list: easyExercises },
    { level: 'medium', list: mediumExercises },
    { level: 'hard', list: hardExercises }
  ].filter(d => d.list.length > 0);

  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isAnswered, setIsAnswered] = useState<Record<string, boolean>>({});
  const [isCorrectMap, setIsCorrectMap] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);

  const currentDifficultyGroup = difficulties[difficultyIndex];
  const isComplete = difficultyIndex >= difficulties.length;

  const handleSelectOption = async (exercise: ExerciseType, option: string) => {
    if (isAnswered[exercise.id]) return;

    const correct = option === exercise.answer;
    
    setSelectedOptions(prev => ({ ...prev, [exercise.id]: option }));
    setIsAnswered(prev => ({ ...prev, [exercise.id]: true }));
    setIsCorrectMap(prev => ({ ...prev, [exercise.id]: correct }));

    if (correct) {
      setScore(s => s + 1);
    }

    // Fire API call asynchronously
    try {
      await fetch('/api/grammar/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercise.id,
          answer: option,
          isCorrect: correct,
        }),
      });
    } catch (e) {
      console.error("Failed to save attempt", e);
    }
  };

  const handleNextDifficulty = () => {
    setDifficultyIndex(i => i + 1);
    window.scrollTo({ top: document.getElementById('practice-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  if (isComplete) {
    return (
      <div id="practice-section" className="max-w-2xl mx-auto py-24 px-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[var(--color-bg)] p-12 rounded-3xl shadow-xl border border-[var(--color-border)]"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--color-accent-muted)] text-[var(--color-accent)] rounded-full mb-6">
            <Trophy size={40} />
          </div>
          <h2 className="text-4xl font-serif text-[var(--color-text)] mb-4">Practice Complete!</h2>
          <p className="text-xl text-[var(--color-text-subtle)]">
            You scored <span className="font-bold text-emerald-600">{score}</span> out of {typedExercises.length}.
          </p>
        </motion.div>
      </div>
    );
  }

  const formatPrompt = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i} className="block mb-2 last:mb-0">
        {line}
      </span>
    ));
  };

  const answeredCountForCurrent = currentDifficultyGroup.list.filter(e => isAnswered[e.id]).length;
  const allAnsweredForCurrent = answeredCountForCurrent === currentDifficultyGroup.list.length;

  return (
    <div id="practice-section" className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1 capitalize">
          {currentDifficultyGroup.level} Practice
        </h2>
        <p className="text-sm text-[var(--color-text-subtle)]">
          Answer all questions to unlock the next difficulty level.
        </p>
        
        {/* Difficulty Tabs Visualizer */}
        <div className="flex gap-2 mt-4">
          {difficulties.map((diff, idx) => (
            <div 
              key={diff.level} 
              className={`flex-1 h-2 rounded-full ${
                idx < difficultyIndex ? 'bg-emerald-500' :
                idx === difficultyIndex ? 'bg-emerald-300' :
                'bg-[var(--color-bg-subtle)]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {currentDifficultyGroup.list.map((exercise, index) => {
            const answered = isAnswered[exercise.id];
            const correct = isCorrectMap[exercise.id];
            const selected = selectedOptions[exercise.id];

            return (
              <motion.div
                key={exercise.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-[var(--color-bg)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Question {index + 1}</span>
                  </div>
                  
                  <h3 className="text-[0.975rem] font-medium text-[var(--color-text)] leading-[1.7] mb-6">
                    {formatPrompt(exercise.prompt)}
                  </h3>

                  <div className="space-y-3">
                    {exercise.choices && exercise.choices.length > 0 ? (
                      exercise.choices.map((choice, cIdx) => {
                        const isThisSelected = selected === choice;
                        let stateClass = "border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)]";
                        
                        if (answered) {
                          if (choice === exercise.answer) {
                            stateClass = "border-emerald-500 bg-emerald-500/10 text-[var(--color-success)]"; 
                          } else if (isThisSelected && choice !== exercise.answer) {
                            stateClass = "border-rose-500 bg-rose-500/10 text-[var(--color-danger)]"; 
                          } else {
                            stateClass = "border-[var(--color-border)] bg-[var(--color-bg-subtle)] opacity-50"; 
                          }
                        }

                        return (
                          <button
                            key={cIdx}
                            onClick={() => handleSelectOption(exercise, choice)}
                            disabled={answered}
                            className={`w-full text-left px-5 py-3 rounded-lg border transition-all duration-200 ${stateClass}`}
                          >
                            <span className="text-[0.938rem] leading-relaxed">{choice}</span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-[var(--color-text-subtle)] italic p-4 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)] text-center">
                        Options for this question are missing in the database.
                      </div>
                    )}
                  </div>

                  {/* Explanation Area */}
                  <AnimatePresence>
                    {answered && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                        className="overflow-hidden"
                      >
                        <div className={`p-4 rounded-lg ${correct ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                          <div className="flex items-start gap-2">
                            {correct ? (
                              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <h4 className={`font-semibold text-sm mb-1 ${correct ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                                {correct ? 'Correct!' : 'Incorrect'}
                              </h4>
                              <p className="text-[var(--color-text-subtle)] leading-relaxed text-[0.875rem]">
                                {exercise.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 flex justify-center pb-12">
        <button
          onClick={handleNextDifficulty}
          disabled={!allAnsweredForCurrent}
          className={`px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-md ${
            allAnsweredForCurrent 
              ? 'bg-[var(--color-text)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent)] hover:shadow-xl hover:-translate-y-1' 
              : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] cursor-not-allowed'
          }`}
        >
          {difficultyIndex < difficulties.length - 1 ? 'Next Difficulty' : 'Finish Practice'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
