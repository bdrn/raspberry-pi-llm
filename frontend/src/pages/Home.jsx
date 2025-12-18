import { useEffect, useState } from "react";
import api from "../api";
import UploadBox from "../components/UploadBox";
import QuizCard from "../components/QuizCard";
import { Card } from "@/components/ui/card";

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

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

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleUploadSuccess = (newQuizData) => {
    console.log("Upload success:", newQuizData);
    fetchQuizzes();
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-slate-400">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Your study library
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Upload lecture notes and turn them into bite-sized quizzes that stay
          in sync with your Study Buddy device.
        </p>
      </header>

      <Card className="border-dashed border-slate-800">
        <UploadBox onUploadSuccess={handleUploadSuccess} />
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
            Available on device
          </h2>
          {quizzes.length > 0 && !loadingData && (
            <span className="text-xs text-slate-400">
              {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
            </span>
          )}
        </div>

        {loadingData ? (
          <p className="text-sm text-slate-400">Loading your library…</p>
        ) : quizzes.length === 0 ? (
          <p className="text-sm italic text-slate-500">
            No quizzes yet. Upload a PDF to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
