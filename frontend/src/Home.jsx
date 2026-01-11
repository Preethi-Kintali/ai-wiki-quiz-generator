import { useState } from "react";
import { generateQuiz } from "./api";

export default function Home() {
  const [url, setUrl] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!url.trim()) {
      setError("Please enter a Wikipedia URL");
      return;
    }

    setError("");
    setQuiz(null);
    setLoading(true);

    try {
      const data = await generateQuiz(url);
      setQuiz(data);
    } catch (err) {
      setError(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>📘 AI Wiki Quiz Generator</h1>

      <div className="card">
        <input
          type="text"
          placeholder="Paste Wikipedia article URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />

        <button
          className="primary"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>

        {loading && <div className="spinner" />}

        {error && <p className="error">{error}</p>}
      </div>

      {quiz && (
        <div className="card">
          <h2>{quiz.title}</h2>
          <p>{quiz.summary}</p>

          <h3>🧠 Quiz</h3>

          {quiz.quiz.map((q, i) => (
            <div key={i} className="quiz-question">
              <p>
                <strong>{i + 1}. {q.question}</strong>
              </p>
              <ul>
                {q.options.map((opt, idx) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
              <p className="answer">Answer: {q.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
