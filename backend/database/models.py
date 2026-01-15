from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    quiz_data = db.Column(db.Text, nullable=False)

    # status for raspberry pi
    is_synced = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "topic": self.topic,
            "created_at": self.created_at.isoformat(),
            "quiz_data": json.loads(self.quiz_data),
        }


class QuizSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)
    per_topic = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "score": self.score,
            "total": self.total,
            "per_topic": json.loads(self.per_topic) if self.per_topic else {},
            "created_at": self.created_at.isoformat(),
        }


class AppSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    theme = db.Column(db.String(50), nullable=False, default="game")

    def to_dict(self):
        return {
            "id": self.id,
            "theme": self.theme,
        }
