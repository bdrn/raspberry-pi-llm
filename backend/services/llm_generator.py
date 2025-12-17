import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load .env from project root (two levels up from services/)
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
load_dotenv(env_path)

# Try both OPENAI_API_KEY and OPEN_API_KEY for backwards compatibility
api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPEN_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY or OPEN_API_KEY environment variable is not set. Please check your .env file.")

client = OpenAI(api_key=api_key)

def generate_quiz_from_text(text_context):
    trucated_text = text_context[:15000]

    system_prompt = """
        You are a helpful study assistant. Your goal is to generate a quiz based strictly on the provided text.
        
        Output MUST be a valid JSON object with the following structure:
        {
        "meta": {
            "topic": "A short 3-5 word title based on the text",
            "total_questions": 5
        },
        "questions": [
            {
            "id": 1,
            "type": "mcq", 
            "question": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_index": 0, 
            "explanation": "Short explanation of why this is correct."
            },
            {
            "id": 2,
            "type": "flashcard",
            "front": "Concept or term",
            "back": "Definition or answer"
            }
        ]
        }
        
        Generate exactly 5 questions. Mix "mcq" and "flashcard" types.
        """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here are my notes:\n{trucated_text}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
        )

        quiz_data = json.loads(response.choices[0].message.content)
        return quiz_data

    except Exception as e:
        print(f"Error generating quiz: {e}")
        raise e