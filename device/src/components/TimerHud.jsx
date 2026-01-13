import { useMemo } from "react";
import { useTimer } from "../context/TimerContext";

const formatTime = (seconds) => {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
};

const TimerHud = ({ className = "" }) => {
  const { remainingSeconds, mode } = useTimer();

  const display = useMemo(() => {
    if (remainingSeconds === null) return null;
    return `${mode === "focus" ? "Focus" : "Rest"} - ${formatTime(
      remainingSeconds
    )}`;
  }, [mode, remainingSeconds]);

  if (!display) return null;

  return (
    <div className={`pointer-events-none ${className}`.trim()}>
      <div className="game-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-slate-100 shadow-[0_0_18px_rgba(34,211,238,0.35)]">
        <span className="tracking-[0.2em]">{display}</span>
      </div>
    </div>
  );
};

export default TimerHud;
