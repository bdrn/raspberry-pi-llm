import { Link } from "react-router-dom";
import { useMemo } from "react";
import { usePopQuiz } from "../context/PopQuizContext";

const PopQuizSettings = () => {
  const {
    settings,
    updateSettings,
    topics,
    loading,
    refreshQuizzes,
    lastSyncedAt,
  } = usePopQuiz();

  const selectedTopics = settings.selectedTopics || [];
  const usingAllTopics = selectedTopics.length === 0;

  const selectedSet = useMemo(() => {
    if (usingAllTopics) {
      return new Set(topics.map((topic) => topic.topic));
    }
    return new Set(selectedTopics);
  }, [selectedTopics, topics, usingAllTopics]);

  const toggleTopic = (topic) => {
    const next = new Set(selectedSet);
    if (next.has(topic)) {
      next.delete(topic);
    } else {
      next.add(topic);
    }
    updateSettings({ selectedTopics: Array.from(next) });
  };

  const handleSelectAll = () => {
    updateSettings({ selectedTopics: [] });
  };

  const allSelected =
    topics.length > 0 &&
    topics.every((topic) => selectedSet.has(topic.topic));

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Pop-up quiz
          </p>
          <h1 className="game-title text-3xl font-semibold text-slate-50">
            Schedule your pop-ups
          </h1>
        </div>
        <Link
          to="/home"
          className="game-button game-button-primary rounded-full px-5 py-2 text-xs font-semibold"
        >
          Repeat now
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="game-scroll scroll-hidden h-[360px] space-y-4 overflow-y-auto rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Topics to include
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="game-button game-button-secondary rounded-full px-3 py-1 text-[10px] font-semibold"
              >
                {allSelected ? "All selected" : "Select all"}
              </button>
              <button
                type="button"
                onClick={refreshQuizzes}
                className="game-button game-button-secondary rounded-full px-3 py-1 text-[10px] font-semibold"
              >
                Sync
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading topics...</p>
          ) : topics.length === 0 ? (
            <p className="text-sm text-slate-400">
              No topics yet. Upload quizzes on the dashboard first.
            </p>
          ) : (
            <div className="space-y-3">
              {topics.map((topic) => {
                const isSelected = selectedSet.has(topic.topic);
                return (
                  <label
                    key={topic.topic}
                    className={`game-panel flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-slate-100 transition ${
                      isSelected
                        ? "border-emerald-400/80 bg-slate-900/80"
                        : "border-slate-800/80 bg-slate-900/50"
                    }`}
                  >
                    <div>
                      <p className="text-lg font-semibold">{topic.topic}</p>
                      <p className="text-xs text-slate-400">
                        {topic.questionCount} questions • {topic.quizCount} quizzes
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTopic(topic.topic)}
                      className="h-6 w-6 rounded-full border-slate-500 bg-slate-900 text-slate-50 accent-emerald-400"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="game-panel rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Pop-up frequency
              </p>
              <span className="text-base font-semibold text-emerald-200">
                {settings.frequencyMinutes} min
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="120"
              step="1"
              value={settings.frequencyMinutes}
              onChange={(event) =>
                updateSettings({
                  frequencyMinutes: Number(event.target.value),
                })
              }
              className="game-slider mt-4"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>1</span>
              <span>120</span>
            </div>
          </div>

          <div className="game-panel rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Max questions
              </p>
              <span className="text-base font-semibold text-emerald-200">
                {settings.maxQuestions}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={settings.maxQuestions}
              onChange={(event) =>
                updateSettings({ maxQuestions: Number(event.target.value) })
              }
              className="game-slider mt-4"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>1</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {usingAllTopics
              ? "All topics included"
              : `${selectedSet.size} topics selected`}
          </span>
          <span>
            {lastSyncedAt
              ? `Last sync ${new Date(lastSyncedAt).toLocaleTimeString()}`
              : "Not synced yet"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PopQuizSettings;
