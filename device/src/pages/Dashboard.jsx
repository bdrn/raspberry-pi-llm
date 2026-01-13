import { Link } from "react-router-dom";
import { getCurrentStreak } from "../lib/streak";

const Dashboard = () => {
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
  const sessions = sortedHistory.length;
  const streak = getCurrentStreak();
  const accuracy = overall.total
    ? `${Math.round((overall.correct / overall.total) * 100)}%`
    : "--";

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

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-4 py-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="game-title text-3xl font-semibold text-slate-50">
          Dashboard
        </h1>
        <Link
          to="/home"
          className="game-button game-button-secondary rounded-full px-4 py-2 text-xs text-slate-100"
        >
          Back
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        <div className="game-scroll scroll-hidden h-full w-full flex-1 overflow-y-auto rounded-2xl p-2">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              {
                label: "Latest",
                value: latest ? `${latest.score}/${latest.total}` : "--",
                detail: latest
                  ? new Date(latest.completedAt).toLocaleDateString()
                  : "No sessions",
              },
              {
                label: "Overall",
                value: `${overall.correct}/${overall.total}`,
                detail: overall.total ? "Accuracy" : "No attempts",
              },
              {
                label: "Accuracy",
                value: accuracy,
                detail: overall.total ? "Correct ratio" : "No data",
              },
              {
                label: "Streak",
                value: `${streak}`,
                detail: "Days",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="game-panel flex aspect-square w-full flex-col items-center justify-center rounded-2xl p-3 text-center"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  {item.label}
                </p>
                <p className="game-title mt-2 text-2xl font-semibold text-slate-50">
                  {item.value}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {item.detail}
                </p>
              </div>
            ))}

            <div className="game-panel rounded-2xl p-3 sm:col-span-2">
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
                        stroke="#22d3ee"
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
                            fill="#34d399"
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

            <div className="game-panel rounded-2xl p-3 sm:col-span-2">
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
                      className="game-panel rounded-xl px-3 py-2"
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
