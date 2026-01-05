import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api";

const Home = () => {
  const listRef = useRef(null);
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
      items,
    }));
  }, [quizzes]);

  const scrollList = (direction) => {
    if (!listRef.current) return;
    listRef.current.scrollBy({ top: direction * 120, behavior: "smooth" });
  };

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

  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 px-6 py-8">
      <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-50">
        What should we study now?
      </h1>
      <div className="flex w-full max-w-2xl items-center gap-4">
        <div
          ref={listRef}
          className="h-[320px] flex-1 space-y-6 overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4"
        >
          {topics.length === 0 ? (
            <p className="text-center text-sm text-slate-400">
              No topics available yet.
            </p>
          ) : (
            topics.map(({ topic, items }) => (
              <div
                key={topic}
                className="space-y-3 rounded-2xl bg-slate-950/60 p-4"
              >
                <h2 className="text-lg font-semibold text-slate-100">
                  {topic}
                </h2>
                {items.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No questions found for this topic.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map(({ quizId, question, index }) => {
                      const key = getQuestionKey(quizId, question, index);
                      return (
                        <label
                          key={key}
                          className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(selectedQuestions[key])}
                            onChange={() => toggleQuestion(key)}
                            className="mt-1 h-5 w-5 rounded border-slate-500 bg-slate-900 text-slate-50 accent-sky-400"
                          />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {getQuestionText(question)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {getAnswerText(question)}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => scrollList(-1)}
            aria-label="Scroll up"
            className="h-16 w-16 rounded-2xl border border-slate-600/70 text-2xl text-slate-50"
          >
          
          </button>
          <button
            type="button"
            onClick={() => scrollList(1)}
            aria-label="Scroll down"
            className="h-16 w-16 rounded-2xl border border-slate-600/70 text-2xl text-slate-50"
          >
            
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
