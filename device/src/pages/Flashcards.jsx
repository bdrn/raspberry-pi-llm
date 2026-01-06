import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Flashcards = () => {
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];
  const [flipped, setFlipped] = useState({});
  const listRef = useRef(null);

  const toggleFlip = (key) => {
    setFlipped((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollList = (direction) => {
    if (!listRef.current) return;
    listRef.current.scrollBy({ top: direction * 140, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-[480px] flex-col gap-4 px-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Flashcards
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
        {selectedItems.length === 0 ? (
          <p className="text-sm text-slate-400">
            No questions selected. Go back and choose some items.
          </p>
        ) : (
          selectedItems.map(({ quizId, question, index, topic }) => {
            const key = `${quizId}-${question?.id ?? index}`;
            const front =
              question?.type === "flashcard"
                ? question.front
                : question?.question;
            const back =
              question?.type === "flashcard"
                ? question.back
                : question?.explanation;
            const isFlipped = Boolean(flipped[key]);
            return (
              <div
                key={key}
                className="rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {topic || "Untitled topic"}
                </p>
                <div className="mt-2 rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {isFlipped ? "Answer" : "Question"}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-50">
                    {isFlipped
                      ? back || "Answer unavailable"
                      : front || "Untitled question"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFlip(key)}
                  className="mt-3 w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-50"
                >
                  {isFlipped ? "Show Question" : "Flip Card"}
                </button>
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
    </div>
  );
};

export default Flashcards;
