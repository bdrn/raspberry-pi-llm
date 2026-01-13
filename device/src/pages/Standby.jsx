import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentStreak } from "../lib/streak";

const Standby = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isPowering, setIsPowering] = useState(false);
  const [now, setNow] = useState(new Date());

  const widgets = useMemo(() => {
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
    const accuracy = overall.total
      ? `${Math.round((overall.correct / overall.total) * 100)}%`
      : "--";
    const sessions = sortedHistory.length;
    const streak = getCurrentStreak();

    return [
      {
        label: "Latest Score",
        value: latest ? `${latest.score}/${latest.total}` : "--",
        detail: latest
          ? new Date(latest.completedAt).toLocaleDateString()
          : "No sessions yet",
      },
      {
        label: "Accuracy",
        value: accuracy,
        detail: overall.total ? `${overall.total} answers tracked` : "No data",
      },
      {
        label: "Sessions",
        value: sessions ? `${sessions}` : "0",
        detail: sessions ? "Total runs completed" : "Start a quiz to begin",
      },
      {
        label: "Streak",
        value: `${streak} days`,
        detail: streak > 0 ? "Keep it alive" : "Start a new streak",
      },
    ];
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (widgets.length <= 1) return undefined;
    let timeoutId;
    const intervalId = setInterval(() => {
      setIsPulsing(true);
      timeoutId = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % widgets.length);
        setIsPulsing(false);
      }, 400);
    }, 60000);
    return () => {
      clearInterval(intervalId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [widgets.length]);

  const activeWidget = widgets[activeIndex];
  const clock = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateLabel = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="standby-shell relative flex h-full w-full flex-col items-center justify-center gap-10 px-6 py-6 text-center">
      <div
        className={`standby-panel w-[260px] rounded-3xl px-6 py-6 text-center ${
          isPulsing ? "standby-pulse" : ""
        }`}
      >
        <div className="mb-4 space-y-1 text-center">
          <p className="text-xl font-semibold text-zinc-500">{clock}</p>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">
            {dateLabel}
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">
          {activeWidget.label}
        </p>
        <p className="mt-3 text-4xl font-semibold text-zinc-400">
          {activeWidget.value}
        </p>
        <p className="mt-2 text-xs text-zinc-600">
          {activeWidget.detail}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          if (isPowering) return;
          setIsPowering(true);
          setTimeout(() => navigate("/home"), 900);
        }}
        className="standby-power"
        disabled={isPowering}
      >
        Power
      </button>
      {isPowering ? (
        <div className="power-up-overlay" aria-hidden="true">
          <div className="power-up-core">
            <span className="power-up-text">Booting...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Standby;
