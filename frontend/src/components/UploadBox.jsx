import { useState } from "react";
import api from "../api";

const UploadBox = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload", formData);

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = null;
    }
  };

  const boxStyle = {
    border: "2px dashed #ccc",
    borderRadius: "10px",
    padding: "40px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    cursor: loading ? "wait" : "default",
    marginBottom: "30px",
  };

  return (
    <div style={boxStyle}>
      {loading ? (
        <div>
          <h3>Processing your notes...</h3>
          <p>Please wait while AI generates your quiz (approx. 10s)</p>
          {/* CSS spinner */}
        </div>
      ) : (
        <div>
          <h3>Upload Lecture Notes (PDF)</h3>
          <p>Drag & drop or click to select</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={loading}
          />
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default UploadBox;
