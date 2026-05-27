import { useEffect, useMemo, useState } from "react";
import api from "../api";
import UploadBox from "../components/UploadBox";
import QuizCard from "../components/QuizCard";
import { Card } from "@/components/ui/card";

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const [uploadHistory, setUploadHistory] = useState([]);
  const [progressSessions, setProgressSessions] = useState([]);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get("/sync");
      setQuizzes(response.data.quizzes);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await api.get("/progress");
      setProgressSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch progress:", error);
      setProgressSessions([]);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchProgress();
  }, []);

  const topics = useMemo(() => {
    const set = new Set();
    quizzes.forEach((quiz) => {
      const topic = quiz.quiz_data?.meta?.topic || quiz.topic;
      if (topic) set.add(topic);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    let result = [...quizzes];

    if (topicFilter !== "all") {
      result = result.filter((quiz) => {
        const topic = quiz.quiz_data?.meta?.topic || quiz.topic;
        return topic === topicFilter;
      });
    }

    if (term) {
      result = result.filter((quiz) => {
        const topic = quiz.quiz_data?.meta?.topic || quiz.topic || "";
        return (
          topic.toLowerCase().includes(term) ||
          quiz.filename.toLowerCase().includes(term)
        );
      });
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === "title") {
        const aTitle = a.quiz_data?.meta?.topic || a.topic || a.filename;
        const bTitle = b.quiz_data?.meta?.topic || b.topic || b.filename;
        return aTitle.localeCompare(bTitle);
      }
      if (sortBy === "questions") {
        const aCount = a.quiz_data?.questions?.length || 0;
        const bCount = b.quiz_data?.questions?.length || 0;
        return bCount - aCount;
      }
      return 0;
    });

    return result;
  }, [quizzes, searchQuery, sortBy, topicFilter]);

  const topicAnalytics = useMemo(() => {
    const totals = new Map();
    progressSessions.forEach((session) => {
      const perTopic = session.per_topic || {};
      Object.entries(perTopic).forEach(([topic, stats]) => {
        if (!totals.has(topic)) {
          totals.set(topic, { correct: 0, total: 0, lastUpdated: session.created_at });
        }
        const entry = totals.get(topic);
        entry.correct += stats.correct || 0;
        entry.total += stats.total || 0;
        if (new Date(session.created_at) > new Date(entry.lastUpdated)) {
          entry.lastUpdated = session.created_at;
        }
      });
    });
    return Array.from(totals.entries())
      .map(([topic, stats]) => ({
        topic,
        correct: stats.correct,
        total: stats.total,
        percent: stats.total
          ? Math.round((stats.correct / stats.total) * 100)
          : 0,
        lastUpdated: stats.lastUpdated,
      }))
      .sort((a, b) => b.total - a.total);
  }, [progressSessions]);

  const handleUploadSuccess = (newQuizData) => {
    console.log("Upload success:", newQuizData);
    setUploadHistory((prev) => {
      const entry = {
        id: newQuizData.filename,
        topic: newQuizData.topic || "Untitled",
        createdAt: new Date().toISOString(),
      };
      return [entry, ...prev].slice(0, 5);
    });
    fetchQuizzes();
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setEditDraft(JSON.parse(JSON.stringify(quiz.quiz_data || {})));
    setSaveState("idle");
  };

  const handleDraftChange = (path, value) => {
    setEditDraft((prev) => {
      const next = { ...prev };
      const parts = path.split(".");
      let ref = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        if (!ref[parts[i]]) ref[parts[i]] = {};
        ref = ref[parts[i]];
      }
      ref[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleQuestionChange = (index, field, value) => {
    setEditDraft((prev) => {
      const next = { ...prev };
      const questions = Array.isArray(next.questions) ? [...next.questions] : [];
      questions[index] = { ...questions[index], [field]: value };
      next.questions = questions;
      return next;
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setEditDraft((prev) => {
      const next = { ...prev };
      const questions = Array.isArray(next.questions) ? [...next.questions] : [];
      const question = { ...questions[questionIndex] };
      const options = Array.isArray(question.options) ? [...question.options] : [];
      options[optionIndex] = value;
      question.options = options;
      questions[questionIndex] = question;
      next.questions = questions;
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedQuiz || !editDraft) return;
    setSaveState("saving");
    try {
      const payload = {
        topic: editDraft.meta?.topic || selectedQuiz.topic,
        quiz_data: editDraft,
      };
      const response = await api.put(`/quizzes/${selectedQuiz.id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const updatedQuiz = response.data.quiz;
      setSaveState("saved");
      setSelectedQuiz(updatedQuiz);
      setEditDraft(JSON.parse(JSON.stringify(updatedQuiz.quiz_data || {})));
      fetchQuizzes();
    } catch (error) {
      console.error("Failed to save quiz:", error);
      setSaveState("error");
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.26em] theme-muted">
          Dashboard
        </p>
        <h1 className="game-title text-3xl font-semibold theme-text">
          Your study library
        </h1>
        <p className="max-w-2xl text-sm theme-muted">
          Upload lecture notes and turn them into bite-sized quizzes that stay
          in sync with your Study Buddy device.
        </p>
      </header>

      <Card>
        <UploadBox onUploadSuccess={handleUploadSuccess} />
      </Card>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.22em] theme-muted">
              Available on device
            </h2>
            {quizzes.length > 0 && !loadingData && (
              <span className="text-xs theme-muted">
                {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="search"
              placeholder="Search quizzes or topics..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="theme-input w-full rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none lg:w-[240px]"
            />
            <select
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value)}
              className="theme-input rounded-xl px-4 py-2 text-sm focus:outline-none"
            >
              <option value="all">All topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="theme-input rounded-xl px-4 py-2 text-sm focus:outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A-Z</option>
              <option value="questions">Most questions</option>
            </select>
          </div>

          {loadingData ? (
            <p className="text-sm theme-muted">Loading your library…</p>
          ) : filteredQuizzes.length === 0 ? (
            <p className="text-sm italic theme-subtle">
              No quizzes match the filters yet.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredQuizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  type="button"
                  onClick={() => handleSelectQuiz(quiz)}
                  className={`w-full text-left transition ${
                    selectedQuiz?.id === quiz.id
                      ? "theme-ring"
                      : ""
                  }`}
                >
                  <QuizCard quiz={quiz} />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.22em] theme-muted">
              Upload history
            </h3>
            {uploadHistory.length === 0 ? (
              <p className="mt-3 text-sm theme-subtle">
                Uploads will appear here.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm theme-muted">
                {uploadHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="theme-surface flex items-center justify-between rounded-lg px-3 py-2"
                  >
                    <span className="theme-text">{entry.topic}</span>
                    <span className="text-xs theme-subtle">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.22em] theme-muted">
              Topic analytics
            </h3>
            {topicAnalytics.length === 0 ? (
              <p className="mt-3 text-sm theme-subtle">
                Complete quizzes on the device to see topic progress.
              </p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm theme-muted">
                {topicAnalytics.map((topic) => (
                  <li
                    key={topic.topic}
                    className="theme-surface rounded-lg px-3 py-2"
                  >
                    <p className="text-sm font-semibold theme-text">
                      {topic.topic}
                    </p>
                    <p className="mt-1 text-xs theme-muted">
                      {topic.correct}/{topic.total} correct • {topic.percent}%
                    </p>
                    <p className="mt-1 text-xs theme-subtle">
                      Updated {new Date(topic.lastUpdated).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.22em] theme-muted">
              Preview & edit
            </h3>
            {!selectedQuiz || !editDraft ? (
              <p className="mt-3 text-sm theme-subtle">
                Select a quiz to preview and edit.
              </p>
            ) : (
              <div className="mt-3 space-y-4 text-sm theme-muted">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] theme-muted">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={editDraft.meta?.topic || ""}
                    onChange={(event) =>
                      handleDraftChange("meta.topic", event.target.value)
                    }
                    className="theme-input w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  {(editDraft.questions || []).map((question, index) => (
                    <div
                      key={question.id || index}
                      className="theme-surface rounded-lg p-3"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] theme-subtle">
                        {question.type === "flashcard"
                          ? "Flashcard"
                          : "MCQ"}
                      </p>
                      {question.type === "flashcard" ? (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            value={question.front || ""}
                            onChange={(event) =>
                              handleQuestionChange(
                                index,
                                "front",
                                event.target.value
                              )
                            }
                            className="theme-input w-full rounded-md px-2 py-1 text-sm"
                            placeholder="Front"
                          />
                          <textarea
                            value={question.back || ""}
                            onChange={(event) =>
                              handleQuestionChange(
                                index,
                                "back",
                                event.target.value
                              )
                            }
                            className="theme-input w-full rounded-md px-2 py-1 text-sm"
                            rows={2}
                            placeholder="Back"
                          />
                        </div>
                      ) : (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={question.question || ""}
                            onChange={(event) =>
                              handleQuestionChange(
                                index,
                                "question",
                                event.target.value
                              )
                            }
                            className="theme-input w-full rounded-md px-2 py-1 text-sm"
                            rows={2}
                            placeholder="Question text"
                          />
                          <div className="space-y-2">
                            {(question.options || []).map((option, optIndex) => (
                              <input
                                key={`${index}-opt-${optIndex}`}
                                type="text"
                                value={option}
                                onChange={(event) =>
                                  handleOptionChange(
                                    index,
                                    optIndex,
                                    event.target.value
                                  )
                                }
                                className="theme-input w-full rounded-md px-2 py-1 text-sm"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                            ))}
                          </div>
                          <textarea
                            value={question.explanation || ""}
                            onChange={(event) =>
                              handleQuestionChange(
                                index,
                                "explanation",
                                event.target.value
                              )
                            }
                            className="theme-input w-full rounded-md px-2 py-1 text-sm"
                            rows={2}
                            placeholder="Explanation"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="game-button game-button-primary w-full rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  {saveState === "saving"
                    ? "Saving..."
                    : saveState === "saved"
                    ? "Saved!"
                    : "Save changes"}
                </button>
                {saveState === "error" && (
                  <p className="text-xs text-rose-400">
                    Failed to save. Please try again.
                  </p>
                )}
              </div>
            )}
          </Card>
        </aside>
      </section>
    </div>
  );
};

export default Home;
