from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load .env from project root (one level up from backend/)
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

from services.pdf_parser import extract_text_from_pdf
from services.llm_generator import generate_quiz_from_text

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "message": "Study Buddy API is running...",
        "status": "online"
        })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Invalid file type. Please upload a PDF"}), 400

    try:
# 1. Parse PDF
        print(f"Processing {file.filename}...")
        extracted_text = extract_text_from_pdf(file.stream)
        
        # 2. Generate Quiz
        print("Sending to LLM...")
        quiz_json = generate_quiz_from_text(extracted_text)
        
        print("Quiz Generated!")

        # 3. Return the actual Quiz in json
        return jsonify({
            "message": "Quiz generated successfully",
            "filename": file.filename,
            "quiz": quiz_json 
        }), 200

    except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)