import { useEffect, useRef, useState } from "react";
import api from "../api";

const Home = () => {
  const listRef = useRef(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchTopics = async () => {
      try {
        const response = await api.get("/sync");
        const quizTopics = response.data.quizzes
          .map((quiz) => quiz.topic)
          .filter(Boolean);
        if (isMounted) {
          setTopics(Array.from(new Set(quizTopics)));
        }
      } catch (error) {
        console.error("Failed to fetch topics:", error);
        if (isMounted) {
          setTopics([]);
        }
      }
    };

    fetchTopics();
    const intervalId = setInterval(fetchTopics, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const scrollList = (direction) => {
    if (!listRef.current) return;
    listRef.current.scrollBy({ top: direction * 120, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 px-6 py-8">
      <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-50">
        What should we study now?
      </h1>
      <div className="flex w-full max-w-md items-center gap-4">
        <div
          ref={listRef}
          className="h-[280px] flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4"
        >
          {topics.map((topic) => (
            <label
              key={topic}
              className="flex items-center gap-4 rounded-xl bg-slate-950/60 px-4 py-4 text-xl text-slate-100"
            >
              <input
                type="checkbox"
                className="h-7 w-7 rounded border-slate-500 bg-slate-900 text-slate-50 accent-sky-400"
              />
              {topic}
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => scrollList(-1)}
            aria-label="Scroll up"
            className="h-16 w-16 rounded-2xl border border-slate-600/70 text-2xl text-slate-50"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => scrollList(1)}
            aria-label="Scroll down"
            className="h-16 w-16 rounded-2xl border border-slate-600/70 text-2xl text-slate-50"
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
