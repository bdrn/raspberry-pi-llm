import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TimerContext = createContext(null);

const clampMinutes = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, Math.min(120, Math.round(numeric)));
};

const toSeconds = (minutes) => Math.max(0, Math.round(minutes)) * 60;

export const TimerProvider = ({ children }) => {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [restMinutes, setRestMinutes] = useState(5);
  const [mode, setMode] = useState("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return undefined;

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          if (mode === "focus" && restMinutes > 0) {
            setMode("rest");
            return toSeconds(restMinutes);
          }
          if (mode === "rest" && focusMinutes > 0) {
            setMode("focus");
            return toSeconds(focusMinutes);
          }
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [focusMinutes, isRunning, mode, restMinutes]);

  const start = () => {
    const focusSeconds = toSeconds(focusMinutes);
    const restSeconds = toSeconds(restMinutes);
    if (focusSeconds === 0 && restSeconds > 0) {
      setMode("rest");
      setRemainingSeconds(restSeconds);
    } else {
      setMode("focus");
      setRemainingSeconds(focusSeconds);
    }
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const resume = () => {
    if (remainingSeconds === null) {
      start();
      return;
    }
    setIsRunning(true);
  };

  const reset = () => {
    setIsRunning(false);
    setMode("focus");
    setRemainingSeconds(null);
  };

  const value = useMemo(
    () => ({
      focusMinutes,
      restMinutes,
      mode,
      remainingSeconds,
      isRunning,
      setFocusMinutes: (value) => setFocusMinutes(clampMinutes(value)),
      setRestMinutes: (value) => setRestMinutes(clampMinutes(value)),
      start,
      pause,
      resume,
      reset,
    }),
    [focusMinutes, restMinutes, mode, remainingSeconds, isRunning]
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within TimerProvider");
  }
  return context;
};
