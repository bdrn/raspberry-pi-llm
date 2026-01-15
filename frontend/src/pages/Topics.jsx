import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Card } from "@/components/ui/card";

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [draftName, setDraftName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizDraft, setQuizDraft] = useState(null);
  const [actionState, setActionState] = useState("idle");

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await api.get("/topics");
      setTopics(response.data.topics || []);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await api.get("/sync");
      const list = response.data.quizzes || [];
      setQuizzes(list);
      return list;
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
      setQuizzes([]);
      return [];
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchQuizzes();
  }, []);

  const filteredTopics = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((topic) =>
      topic.topic.toLowerCase().includes(term)
    );
  }, [query, topics]);

  const quizzesForTopic = useMemo(() => {
    if (!selectedTopic) return [];
    return quizzes.filter((quiz) => {
      const topic = quiz.quiz_data?.meta?.topic || quiz.topic || "Untitled";
      return topic === selectedTopic;
    });
  }, [quizzes, selectedTopic]);

  const handleRename = async () => {
    if (!selectedTopic || !draftName.trim()) return;
    setActionState("saving");
    try {
      await api.put(
        "/topics/rename",
        { old_topic: selectedTopic, new_topic: draftName.trim() },
        { headers: { "Content-Type": "application/json" } }
      );
      setSelectedTopic(draftName.trim());
      setActionState("saved");
      fetchTopics();
      fetchQuizzes();
    } catch (error) {
      console.error("Failed to rename topic:", error);
      setActionState("error");
    }
  };

  const handleRemove = async (topicName) => {
    const confirmed = window.confirm(
      `Remove "${topicName}" from all quizzes? This does not delete quizzes.`
    );
    if (!confirmed) return;
    setActionState("saving");
    try {
      await api.put(
        "/topics/remove",
        { topic: topicName },
        { headers: { "Content-Type": "application/json" } }
      );
      if (selectedTopic === topicName) {
        setSelectedTopic(null);
        setSelectedQuizId(null);
        setQuizDraft(null);
      }
      setDraftName("");
      setActionState("saved");
      fetchTopics();
      fetchQuizzes();
    } catch (error) {
      console.error("Failed to remove topic:", error);
      setActionState("error");
    }
  };

  const handleCreateTopic = async () => {
    const name = newTopicName.trim();
    if (!name) return;
    setActionState("saving");
    try {
      await api.post(
        "/topics",
        { topic: name },
        { headers: { "Content-Type": "application/json" } }
      );
      setNewTopicName("");
      setActionState("saved");
      await fetchTopics();
      const nextQuizzes = await fetchQuizzes();
      setSelectedTopic(name);
      const createdQuiz = nextQuizzes.find((quiz) => {
        const topic = quiz.quiz_data?.meta?.topic || quiz.topic || "Untitled";
        return topic === name;
      });
      if (createdQuiz) {
        setSelectedQuizId(createdQuiz.id);
        setQuizDraft(JSON.parse(JSON.stringify(createdQuiz.quiz_data || {})));
      } else {
        setSelectedQuizId(null);
        setQuizDraft(null);
      }
    } catch (error) {
      console.error("Failed to create topic:", error);
      setActionState("error");
    }
  };

  const handleSelectTopic = (topicName) => {
    if (selectedTopic === topicName) {
      setSelectedTopic(null);
      setSelectedQuizId(null);
      setQuizDraft(null);
      setDraftName("");
      return;
    }

    setSelectedTopic(topicName);
    setDraftName(topicName);
    const firstQuiz = quizzes.find((quiz) => {
      const topic = quiz.quiz_data?.meta?.topic || quiz.topic || "Untitled";
      return topic === topicName;
    });
    if (firstQuiz) {
      setSelectedQuizId(firstQuiz.id);
      setQuizDraft(JSON.parse(JSON.stringify(firstQuiz.quiz_data || {})));
    } else {
      setSelectedQuizId(null);
      setQuizDraft(null);
    }
  };

  const handleSelectQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    const quiz = quizzes.find((item) => item.id === quizId);
    if (quiz) {
      setQuizDraft(JSON.parse(JSON.stringify(quiz.quiz_data || {})));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizDraft((prev) => {
      const next = { ...prev };
      const questions = Array.isArray(next.questions) ? [...next.questions] : [];
      questions[index] = { ...questions[index], [field]: value };
      next.questions = questions;
      next.meta = {
        ...(next.meta || {}),
        total_questions: questions.length,
      };
      return next;
    });
  };

  const handleToggleMultipleAnswers = (index, enabled) => {
    setQuizDraft((prev) => {
      const next = { ...prev };
      const questions = Array.isArray(next.questions) ? [...next.questions] : [];
      const question = { ...questions[index] };
      question.multiple_answers = enabled;
      if (enabled) {
        const current = Number.isInteger(question.correct_index)
          ? [question.correct_index]
          : [];
        question.correct_indices = Array.isArray(question.correct_indices)
          ? question.correct_indices
          : current;
      } else {
        const first = Array.isArray(question.correct_indices)
          ? question.correct_indices[0]
          : question.correct_index;
        question.correct_index = Number.isInteger(first) ? first : 0;
        question.correct_indices = [];
      }
      questions[index] = question;
      next.questions = questions;
      return next;
    });
  };

  const handleCorrectToggle = (index, optionIndex, checked) => {
    setQuizDraft((prev) => {
      const next = { ...prev };
      const questions = Array.isArray(next.questions) ? [...next.questions] : [];
      const question = { ...questions[index] };
      const multiple = Boolean(question.multiple_answers);
      if (multiple) {
        const existing = Array.isArray(question.correct_indices)
          ? [...question.correct_indices]
          : [];
        if (checked) {
          if (!existing.includes(optionIndex)) existing.push(optionIndex);
        } else {
          const filtered = existing.filter((value) => value !== optionIndex);
          question.correct_indices = filtered;
        }
        question.correct_indices = Array.isArray(question.correct_indices)
          ? question.correct_indices
          : existing;
      } else {
        question.correct_index = optionIndex;
      }
      questions[index] = question;
      next.questions = questions;
      return next;
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizDraft((prev) => {
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

  const handleAddQuestion = () => {
    if (!quizDraft) return;
    setQuizDraft((prev) => {
      const next = { ...prev };
      const questions = Array.isArray(next.questions) ? [...next.questions] : [];
      if (newQuestionType === "flashcard") {
        questions.push({
          id: Date.now(),
          type: "flashcard",
          front: "",
          back: "",
        });
      } else {
        questions.push({
          id: Date.now(),
          type: "mcq",
          question: "",
          options: ["", "", "", ""],
          correct_index: 0,
          correct_indices: [],
          multiple_answers: false,
          explanation: "",
        });
      }
      next.questions = questions;
      next.meta = {
        ...(next.meta || {}),
        total_questions: questions.length,
      };
      return next;
    });
  };

  const handleDeleteQuestion = (index) => {
    setQuizDraft((prev) => {
      const next = { ...prev };
      const questions = Array.isArray(next.questions) ? [...next.questions] : [];
      questions.splice(index, 1);
      next.questions = questions;
      next.meta = {
        ...(next.meta || {}),
        total_questions: questions.length,
      };
      return next;
    });
  };

  const handleSaveQuestions = async () => {
    if (!selectedQuizId || !quizDraft) return;
    setActionState("saving");
    try {
      await api.put(
        `/quizzes/${selectedQuizId}`,
        {
          topic: quizDraft.meta?.topic || selectedTopic,
          quiz_data: quizDraft,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      setActionState("saved");
      await fetchQuizzes();
    } catch (error) {
      console.error("Failed to save questions:", error);
      setActionState("error");
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.26em] theme-muted">
          Topics
        </p>
        <h1 className="game-title text-3xl font-semibold theme-text">
          Manage topics
        </h1>
        <p className="max-w-2xl text-sm theme-muted">
          Edit or remove topics across quizzes to keep your library organized.
        </p>
      </header>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            type="search"
            placeholder="Search topics..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="theme-input w-full rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none md:w-[260px]"
          />
          <span className="text-xs theme-muted">
            {topics.length} {topics.length === 1 ? "topic" : "topics"}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="New topic name"
            value={newTopicName}
            onChange={(event) => setNewTopicName(event.target.value)}
            className="theme-input w-full rounded-xl px-4 py-2 text-sm focus:outline-none md:w-[260px]"
          />
          <button
            type="button"
            onClick={handleCreateTopic}
            className="game-button game-button-primary rounded-full px-4 py-2 text-xs font-semibold"
          >
            Add topic
          </button>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm theme-muted">Loading topics…</p>
      ) : filteredTopics.length === 0 ? (
        <p className="text-sm italic theme-subtle">
          No topics found yet.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <Card key={topic.topic} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold theme-text">
                    {topic.topic}
                  </h2>
                  <p className="mt-1 text-xs theme-muted">
                    {topic.quizzes} quizzes • {topic.questions} questions
                  </p>
                  <p className="mt-1 text-xs theme-subtle">
                    Updated {new Date(topic.last_updated).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTopic(topic.topic)}
                    className="game-button game-button-secondary rounded-full px-4 py-1.5 text-xs font-medium"
                  >
                    Manage
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(topic.topic)}
                    className="rounded-full border border-rose-400/70 px-4 py-1.5 text-xs font-medium text-rose-200 transition hover:border-rose-300"
                  >
                    Remove topic
                  </button>
                </div>
              </div>

            </Card>
          ))}
        </div>
      )}

      <Card className="p-4">
        <h3 className="text-xs font-medium uppercase tracking-[0.22em] theme-muted">
          Questions by topic
        </h3>
        {!selectedTopic ? (
          <p className="mt-3 text-sm theme-subtle">
            Select a topic to create, update, or delete questions.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs uppercase tracking-[0.2em] theme-muted">
                Topic name
              </label>
              <input
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="theme-input w-full rounded-xl px-4 py-2 text-sm focus:outline-none md:w-[280px]"
              />
              <button
                type="button"
                onClick={handleRename}
                className="game-button game-button-primary rounded-full px-4 py-2 text-xs font-semibold"
              >
                Save name
              </button>
              {actionState === "error" && (
                <span className="text-xs text-rose-400">
                  Failed to save changes.
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold theme-text">
                {selectedTopic}
              </span>
              <select
                value={selectedQuizId || ""}
                onChange={(event) =>
                  handleSelectQuiz(Number(event.target.value))
                }
                className="theme-input rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                <option value="" disabled>
                  Choose quiz source
                </option>
                {quizzesForTopic.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.filename}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="game-button game-button-secondary rounded-full px-4 py-2 text-xs font-semibold"
              >
                Add question
              </button>
            </div>

            {!quizDraft ? (
              <p className="text-sm theme-subtle">
                Choose a quiz to edit its questions.
              </p>
            ) : (
              <div className="space-y-3">
                {(quizDraft.questions || []).map((question, index) => (
                  <div
                    key={question.id || index}
                    className="theme-surface rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] theme-subtle">
                        {question.type === "flashcard" ? "Flashcard" : "MCQ"}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(index)}
                        className="text-xs text-rose-300 hover:text-rose-200"
                      >
                        Delete
                      </button>
                    </div>
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
                        <label className="flex items-center gap-2 text-xs theme-muted">
                          <input
                            type="checkbox"
                            checked={Boolean(question.multiple_answers)}
                            onChange={(event) =>
                              handleToggleMultipleAnswers(index, event.target.checked)
                            }
                            className="h-4 w-4 rounded border-[var(--theme-input-border)] text-[var(--theme-text)] accent-emerald-400"
                          />
                          Multiple answers
                        </label>
                        <div className="space-y-2">
                          {(question.options || []).map((option, optIndex) => (
                            <div
                              key={`${index}-opt-${optIndex}`}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  Boolean(question.multiple_answers)
                                    ? Array.isArray(question.correct_indices) &&
                                      question.correct_indices.includes(optIndex)
                                    : question.correct_index === optIndex
                                }
                                onChange={(event) =>
                                  handleCorrectToggle(
                                    index,
                                    optIndex,
                                    event.target.checked
                                  )
                                }
                                className="h-4 w-4 rounded border-[var(--theme-input-border)] text-[var(--theme-text)] accent-emerald-400"
                              />
                              <input
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
                            </div>
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
                <button
                  type="button"
                  onClick={handleSaveQuestions}
                  className="game-button game-button-primary rounded-full px-4 py-2 text-xs font-semibold"
                >
                  {actionState === "saving"
                    ? "Saving..."
                    : actionState === "saved"
                    ? "Saved!"
                    : "Save questions"}
                </button>
                {actionState === "error" && (
                  <p className="text-xs text-rose-400">
                    Failed to save changes.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Topics;
