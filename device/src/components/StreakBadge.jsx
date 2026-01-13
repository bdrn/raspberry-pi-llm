import { useEffect, useState } from "react";
import { getCurrentStreak } from "../lib/streak";

const StreakBadge = () => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const update = () => setStreak(getCurrentStreak());
    update();
    const intervalId = setInterval(update, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="game-button game-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-semibold text-slate-100">
      <span className="uppercase tracking-[0.3em] text-slate-400">
        Streak
      </span>
      <span className="text-base font-semibold text-slate-50">{streak}</span>
      {streak > 3 ? (
        <span aria-label="On a streak" role="img">
          🔥
        </span>
      ) : null}
    </div>
  );
};

export default StreakBadge;
