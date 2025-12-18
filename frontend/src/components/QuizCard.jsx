const QuizCard = ({ quiz }) => {
  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "15px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const meta = quiz.quiz_data && quiz.quiz_data.meta ? quiz.quiz_data.meta : {};

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
        {meta.topic || quiz.filename}
      </h3>
      <div style={{ fontSize: "0.9rem", color: "#666" }}>
        <p style={{ margin: "5px 0" }}>📄 Source: {quiz.filename}</p>
        <p style={{ margin: "5px 0" }}>
          ❓ Questions: {meta.total_questions || "N/A"}
        </p>
        <p style={{ margin: "5px 0" }}>
          Created At: {new Date(quiz.created_at).toLocaleDateString()}
        </p>
      </div>
      <div style={{ marginTop: "10px" }}>
        <span
          style={{
            background: "#e0f7fa",
            color: "#006064",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "0.8rem",
          }}
        >
          Ready to Sync
        </span>
      </div>
    </div>
  );
};

export default QuizCard;
