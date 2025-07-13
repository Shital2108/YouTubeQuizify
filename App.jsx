import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

export default function App() {
  const [url, setUrl] = useState("");
  const [manualTranscript, setManualTranscript] = useState("");
  const [transcript, setTranscript] = useState("");
  const [quiz, setQuiz] = useState("");
  const [flashcards, setFlashcards] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

  const [showTranscript, setShowTranscript] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);

  const inputTranscript = manualTranscript.trim() || transcript;

  const fetchTranscript = async () => {
    if (!url.trim()) {
      alert("Please paste a YouTube video URL.");
      return;
    }
    setLoadingTranscript(true);
    setTranscript("");
    setManualTranscript("");
    setQuiz("");
    setFlashcards("");
    try {
      const res = await axios.post("http://localhost:5000/api/transcribe", { url });
      setTranscript(res.data.transcript);
    } catch {
      alert("Failed to fetch transcript. Try a different video.");
    }
    setLoadingTranscript(false);
  };

  const generateQuiz = async () => {
    if (!inputTranscript) {
      alert("No transcript available to generate quiz.");
      return;
    }
    setLoadingQuiz(true);
    try {
      const res = await axios.post("http://localhost:5000/api/generate-quiz", { transcript: inputTranscript });
      setQuiz(res.data.output);
      setShowQuiz(true);
      setShowFlashcards(false);
      setShowTranscript(false);
    } catch {
      alert("Failed to generate quiz.");
    }
    setLoadingQuiz(false);
  };

  const generateFlashcards = async () => {
    if (!inputTranscript) {
      alert("No transcript available to generate flashcards.");
      return;
    }
    setLoadingFlashcards(true);
    try {
      const res = await axios.post("http://localhost:5000/api/generate-flashcards", { transcript: inputTranscript });
      setFlashcards(res.data.output);
      setShowFlashcards(true);
      setShowQuiz(false);
      setShowTranscript(false);
    } catch {
      alert("Failed to generate flashcards.");
    }
    setLoadingFlashcards(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    const lineHeight = 8;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const maxLineWidth = 180;

    doc.setFontSize(18);
    doc.setTextColor("#334155"); // slate-700
    doc.text("🎥 YouTubeQuizify Output", margin, y);
    y += 14;

    const addTextWithPagination = (title, text, color = "#1E293B") => {
      doc.setFontSize(16);
      doc.setTextColor(color);
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(title, margin, y);
      y += 10;

      doc.setFontSize(13);
      doc.setTextColor("#475569"); // slate-600
      const lines = doc.splitTextToSize(text, maxLineWidth);

      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }
      y += 12; // extra space after section
    };

    if (inputTranscript) addTextWithPagination("📄 Transcript:", inputTranscript);
    if (quiz) addTextWithPagination("🧠 Quiz (MCQs):", quiz);
    if (flashcards) addTextWithPagination("📝 Flashcards:", flashcards);

    doc.save("YouTubeQuizify_Output.pdf");
  };

  const Accordion = ({ title, isOpen, onToggle, children }) => (
    <div className="border rounded-lg shadow-sm mb-5 bg-white">
      <button
        className="w-full px-6 py-4 text-left font-semibold text-slate-800 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex justify-between items-center"
        onClick={onToggle}
      >
        {title}
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}>&#x25BC;</span>
      </button>
      {isOpen && <div className="px-6 py-4 text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">{children}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-10">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 select-none">🎥 YouTubeQuizify</h1>
          <p className="text-slate-600 max-w-xl mx-auto text-lg">
            Paste a YouTube link or input transcript manually to generate interactive quizzes and flashcards!
          </p>
        </header>

        {/* Input form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block mb-2 font-semibold text-slate-700 text-lg">📎 YouTube Video URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={loadingTranscript}
              className="w-full border border-slate-300 rounded-md px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <button
              onClick={fetchTranscript}
              disabled={loadingTranscript}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-semibold transition disabled:opacity-60"
            >
              {loadingTranscript ? "🔄 Fetching Transcript..." : "📝 Get Transcript"}
            </button>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-slate-700 text-lg">📝 Or Paste Transcript Text</label>
            <textarea
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              rows={10}
              placeholder="Paste transcript here to skip YouTube fetching"
              className="w-full border border-slate-300 rounded-md px-4 py-3 resize-none placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-6 justify-center mb-10">
          <button
            onClick={generateQuiz}
            disabled={loadingQuiz}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-md font-bold text-lg transition disabled:opacity-60"
          >
            {loadingQuiz ? "⚙️ Generating Quiz..." : "🎯 Generate Quiz"}
          </button>
          <button
            onClick={generateFlashcards}
            disabled={loadingFlashcards}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-md font-bold text-lg transition disabled:opacity-60"
          >
            {loadingFlashcards ? "⚙️ Generating Flashcards..." : "📝 Generate Flashcards"}
          </button>
          <button
            onClick={downloadPDF}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-md font-bold text-lg transition"
          >
            📥 Download PDF
          </button>
        </div>

        {/* Output accordions */}
        {inputTranscript && (
          <Accordion title="📄 Transcript" isOpen={showTranscript} onToggle={() => setShowTranscript(!showTranscript)}>
            {inputTranscript}
          </Accordion>
        )}
        {quiz && (
          <Accordion title="🧠 Quiz (MCQs)" isOpen={showQuiz} onToggle={() => setShowQuiz(!showQuiz)}>
            <pre>{quiz}</pre>
          </Accordion>
        )}
        {flashcards && (
          <Accordion
            title="📝 Flashcards"
            isOpen={showFlashcards}
            onToggle={() => setShowFlashcards(!showFlashcards)}
          >
            <pre>{flashcards}</pre>
          </Accordion>
        )}
      </div>
    </div>
  );
}
