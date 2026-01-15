import { useEffect, useMemo, useState } from "react";
import { usePopQuiz } from "../context/PopQuizContext";
import { recordStreakUsage } from "../lib/streak";

const getQuestionKey = (quizId, question, index) => {
  const baseId = question && question.id !== undefined ? question.id : index;
  return `${quizId}-${baseId}`;
};

const shuffleOptions = (options) => {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const PopQuizOverlay = () => {
  const { activeQuiz, closeQuiz } = usePopQuiz();
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!activeQuiz) return;
    setAnswers({});
    setRevealed({});
    setCurrentIndex(0);
    setShowResults(false);
    recordStreakUsage();
  }, [activeQuiz]);

  const questions = activeQuiz?.questions || [];
  const current = questions[currentIndex];
  const currentQuestion = current?.question;
  const currentKey = current
    ? getQuestionKey(current.quizId, current.question, current.index)
    : null;

  const currentOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const options = Array.isArray(currentQuestion.options)
      ? currentQuestion.options.slice(0, 4)
      : [];
    const mapped = options.map((option, index) => ({ option, index }));
    return shuffleOptions(mapped);
  }, [currentQuestion]);

  const handleSelect = (key, optionIndex, allowsMultiple) => {
    if (!allowsMultiple && revealed[key]) return;
    if (allowsMultiple) {
      setAnswers((prev) => {
        const currentSelections = Array.isArray(prev[key]) ? prev[key] : [];
        const next = currentSelections.includes(optionIndex)
          ? currentSelections.filter((value) => value !== optionIndex)
          : [...currentSelections, optionIndex];
        return { ...prev, [key]: next };
      });
      setRevealed((prev) => ({ ...prev, [key]: true }));
      return;
    }
    setAnswers((prev) => ({ ...prev, [key]: optionIndex }));
    setRevealed((prev) => ({ ...prev, [key]: true }));
  };

  const isQuestionCorrect = (key, question) => {
    if (!question) return false;
    if (Array.isArray(question.correct_indices)) {
      const selected = Array.isArray(answers[key]) ? answers[key] : [];
      const correctSet = new Set(question.correct_indices);
      if (selected.length !== correctSet.size) return false;
      return selected.every((value) => correctSet.has(value));
    }
    if (Number.isInteger(question.correct_index)) {
      return answers[key] === question.correct_index;
    }
    return false;
  };

  const calculateScore = () => {
    return questions.reduce((total, item) => {
      return total + (isQuestionCorrect(
        getQuestionKey(item.quizId, item.question, item.index),
        item.question
      )
        ? 1
        : 0);
    }, 0);
  };

  const handleFinish = () => {
    setShowResults(true);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (!activeQuiz || questions.length === 0) return null;

  const allowsMultiple = Array.isArray(currentQuestion?.correct_indices);
  const correctIndices = allowsMultiple
    ? currentQuestion.correct_indices
    : Number.isInteger(currentQuestion?.correct_index)
    ? [currentQuestion.correct_index]
    : [];

  return (
    <div className="theme-overlay fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-sm">
      <div className="game-panel relative w-full max-w-xl space-y-4 rounded-[32px] p-5 text-center">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Pop-up quiz
          </p>
          <button
            type="button"
            onClick={closeQuiz}
            className="game-button game-button-secondary rounded-full px-4 py-2 text-[10px] font-semibold"
          >
            Dismiss
          </button>
        </div>

        {showResults ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Session complete
            </p>
            <p className="game-title text-4xl font-semibold text-slate-50">
              {calculateScore()} / {questions.length}
            </p>
            <p className="text-sm text-slate-400">
              Nice work! Stay consistent to keep your streak alive.
            </p>
            <button
              type="button"
              onClick={closeQuiz}
              className="game-button game-button-primary w-full rounded-2xl px-4 py-3 text-base font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/70 px-4 py-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {current?.topic || "Untitled topic"}
              </p>
              <p className="game-title mt-3 text-3xl font-semibold text-slate-50">
                {currentQuestion?.question || "Untitled question"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentOptions.map(({ option, index: optionIndex }) => {
                const selectedValue = answers[currentKey];
                const isRevealed = Boolean(revealed[currentKey]);
                const isSelected = allowsMultiple
                  ? Array.isArray(selectedValue) &&
                    selectedValue.includes(optionIndex)
                  : selectedValue === optionIndex;
                const isCorrect =
                  isRevealed && correctIndices.includes(optionIndex);
                const isWrong =
                  isRevealed &&
                  isSelected &&
                  !correctIndices.includes(optionIndex);

                return (
                  <button
                    key={`${currentKey}-option-${optionIndex}`}
                    type="button"
                    onClick={() =>
                      handleSelect(currentKey, optionIndex, allowsMultiple)
                    }
                    className={`game-option relative min-h-[64px] rounded-2xl px-4 py-3 text-base font-semibold transition duration-200 ease-out active:scale-[0.98] ${
                      isCorrect
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]"
                        : isWrong
                        ? "border-rose-500 bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.35)]"
                        : "hover:-translate-y-0.5"
                    }`}
                  >
                    {isCorrect && (
                      <span className="absolute left-3 top-2 text-base">
                        ✓
                      </span>
                    )}
                    {isWrong && (
                      <span className="absolute left-3 top-2 text-base">
                        ✕
                      </span>
                    )}
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="game-button game-button-secondary flex-1 rounded-2xl px-4 py-2 text-lg font-semibold disabled:opacity-40"
              >
                Back
              </button>
              {currentIndex === questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="game-button game-button-primary flex-1 rounded-2xl px-4 py-2 text-lg font-semibold"
                >
                  Finish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToNext}
                  className="game-button game-button-primary flex-1 rounded-2xl px-4 py-2 text-lg font-semibold"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopQuizOverlay;
