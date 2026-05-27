from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import os
import json
from dotenv import load_dotenv

# Load .env from project root
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

from services.pdf_parser import extract_text_from_pdf
from services.llm_generator import generate_quiz_from_text

from database.models import db, Quiz, QuizSession, AppSettings

load_dotenv()


app = Flask(__name__, instance_relative_config=True)
CORS(app)

os.makedirs(app.instance_path, exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"sqlite:///{os.path.join(app.instance_path, 'studybuddy.db')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()
    if not AppSettings.query.first():
        db.session.add(AppSettings(theme="game"))
        db.session.commit()

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


@app.route('/api/quizzes/<int:quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    data = request.get_json(silent=True) or {}
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    if "topic" in data:
        quiz.topic = data["topic"]
    if "quiz_data" in data:
        quiz.quiz_data = json.dumps(data["quiz_data"])

    db.session.commit()
    return jsonify({"quiz": quiz.to_dict()}), 200


@app.route('/api/progress', methods=['POST'])
def create_progress():
    data = request.get_json(silent=True) or {}
    score = data.get("score")
    total = data.get("total")
    per_topic = data.get("per_topic", {})

    if score is None or total is None:
        return jsonify({"error": "score and total are required"}), 400

    session = QuizSession(
        score=int(score),
        total=int(total),
        per_topic=json.dumps(per_topic)
    )
    db.session.add(session)
    db.session.commit()
    return jsonify({"session": session.to_dict()}), 201


@app.route('/api/progress', methods=['GET'])
def get_progress():
    sessions = QuizSession.query.order_by(QuizSession.created_at.asc()).all()
    return jsonify({"sessions": [s.to_dict() for s in sessions]}), 200


@app.route('/api/topics', methods=['GET'])
def get_topics():
    quizzes = Quiz.query.order_by(Quiz.created_at.desc()).all()
    topics = {}
    for quiz in quizzes:
        quiz_data = json.loads(quiz.quiz_data) if quiz.quiz_data else {}
        topic = quiz.topic or quiz_data.get("meta", {}).get("topic")
        if not topic:
            continue
        entry = topics.setdefault(
            topic,
            {"topic": topic, "quizzes": 0, "questions": 0, "last_updated": quiz.created_at}
        )
        entry["quizzes"] += 1
        entry["questions"] += len(quiz_data.get("questions", []))
        if quiz.created_at > entry["last_updated"]:
            entry["last_updated"] = quiz.created_at

    payload = []
    for entry in topics.values():
        payload.append({
            "topic": entry["topic"],
            "quizzes": entry["quizzes"],
            "questions": entry["questions"],
            "last_updated": entry["last_updated"].isoformat(),
        })
    return jsonify({"topics": payload}), 200


@app.route('/api/topics', methods=['POST'])
def create_topic():
    data = request.get_json(silent=True) or {}
    topic = data.get("topic")
    if not topic:
        return jsonify({"error": "topic is required"}), 400

    quiz_data = {
        "meta": {"topic": topic, "total_questions": 0},
        "questions": [],
    }
    new_quiz = Quiz(
        filename=f"manual-topic-{int(datetime.utcnow().timestamp())}.json",
        topic=topic,
        quiz_data=json.dumps(quiz_data),
    )
    db.session.add(new_quiz)
    db.session.commit()
    return jsonify({"quiz": new_quiz.to_dict()}), 201


@app.route('/api/topics/rename', methods=['PUT'])
def rename_topic():
    data = request.get_json(silent=True) or {}
    old_topic = data.get("old_topic")
    new_topic = data.get("new_topic")
    if not old_topic or not new_topic:
        return jsonify({"error": "old_topic and new_topic are required"}), 400

    quizzes = Quiz.query.all()
    updated = 0
    for quiz in quizzes:
        quiz_data = json.loads(quiz.quiz_data) if quiz.quiz_data else {}
        current_topic = quiz.topic or quiz_data.get("meta", {}).get("topic")
        if current_topic == old_topic:
            quiz.topic = new_topic
            quiz_data.setdefault("meta", {})["topic"] = new_topic
            quiz.quiz_data = json.dumps(quiz_data)
            updated += 1

    db.session.commit()
    return jsonify({"updated": updated}), 200


@app.route('/api/topics/remove', methods=['PUT'])
def remove_topic():
    data = request.get_json(silent=True) or {}
    topic = data.get("topic")
    if not topic:
        return jsonify({"error": "topic is required"}), 400

    quizzes = Quiz.query.all()
    updated = 0
    for quiz in quizzes:
        quiz_data = json.loads(quiz.quiz_data) if quiz.quiz_data else {}
        current_topic = quiz.topic or quiz_data.get("meta", {}).get("topic")
        if current_topic == topic:
            quiz.topic = None
            if "meta" in quiz_data and "topic" in quiz_data["meta"]:
                quiz_data["meta"]["topic"] = None
            quiz.quiz_data = json.dumps(quiz_data)
            updated += 1

    db.session.commit()
    return jsonify({"updated": updated}), 200


@app.route('/api/settings', methods=['GET'])
def get_settings():
    settings = AppSettings.query.first()
    if not settings:
        settings = AppSettings(theme="game")
        db.session.add(settings)
        db.session.commit()
    return jsonify({"settings": settings.to_dict()}), 200


@app.route('/api/settings', methods=['PUT'])
def update_settings():
    data = request.get_json(silent=True) or {}
    theme = data.get("theme")
    allowed = {"game", "minimal-dark", "minimal-light"}
    if theme not in allowed:
        return jsonify({"error": "Invalid theme"}), 400

    settings = AppSettings.query.first()
    if not settings:
        settings = AppSettings(theme=theme)
        db.session.add(settings)
    else:
        settings.theme = theme
    db.session.commit()
    return jsonify({"settings": settings.to_dict()}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
