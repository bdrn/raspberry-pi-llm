import { useEffect, useState } from "react";
import api from "../api";
import UploadBox from "../components/UploadBox";
import QuizCard from "../components/QuizCard";

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Function to fetch the current list from the backend
  const fetchQuizzes = async () => {
    try {
      const response = await api.get("/sync");
      // The backend returns { quizzes: [...] }
      setQuizzes(response.data.quizzes);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Load data on page mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Callback when upload finishes
  const handleUploadSuccess = (newQuizData) => {
    console.log("Upload success:", newQuizData);
    fetchQuizzes();
  };

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>My Study Material</h2>

      {/* 1. Upload Section */}
      <UploadBox onUploadSuccess={handleUploadSuccess} />

      {/* 2. List Section */}
      <div>
        <h3>Available on Device</h3>
        {loadingData ? (
          <p>Loading your library...</p>
        ) : quizzes.length === 0 ? (
          <p style={{ color: "#888", fontStyle: "italic" }}>
            No quizzes found. Upload a PDF to start!
          </p>
        ) : (
          quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
        )}
      </div>
    </div>
  );
};

export default Home;
