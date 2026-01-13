const STORAGE_KEY = "studybuddy-streak";
const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (value) => String(value).padStart(2, "0");

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const fromDateKey = (key) => {
  if (!key) return null;
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const diffDays = (from, to) => {
  const fromStart = startOfDay(from).getTime();
  const toStart = startOfDay(to).getTime();
  return Math.round((toStart - fromStart) / DAY_MS);
};

const readStreak = () => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const writeStreak = (data) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getCurrentStreak = () => {
  const data = readStreak();
  if (!data?.lastUsed || !Number.isInteger(data?.count)) {
    return 0;
  }
  const lastDate = fromDateKey(data.lastUsed);
  if (!lastDate) return 0;
  const today = new Date();
  const daysApart = diffDays(lastDate, today);
  if (daysApart <= 1) {
    return data.count;
  }
  return 0;
};

export const recordStreakUsage = () => {
  const todayKey = toDateKey(new Date());
  const data = readStreak();

  if (data?.lastUsed === todayKey && Number.isInteger(data?.count)) {
    return data.count;
  }

  let nextCount = 1;
  if (data?.lastUsed && Number.isInteger(data?.count)) {
    const lastDate = fromDateKey(data.lastUsed);
    if (lastDate) {
      const daysApart = diffDays(lastDate, new Date());
      if (daysApart === 1) {
        nextCount = data.count + 1;
      }
    }
  }

  writeStreak({ lastUsed: todayKey, count: nextCount });
  return nextCount;
};
