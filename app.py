from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import requests
import re

app = Flask(__name__)
CORS(app)

API_KEY = "Your_grok_API_Key"
API_URL = "https://api.groq.com/openai/v1/chat/completions"

def extract_video_id(url):
    match = re.search(r"v=([a-zA-Z0-9_-]{11})", url)
    if not match:
        match = re.search(r"youtu\.be/([a-zA-Z0-9_-]{11})", url)
    return match.group(1) if match else None

@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    try:
        url = request.json.get("url", "")
        video_id = extract_video_id(url)
        if not video_id:
            return jsonify({"error": "Invalid YouTube URL"}), 400

        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        full_text = " ".join([item["text"] for item in transcript_list])
        return jsonify({"transcript": full_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def call_groq_api(prompt, max_tokens=1000):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": "You are an expert educational content generator."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": max_tokens
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

@app.route("/api/generate-quiz", methods=["POST"])
def generate_quiz():
    try:
        transcript = request.json.get("transcript", "").strip()
        language = request.json.get("language", "English")

        if not transcript:
            return jsonify({"error": "Transcript is empty"}), 400

        prompt = f"""
Generate 5 to 10 multiple-choice questions (MCQs) from the passage below.
Each question should have 3 options (a, b, c) and only one correct answer.
After each question, provide the answer in the format: Answer: a), b), or c).
Language: {language}

Passage:
\"\"\"
{transcript}
\"\"\"
"""
        output = call_groq_api(prompt, max_tokens=1500)
        return jsonify({"output": output})
    except Exception as e:
        return jsonify({"error": f"Failed to generate quiz: {str(e)}"}), 500

@app.route("/api/generate-flashcards", methods=["POST"])
def generate_flashcards():
    try:
        transcript = request.json.get("transcript", "").strip()
        language = request.json.get("language", "English")

        if not transcript:
            return jsonify({"error": "Transcript is empty"}), 400

        prompt = f"""
Generate 5 to 10 flashcards in Q&A format based and some important topic on the passage below.
Each flashcard should have a clear question and answer.
Language: {language}

Passage:
\"\"\"
{transcript}
\"\"\"
"""
        output = call_groq_api(prompt, max_tokens=1500)
        return jsonify({"output": output})
    except Exception as e:
        return jsonify({"error": f"Failed to generate flashcards: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
