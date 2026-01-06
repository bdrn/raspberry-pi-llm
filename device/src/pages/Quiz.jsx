import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Quiz = () => {
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const listRef = useRef(null);

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

  const handleSelect = (key, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [key]: optionIndex }));
  };

  const calculateScore = () => {
    return questions.reduce((total, { key, question }) => {
      if (
        Number.isInteger(question?.correct_index) &&
        answers[key] === question.correct_index
      ) {
        return total + 1;
      }
      return total;
    }, 0);
  };

  const handleFinish = () => {
    const score = calculateScore();
    const total = questions.length;
    const payload = {
      score,
      total,
      completedAt: new Date().toISOString(),
    };
    const existing = localStorage.getItem("studybuddy-quiz-history");
    const history = existing ? JSON.parse(existing) : [];
    history.push(payload);
    localStorage.setItem("studybuddy-quiz-history", JSON.stringify(history));
    navigate("/dashboard");
  };

  const scrollList = (direction) => {
    if (!listRef.current) return;
    listRef.current.scrollBy({ top: direction * 140, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-[480px] flex-col gap-4 px-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Quiz
        </h1>
        <Link
          to="/home"
          className="rounded-full border border-slate-600/70 px-4 py-2 text-sm text-slate-100"
        >
          Back
        </Link>
      </div>
      <div className="flex flex-1 items-start gap-4">
        <div
          ref={listRef}
          className="h-[320px] flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-700/70 bg-slate-900/40 p-4"
        >
          {questions.length === 0 ? (
            <p className="text-sm text-slate-400">
              No questions selected. Go back and choose some items.
            </p>
          ) : (
            questions.map(({ key, question, topic }) => {
              const prompt =
                question?.type === "flashcard"
                  ? question.front
                  : question?.question;
              const options = Array.isArray(question?.options)
                ? question.options
                : [];
              const selectedIndex = answers[key];
              const correctIndex = question?.correct_index;
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {topic || "Untitled topic"}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-50">
                    {prompt || "Untitled question"}
                  </p>
                  {options.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {options.map((option, optionIndex) => {
                        const isSelected = selectedIndex === optionIndex;
                        const isCorrect =
                          submitted && optionIndex === correctIndex;
                        const isWrong =
                          submitted &&
                          isSelected &&
                          optionIndex !== correctIndex;
                        return (
                          <li
                            key={`${key}-option-${optionIndex}`}
                            className={`rounded-xl border px-3 py-2 ${
                              isCorrect
                                ? "border-emerald-400/80 bg-emerald-500/10"
                                : isWrong
                                ? "border-rose-400/80 bg-rose-500/10"
                                : "border-slate-800/70 bg-slate-950/60"
                            }`}
                          >
                            <label className="flex cursor-pointer items-center gap-3">
                              <input
                                type="radio"
                                name={key}
                                value={optionIndex}
                                checked={isSelected}
                                onChange={() => handleSelect(key, optionIndex)}
                                className="h-4 w-4 accent-sky-400"
                              />
                              {option}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">
                      No multiple-choice options for this question.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => scrollList(-1)}
            aria-label="Scroll up"
            className="h-14 w-14 rounded-2xl border border-slate-600/70 text-2xl text-slate-50"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => scrollList(1)}
            aria-label="Scroll down"
            className="h-14 w-14 rounded-2xl border border-slate-600/70 text-2xl text-slate-50"
          >
            ↓
          </button>
        </div>
      </div>
      {questions.length > 0 && (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900/60 px-6 py-3 text-lg font-semibold text-slate-50"
          >
            Check Answers
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 rounded-2xl bg-slate-50 px-6 py-3 text-lg font-semibold text-slate-900"
          >
            Finish Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
