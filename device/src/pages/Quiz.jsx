import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api";
import { recordStreakUsage } from "../lib/streak";

const Quiz = () => {
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [latestScore, setLatestScore] = useState(null);

  const questions = useMemo(() => {
    return selectedItems
      .map(({ quizId, question, index, topic }) => {
        const key = `${quizId}-${question?.id ?? index}`;
        return {
          key,
          topic,
          question,
        };
      })
      .filter(({ question }) => question);
  }, [selectedItems]);

  useEffect(() => {
    if (questions.length > 0) {
      recordStreakUsage();
    }
  }, [questions.length]);

  const shuffleOptions = (options) => {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const currentOptions = useMemo(() => {
    const options = Array.isArray(questions[currentIndex]?.question?.options)
      ? questions[currentIndex].question.options.slice(0, 4)
      : [];
    const mapped = options.map((option, index) => ({
      option,
      index,
    }));
    return shuffleOptions(mapped);
  }, [currentIndex, questions]);

  const handleSelect = (key, optionIndex, allowsMultiple) => {
    if (!allowsMultiple && revealed[key]) return;
    if (allowsMultiple) {
      setAnswers((prev) => {
        const current = Array.isArray(prev[key]) ? prev[key] : [];
        const next = current.includes(optionIndex)
          ? current.filter((value) => value !== optionIndex)
          : [...current, optionIndex];
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
    return questions.reduce((total, { key, question }) => {
      return total + (isQuestionCorrect(key, question) ? 1 : 0);
    }, 0);
  };

  const handleFinish = async () => {
    const score = calculateScore();
    const total = questions.length;
    const perTopic = questions.reduce((acc, { key, question, topic }) => {
      const name = topic || "Untitled topic";
      if (!acc[name]) {
        acc[name] = { correct: 0, total: 0 };
      }
      acc[name].total += 1;
      if (isQuestionCorrect(key, question)) {
        acc[name].correct += 1;
      }
      return acc;
    }, {});
    const payload = {
      score,
      total,
      perTopic,
      completedAt: new Date().toISOString(),
    };
    const existing = localStorage.getItem("studybuddy-quiz-history");
    const history = existing ? JSON.parse(existing) : [];
    history.push(payload);
    localStorage.setItem("studybuddy-quiz-history", JSON.stringify(history));
    setLatestScore(payload);

    try {
      await api.post(
        "/progress",
        {
          score,
          total,
          per_topic: perTopic,
        },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Failed to sync progress:", error);
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="flex h-full flex-col gap-3 px-4 py-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="game-title text-3xl font-semibold text-slate-50">
          Quiz
        </h1>
        <Link
          to="/home"
          className="game-button game-button-secondary rounded-full px-4 py-2 text-xs text-slate-100"
        >
          Back
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {questions.length === 0 ? (
          <p className="text-sm text-slate-400">
            No questions selected. Go back and choose some items.
          </p>
        ) : (
          <div className="w-full max-w-xl space-y-4">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-slate-400">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div className="game-panel rounded-[28px] p-3 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {questions[currentIndex].topic || "Untitled topic"}
              </p>
              <p className="game-title mt-3 text-3xl font-semibold text-slate-50">
                {questions[currentIndex].question?.type === "flashcard"
                  ? questions[currentIndex].question?.front ||
                    "Untitled question"
                  : questions[currentIndex].question?.question ||
                    "Untitled question"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {currentOptions.map(({ option, index: optionIndex }) => {
                  const key = questions[currentIndex].key;
                  const selectedValue = answers[key];
                  const multiCorrect = Array.isArray(
                    questions[currentIndex].question?.correct_indices
                  );
                  const correctIndices = multiCorrect
                    ? questions[currentIndex].question.correct_indices
                    : Number.isInteger(
                        questions[currentIndex].question?.correct_index
                      )
                    ? [questions[currentIndex].question.correct_index]
                    : [];
                  const isRevealed = Boolean(revealed[key]);
                  const isSelected = multiCorrect
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
                      key={`${key}-option-${optionIndex}`}
                      type="button"
                      onClick={() =>
                        handleSelect(key, optionIndex, multiCorrect)
                      }
                      className={`game-option relative min-h-[64px] rounded-2xl px-4 py-3 text-lg font-semibold transition duration-200 ease-out active:scale-[0.98] ${
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
                aria-label="Previous question"
                className="game-button game-button-secondary flex-1 rounded-2xl px-6 py-2 text-2xl font-semibold text-slate-50 transition duration-200 ease-out active:scale-[0.98] disabled:opacity-40"
              >
                ←
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={currentIndex === questions.length - 1}
                aria-label="Next question"
                className="game-button game-button-secondary flex-1 rounded-2xl px-6 py-2 text-2xl font-semibold text-slate-50 transition duration-200 ease-out active:scale-[0.98] disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
      {latestScore ? (
        <div className="game-panel rounded-2xl px-4 py-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Latest Quiz Score
          </p>
          <p className="game-title mt-2 text-4xl font-semibold text-slate-50">
            {latestScore.score} / {latestScore.total}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Completed {new Date(latestScore.completedAt).toLocaleString()}
          </p>
        </div>
      ) : (
        questions.length > 0 && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleFinish}
              className="game-button game-button-primary flex-1 rounded-2xl px-6 py-2 text-xl font-semibold text-slate-950 transition duration-200 ease-out active:scale-[0.98]"
            >
              Finish Quest
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default Quiz;
