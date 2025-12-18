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