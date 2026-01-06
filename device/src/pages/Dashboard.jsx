import { useRef } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const listRef = useRef(null);
  const stored = localStorage.getItem("studybuddy-quiz-history");
  const history = stored ? JSON.parse(stored) : [];
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.completedAt) - new Date(b.completedAt)
  );
  const latest = sortedHistory[sortedHistory.length - 1];
  const overall = sortedHistory.reduce(
    (acc, entry) => {
      acc.correct += entry.score || 0;
      acc.total += entry.total || 0;
      return acc;
    },
    { correct: 0, total: 0 }
  );

  const perTopicTotals = sortedHistory.reduce((acc, entry) => {
    if (!entry.perTopic) return acc;
    Object.entries(entry.perTopic).forEach(([topic, stats]) => {
      if (!acc[topic]) {
        acc[topic] = { correct: 0, total: 0 };
      }
      acc[topic].correct += stats.correct || 0;
      acc[topic].total += stats.total || 0;
    });
    return acc;
  }, {});

  const perTopicList = Object.entries(perTopicTotals).map(
    ([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
      percent: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0,
    })
  );

  const points = sortedHistory.map((entry, index) => {
    const percent = entry.total ? entry.score / entry.total : 0;
    return {
      x: index,
      y: percent,
      label: new Date(entry.completedAt).toLocaleString(),
    };
  });

  const chartWidth = 320;
  const chartHeight = 120;
  const chartPadding = 12;

  const path =
    points.length > 0
      ? points
          .map((point, index) => {
            const x =
              chartPadding +
              (points.length === 1
                ? 0
                : (point.x / (points.length - 1)) *
                  (chartWidth - chartPadding * 2));
            const y =
              chartPadding +
              (1 - point.y) * (chartHeight - chartPadding * 2);
            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  const scrollList = (direction) => {
    if (!listRef.current) return;
    listRef.current.scrollBy({ top: direction * 140, behavior: "smooth" });
  };

  return (
    <div className="flex h-[100dvh] flex-col gap-3 px-4 py-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Dashboard
        </h1>
        <Link
          to="/home"
          className="rounded-full border border-slate-600/70 px-4 py-2 text-sm text-slate-100"
        >
          Back
        </Link>
      </div>

      <div className="flex flex-1 items-start gap-3">
        <div
          ref={listRef}
          className="scroll-hidden h-[280px] flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4"
        >
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4 text-center">
            {latest ? (
              <>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Latest Quiz Score
                </p>
                <p className="mt-2 text-5xl font-semibold text-slate-50">
                  {latest.score} / {latest.total}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Completed {new Date(latest.completedAt).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-base text-slate-400">
                No quiz results yet. Complete a quiz to see your score.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Overall Progress
            </p>
            <p className="mt-2 text-4xl font-semibold text-slate-50">
              {overall.correct} / {overall.total}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {overall.total
                ? `${Math.round((overall.correct / overall.total) * 100)}% accuracy`
                : "No attempts yet"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Progress Over Time
            </p>
            {points.length === 0 ? (
              <p className="mt-3 text-base text-slate-400">
                No history yet. Finish quizzes to build your progress graph.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-[120px] flex-col justify-between text-xs text-slate-400">
                    <span>100%</span>
                    <span>0%</span>
                  </div>
                  <svg
                    width={chartWidth}
                    height={120}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="overflow-visible"
                  >
                    <path
                      d={path}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {points.map((point, index) => {
                      const x =
                        chartPadding +
                        (points.length === 1
                          ? 0
                          : (point.x / (points.length - 1)) *
                            (chartWidth - chartPadding * 2));
                      const y =
                        chartPadding +
                        (1 - point.y) * (chartHeight - chartPadding * 2);
                      return (
                        <circle
                          key={`point-${index}`}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#38bdf8"
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
                  {points.map((point, index) => (
                    <span key={`label-${index}`}>{point.label}</span>
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  {points.length} sessions • Average{" "}
                  {Math.round(
                    (points.reduce((sum, point) => sum + point.y, 0) /
                      points.length) *
                      100
                  )}
                  %
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Progress By Topic
            </p>
            {perTopicList.length === 0 ? (
              <p className="mt-3 text-base text-slate-400">
                No topic stats yet. Finish quizzes to see topic progress.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {perTopicList.map((topic) => (
                  <div
                    key={topic.topic}
                    className="rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-3"
                  >
                    <p className="text-base font-semibold text-slate-100">
                      {topic.topic}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {topic.correct}/{topic.total} correct • {topic.percent}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default Dashboard;
