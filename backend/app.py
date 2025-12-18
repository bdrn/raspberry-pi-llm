from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv

# Load .env from project root
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

from services.pdf_parser import extract_text_from_pdf
from services.llm_generator import generate_quiz_from_text

from database.models import db, Quiz

load_dotenv()


app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///studybuddy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

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
        extracted_text = extract_text_from_pdf(file.stream)
        quiz_json = generate_quiz_from_text(extracted_text)
        
        topic = quiz_json.get("meta", {}).get("topic", file.filename)

        new_quiz = Quiz(
            filename=file.filename,
            topic=topic,
            quiz_data=json.dumps(quiz_json)
        )

        db.session.add(new_quiz)
        db.session.commit()

        return jsonify({
            "message": "Quiz generated and saved",
            "filename": new_quiz.id,
            "topic": new_quiz.topic
        }), 201

    except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": str(e)}), 500


# endpoint for raspberry pi to sync quizzes
@app.route('/api/sync', methods=['GET'])
def sync_device():
    try: 
        quizzes = Quiz.query.order_by(Quiz.created_at.desc()).all()

        payload = []
        for q in quizzes:
            payload.append(q.to_dict())

        return jsonify({"quizzes": payload}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)