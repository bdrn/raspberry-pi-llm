import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../api";

const STORAGE_KEY = "studybuddy-pop-quiz-settings";
const DEFAULT_SETTINGS = {
  frequencyMinutes: 30,
  maxQuestions: 3,
  selectedTopics: [],
};

const clampNumber = (value, min, max, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const rounded = Math.round(numeric);
  return Math.max(min, Math.min(max, rounded));
};

const normalizeSettings = (next) => {
  const safe = next || {};
  return {
    frequencyMinutes: clampNumber(
      safe.frequencyMinutes,
      1,
      240,
      DEFAULT_SETTINGS.frequencyMinutes
    ),
    maxQuestions: clampNumber(
      safe.maxQuestions,
      1,
      20,
      DEFAULT_SETTINGS.maxQuestions
    ),
    selectedTopics: Array.isArray(safe.selectedTopics)
      ? safe.selectedTopics.filter(Boolean)
      : [],
  };
};

const loadSettings = () => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return normalizeSettings({ ...DEFAULT_SETTINGS, ...parsed });
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const getTopicLabel = (quiz) =>
  quiz.topic || quiz.quiz_data?.meta?.topic || "Untitled topic";

const buildTopics = (quizzes) => {
  const map = new Map();
  quizzes.forEach((quiz) => {
    const topic = getTopicLabel(quiz);
    const questions = Array.isArray(quiz.quiz_data?.questions)
      ? quiz.quiz_data.questions
      : [];
    if (!map.has(topic)) {
      map.set(topic, { topic, questionCount: 0, quizCount: 0 });
    }
    const entry = map.get(topic);
    entry.quizCount += 1;
    entry.questionCount += questions.length;
  });
  return Array.from(map.values()).sort((a, b) =>
    a.topic.localeCompare(b.topic)
  );
};

const buildQuestionPool = (quizzes, selectedTopics) => {
  const allowAll = !selectedTopics || selectedTopics.length === 0;
  const allowed = new Set(selectedTopics || []);
  const pool = [];

  quizzes.forEach((quiz) => {
    const topic = getTopicLabel(quiz);
    if (!allowAll && !allowed.has(topic)) return;
    const questions = Array.isArray(quiz.quiz_data?.questions)
      ? quiz.quiz_data.questions
      : [];

    questions.forEach((question, index) => {
      const type = question?.type || "mcq";
      if (type !== "mcq") return;
      pool.push({ quizId: quiz.id, question, index, topic });
    });
  });

  return pool;
};

const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pickQuestions = (pool, maxQuestions) => {
  if (!pool.length) return [];
  if (pool.length <= maxQuestions) return shuffle(pool);
  return shuffle(pool).slice(0, maxQuestions);
};

const PopQuizContext = createContext(null);

export const PopQuizProvider = ({ children, isBlocked }) => {
  const [settings, setSettings] = useState(loadSettings);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [pending, setPending] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const settingsRef = useRef(settings);
  const quizzesRef = useRef(quizzes);
  const blockedRef = useRef(isBlocked);
  const activeQuizRef = useRef(activeQuiz);

  useEffect(() => {
    settingsRef.current = settings;
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    quizzesRef.current = quizzes;
  }, [quizzes]);

  useEffect(() => {
    blockedRef.current = isBlocked;
  }, [isBlocked]);

  useEffect(() => {
    activeQuizRef.current = activeQuiz;
  }, [activeQuiz]);

  const refreshQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/sync");
      setQuizzes(response.data.quizzes || []);
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshQuizzes();
  }, [refreshQuizzes]);

  const topics = useMemo(() => buildTopics(quizzes), [quizzes]);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => normalizeSettings({ ...prev, ...patch }));
  }, []);

  const triggerQuiz = useCallback((reason = "scheduled") => {
    if (activeQuizRef.current) return false;
    const { maxQuestions, selectedTopics } = settingsRef.current;
    const pool = buildQuestionPool(quizzesRef.current, selectedTopics);
    const selected = pickQuestions(pool, maxQuestions);
    if (!selected.length) return false;
    setActiveQuiz({
      questions: selected,
      startedAt: new Date().toISOString(),
      reason,
    });
    return true;
  }, []);

  const closeQuiz = useCallback(() => {
    setActiveQuiz(null);
  }, []);

  useEffect(() => {
    const frequency = settings.frequencyMinutes;
    if (!frequency || frequency <= 0) return undefined;
    const intervalMs = frequency * 60 * 1000;

    const intervalId = setInterval(() => {
      if (blockedRef.current || activeQuizRef.current) {
        setPending(true);
        return;
      }
      triggerQuiz("scheduled");
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [settings.frequencyMinutes, triggerQuiz]);

  useEffect(() => {
    if (!pending) return;
    if (blockedRef.current || activeQuizRef.current) return;
    setPending(false);
    triggerQuiz("pending");
  }, [pending, triggerQuiz]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      topics,
      quizzes,
      loading,
      refreshQuizzes,
      lastSyncedAt,
      activeQuiz,
      closeQuiz,
    }),
    [
      settings,
      updateSettings,
      topics,
      quizzes,
      loading,
      refreshQuizzes,
      lastSyncedAt,
      activeQuiz,
      closeQuiz,
    ]
  );

  return (
    <PopQuizContext.Provider value={value}>
      {children}
    </PopQuizContext.Provider>
  );
};

export const usePopQuiz = () => {
  const context = useContext(PopQuizContext);
  if (!context) {
    throw new Error("usePopQuiz must be used within PopQuizProvider");
  }
  return context;
};
