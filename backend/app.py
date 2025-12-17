from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

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

    # pdf parsing logic, add later here
    return jsonify({"message": f"Recieved {file.filename}", "job_id": "12345"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)