import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { recordStreakUsage } from "../lib/streak";

const Flashcards = () => {
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];
  const [flipped, setFlipped] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const startXRef = useRef(null);
  const isDraggingRef = useRef(false);

  const toggleFlip = (key) => {
    setFlipped((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cards = useMemo(() => {
    return selectedItems.map(({ quizId, question, index, topic }) => {
      const key = `${quizId}-${question?.id ?? index}`;
      const front =
        question?.type === "flashcard"
          ? question.front
          : question?.question;
      const back =
        question?.type === "flashcard"
          ? question.back
          : question?.explanation;
      return {
        key,
        topic,
        front,
        back,
      };
    });
  }, [selectedItems]);

  useEffect(() => {
    if (cards.length > 0) {
      recordStreakUsage();
    }
  }, [cards.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handlePointerDown = (event) => {
    startXRef.current = event.clientX;
    isDraggingRef.current = true;
  };

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current || startXRef.current === null) return;
    const delta = event.clientX - startXRef.current;
    if (Math.abs(delta) > 60) {
      if (delta < 0) {
        goToNext();
      } else {
        goToPrev();
      }
      isDraggingRef.current = false;
      startXRef.current = null;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    startXRef.current = null;
  };

  return (
    <div className="flex h-full flex-col gap-3 px-3 py-3 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <h1 className="game-title text-2xl font-semibold text-slate-50">
          Flashcards
        </h1>
        <Link
          to="/home"
          className="game-button game-button-secondary rounded-full px-4 py-2 text-[10px] text-slate-100"
        >
          Back
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center min-h-0">
        {cards.length === 0 ? (
          <p className="text-sm text-slate-400">
            No questions selected. Go back and choose some items.
          </p>
        ) : (
          <div className="w-full max-w-xl space-y-3">
            <p className="text-center text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Card {currentIndex + 1} of {cards.length}
            </p>
            <div
              role="button"
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onClick={() => toggleFlip(cards[currentIndex].key)}
              className="flashcard-flip game-panel float-slow relative h-[220px] w-full select-none rounded-[28px]"
            >
              <div
                className={`flashcard-inner ${
                  flipped[cards[currentIndex].key] ? "is-flipped" : ""
                }`}
              >
                <div className="flashcard-face flashcard-front">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                    {cards[currentIndex].topic || "Untitled topic"}
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    Question
                  </p>
                  <p className="mt-3 text-2xl font-semibold">
                    {cards[currentIndex].front || "Untitled question"}
                  </p>
                </div>
                <div className="flashcard-face flashcard-back">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    {cards[currentIndex].topic || "Untitled topic"}
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-600">
                    Answer
                  </p>
                  <p className="mt-3 text-2xl font-semibold">
                    {cards[currentIndex].back || "Answer unavailable"}
                  </p>
                </div>
              </div>
              <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] text-slate-500">
                Tap to flip • Swipe to navigate
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="game-button game-button-secondary flex-1 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={currentIndex === cards.length - 1}
                className="game-button game-button-primary flex-1 rounded-2xl px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
