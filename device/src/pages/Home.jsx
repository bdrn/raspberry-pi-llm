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
      const topic = quiz.topic || quiz.quiz_data?.meta?.topic || "Untitled topic";
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

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-4 py-4 overflow-hidden">
      <h1 className="text-center text-4xl font-semibold tracking-tight text-slate-50">
        What should we study now?
      </h1>
      <div className="w-full max-w-2xl space-y-3">
        <div className="scroll-hidden h-[280px] w-full space-y-4 overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900/40 p-2">
          {topics.length === 0 ? (
            <p className="text-center text-base text-slate-400">
              No topics available yet.
            </p>
          ) : (
            topics.map(({ topic, items }) => (
              <div
                key={topic}
                className="space-y-3 rounded-3xl border border-slate-800/70 bg-slate-950/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-100">
                    {topic}
                  </h2>
                  <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    {items.length}
                  </span>
                </div>
                {items.length === 0 ? (
                  <p className="text-base text-slate-400">
                    No questions found for this topic.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map(({ quizId, question, index }) => {
                      const key = getQuestionKey(quizId, question, index);
                      return (
                        <label
                          key={key}
                          className={`flex items-center justify-between gap-4 rounded-2xl border px-3 py-2 text-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition ${
                            selectedQuestions[key]
                              ? "border-sky-400/80 bg-slate-900/80"
                              : "border-slate-800/80 bg-slate-900/50"
                          }`}
                        >
                          <div className="space-y-1">
                            <p className="text-base font-semibold">
                              {getQuestionText(question)}
                            </p>
                            <p className="text-sm text-slate-400 line-clamp-1">
                              {getAnswerText(question)}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(selectedQuestions[key])}
                            onChange={() => toggleQuestion(key)}
                            className="h-6 w-6 rounded-full border-slate-500 bg-slate-900 text-slate-50 accent-sky-400"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="flex gap-3">
          <Link
            to="/flashcards"
            state={{ selectedItems }}
            className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 text-center text-2xl font-semibold text-slate-50"
          >
            Flashcards
          </Link>
          <Link
            to="/quiz"
            state={{ selectedItems }}
            className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 text-center text-2xl font-semibold text-slate-50"
          >
            Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
