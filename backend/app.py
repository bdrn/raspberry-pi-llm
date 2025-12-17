from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.pdf_parser import extract_text_from_pdf

load_dotenv()

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
        extracted_text = extract_text_from_pdf(file)

        # TODO: Send 'extracted_text to LLM service for processing

        return jsonify({
            "message": "File uploaded successfully",
            "filename": file.filename,
            "char_count": len(extracted_text),
            "preview": extracted_text[:100] + "..."
        }), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)