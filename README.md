# 🎥 YouTubeQuizify

AI-powered app to convert any YouTube video or transcript into 📄 Notes, 🧠 Quizzes, and 📝 Flashcards — with instant PDF export!


## 🚀 Features

- 🔗 Paste YouTube URL or 📝 Input transcript manually
- 📄 Auto-extract full video transcript
- 🧠 Generate multiple-choice questions (MCQs)
- 📝 Create Q&A style flashcards for revision
- 📥 Download everything in a clean PDF format
- 💡 Clean UI/UX with responsive layout

---

## 🛠️ Tech Stack

| Frontend     | Backend     | AI APIs       |
|--------------|-------------|---------------|
| React (Vite) | Flask (Python) | Groq  (Mistral / LLaMA) |
| Tailwind CSS | Flask-CORS  | Hugging Face / Together.ai |

---

## 📁 Folder Structure

YouTubeQuizify/
│
├── backend/ # Flask API
│ └── app.py # Main backend server
│
├── frontend/ # React frontend (Vite)
│ ├── src/
│ │ ├── App.jsx # Main UI logic
| | |-- main.jsx 
│ │ └── index.css # Tailwind + Custom styles
│ └── index.html
│
├── README.md
└── requirements.txt
