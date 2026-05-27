import { Link } from "react-router-dom";
import { useTimer } from "../context/TimerContext";

const Timer = () => {
  const {
    focusMinutes,
    restMinutes,
    mode,
    remainingSeconds,
    isRunning,
    setFocusMinutes,
    setRestMinutes,
    start,
    pause,
    resume,
    reset,
  } = useTimer();

  const canStart = focusMinutes > 0 || restMinutes > 0;

  const formatTime = (seconds) => {
    const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    const minutes = Math.floor(safe / 60);
    const remaining = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full flex-col gap-3 px-3 py-3 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <h1 className="game-title text-2xl font-semibold text-slate-50">
          Session Timer
        </h1>
        <Link
          to="/home"
          className="game-button game-button-secondary rounded-full px-4 py-2 text-[10px] text-slate-100"
        >
          Back
        </Link>
      </div>

      <div className="grid flex-1 min-h-0 gap-3 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="game-panel flex flex-col justify-between rounded-2xl p-4">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Timer Settings
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    Focus
                  </span>
                  <span className="text-sm font-semibold text-emerald-200">
                    {focusMinutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  value={focusMinutes}
                  onChange={(event) =>
                    setFocusMinutes(Number(event.target.value))
                  }
                  className="game-slider"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0</span>
                  <span>120</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    Rest
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {restMinutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  value={restMinutes}
                  onChange={(event) =>
                    setRestMinutes(Number(event.target.value))
                  }
                  className="game-slider"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0</span>
                  <span>120</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                Current Mode
              </p>
              <p className="game-title mt-1 text-xl text-slate-50">
                {mode === "focus" ? "Focus" : "Rest"}
              </p>
              <p className="mt-1 text-3xl font-semibold text-emerald-200">
                {remainingSeconds === null
                  ? "--:--"
                  : formatTime(remainingSeconds)}
              </p>
            </div>
            <div className="flex gap-3">
              {isRunning ? (
                <button
                  type="button"
                  onClick={pause}
                  className="game-button game-button-secondary flex-1 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-50"
                >
                  Pause
                </button>
              ) : (
                <button
                  type="button"
                  onClick={remainingSeconds === null ? start : resume}
                  disabled={!canStart}
                  className="game-button game-button-primary flex-1 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
                >
                  {remainingSeconds === null ? "Start" : "Resume"}
                </button>
              )}
              <button
                type="button"
                onClick={reset}
                className="game-button game-button-secondary flex-1 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="game-panel rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Mission Brief
            </p>
            <p className="mt-2 text-sm text-slate-200">
              Lock in during focus mode, then recharge during rest. Stay
              consistent to keep your streak alive.
            </p>
          </div>
          <div className="game-panel rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Controls
            </p>
            <ul className="mt-2 space-y-2 text-[11px] text-slate-300">
              <li>Set your focus and rest minutes.</li>
              <li>Start the timer to enter focus mode.</li>
              <li>Switches to rest when focus hits zero.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
