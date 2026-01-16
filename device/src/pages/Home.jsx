import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchQuizzes = async () => {
      try {
        const response = await api.get("/sync");
        if (isMounted) {
          setQuizzes(response.data.quizzes || []);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
        if (isMounted) {
          setQuizzes([]);
        }
      }
    };

    fetchQuizzes();
    const intervalId = setInterval(fetchQuizzes, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const topics = useMemo(() => {
    const grouped = new Map();

    quizzes.forEach((quiz) => {
      const topic = quiz.topic || quiz.quiz_data?.meta?.topic;
      if (!topic) return;
      const questions = Array.isArray(quiz.quiz_data?.questions)
        ? quiz.quiz_data.questions
        : [];

      if (!grouped.has(topic)) {
        grouped.set(topic, []);
      }

      questions.forEach((question, index) => {
        grouped.get(topic).push({
          quizId: quiz.id,
          question,
          index,
        });
      });
    });

    return Array.from(grouped.entries()).map(([topic, items]) => ({
      topic,
      items: items.map((item) => ({ ...item, topic })),
    }));
  }, [quizzes]);

  const getQuestionKey = (quizId, question, index) => {
    const baseId = question && question.id !== undefined ? question.id : index;
    return `${quizId}-${baseId}`;
  };

  const getQuestionText = (question) => {
    if (!question) return "Untitled question";
    if (question.type === "flashcard") return question.front || "Untitled question";
    return question.question || "Untitled question";
  };

  const getAnswerText = (question) => {
    if (!question) return "Answer unavailable";
    if (question.type === "flashcard") {
      return question.back || "Answer unavailable";
    }
    if (
      Array.isArray(question.options) &&
      Number.isInteger(question.correct_index) &&
      question.options[question.correct_index]
    ) {
      return question.options[question.correct_index];
    }
    return question.explanation || "Answer unavailable";
  };

  const toggleQuestion = (key) => {
    setSelectedQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectedItems = useMemo(() => {
    return topics.flatMap(({ items }) =>
      items.filter(({ quizId, question, index }) => {
        const key = getQuestionKey(quizId, question, index);
        return Boolean(selectedQuestions[key]);
      })
    );
  }, [selectedQuestions, topics]);

  const debugSample = useMemo(() => {
    if (quizzes.length === 0) return null;
    const quiz = quizzes[0];
    const metaTopic = quiz?.quiz_data?.meta?.topic || null;
    const questions = Array.isArray(quiz?.quiz_data?.questions)
      ? quiz.quiz_data.questions.length
      : 0;
    return {
      id: quiz?.id,
      topic: quiz?.topic || null,
      metaTopic,
      questions,
    };
  }, [quizzes]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 px-3 py-3 overflow-hidden">
      <div className="space-y-1 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
          Repeat now
        </p>
        <h1 className="game-title text-3xl font-semibold text-slate-50">
          Pick questions to repeat
        </h1>
        <p className="text-[11px] text-slate-400">
          Choose what you want to practice right away.
        </p>
      </div>
      <div className="game-scroll scroll-hidden w-full flex-1 min-h-0 space-y-3 overflow-y-auto rounded-2xl p-3">
        {topics.length === 0 ? (
          <div className="space-y-2 text-center text-sm text-slate-400">
            <p>No topics available yet.</p>
            <p className="text-[11px] text-slate-500">
              Synced quizzes: {quizzes.length}
            </p>
            {debugSample ? (
              <p className="text-[10px] text-slate-500">
                Sample quiz: id {debugSample.id} • topic {debugSample.topic || "none"} •
                meta.topic {debugSample.metaTopic || "none"} • questions{" "}
                {debugSample.questions}
              </p>
            ) : null}
          </div>
        ) : (
          topics.map(({ topic, items }) => (
            <div
              key={topic}
              className="game-panel space-y-3 rounded-2xl p-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">
                  {topic}
                </h2>
                {items.length === 0 ? (
                  <span className="text-[10px] text-slate-500">
                    No questions yet
                  </span>
                ) : (() => {
                  const allSelected = items.every(
                    ({ quizId, question, index }) => {
                      const key = getQuestionKey(quizId, question, index);
                      return Boolean(selectedQuestions[key]);
                    }
                  );
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuestions((prev) => {
                          const next = { ...prev };
                          items.forEach(({ quizId, question, index }) => {
                            const key = getQuestionKey(quizId, question, index);
                            next[key] = !allSelected;
                          });
                          return next;
                        });
                      }}
                      className="game-button game-button-secondary rounded-full px-3 py-2 text-[11px] font-semibold text-slate-100 min-h-[36px]"
                    >
                      {allSelected
                        ? "Clear all"
                        : `Select all (${items.length})`}
                    </button>
                  );
                })()}
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No questions found for this topic.
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map(({ quizId, question, index }) => {
                    const key = getQuestionKey(quizId, question, index);
                    return (
                      <label
                        key={key}
                        className={`game-panel flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-slate-100 transition ${
                          selectedQuestions[key]
                            ? "border-emerald-400/80 bg-slate-900/80"
                            : "border-slate-800/80 bg-slate-900/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-base font-semibold">
                            {getQuestionText(question)}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {getAnswerText(question)}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedQuestions[key])}
                          onChange={() => toggleQuestion(key)}
                          className="h-5 w-5 rounded-full border-slate-500 bg-slate-900 text-slate-50 accent-emerald-400"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
        <div className="flex gap-2 pb-1 pt-1">
          <Link
            to="/flashcards"
            state={{ selectedItems }}
            className="game-button game-button-secondary flex-1 rounded-2xl px-4 py-2 text-center text-base font-semibold text-slate-50"
          >
            Flashcards
          </Link>
          <Link
            to="/quiz"
            state={{ selectedItems }}
            className="game-button game-button-secondary flex-1 rounded-2xl px-4 py-2 text-center text-base font-semibold text-slate-50"
          >
            Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
