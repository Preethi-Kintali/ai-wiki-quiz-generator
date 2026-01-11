import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import History from "./History";
import { generateQuiz } from "./api";
import { exportPDF } from "./utils/pdf";

/* ---------------- HOME ---------------- */

function Home() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("assisted");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  // ⏱ Strict mode timer
  const [timeLeft, setTimeLeft] = useState(60);

  function isValidWikipediaUrl(value) {
    return value.includes("wikipedia.org/wiki/");
  }

  async function handleGenerate() {
    setError("");
    setQuiz(null);
    setUserAnswers({});
    setSubmitted(false);
    setShowAnswers(false);
    setTimeLeft(60);

    if (!isValidWikipediaUrl(url)) {
      setError("Please enter a valid Wikipedia article URL");
      return;
    }

    setLoading(true);
    try {
      const data = await generateQuiz(url, mode);
      setQuiz(data);
    } catch (err) {
      setError(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }

  // ⏱ Timer effect (strict mode)
  useEffect(() => {
    if (mode !== "strict" || !quiz || submitted) return;

    if (timeLeft === 0) {
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, mode, quiz, submitted]);

  function handleSelect(qIndex, option) {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function calculateScore() {
    let correct = 0;
    quiz.quiz.forEach((q, i) => {
      if (userAnswers[i] === q.answer) correct++;
    });
    return correct;
  }

  const score = quiz ? calculateScore() : 0;

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>AI Wiki Quiz Generator</h1>

      {/* INPUT */}
      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Paste Wikipedia article URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div style={styles.modeToggle}>
          <label>
            <input
              type="radio"
              checked={mode === "assisted"}
              onChange={() => setMode("assisted")}
            />{" "}
            Assisted Mode
          </label>

          <label>
            <input
              type="radio"
              checked={mode === "strict"}
              onChange={() => setMode("strict")}
            />{" "}
            Strict Mode
          </label>
        </div>

        <button style={styles.button} onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Quiz"}
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </div>

      {/* QUIZ */}
      {quiz && (
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <h2>{quiz.title}</h2>
            {quiz.cached && <span style={styles.badge}>Cached</span>}
          </div>

          <p>
            Mode: <strong>{mode.toUpperCase()}</strong>
          </p>

          {/* TIMER */}
          {mode === "strict" && !submitted && (
            <p style={styles.timer}>⏱ Time left: {timeLeft}s</p>
          )}

          {submitted && (
            <p style={styles.score}>
              Score: {score}/{quiz.quiz.length}
            </p>
          )}

          {mode === "strict" && submitted && (
            <button
              style={styles.secondaryButton}
              onClick={() => setShowAnswers((v) => !v)}
            >
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </button>
          )}

          <h3>🧠 Quiz</h3>

          {quiz.quiz.map((q, i) => (
            <div key={i} style={styles.question}>
              <div style={styles.questionHeader}>
                <strong>
                  {i + 1}. {q.question}
                </strong>

                <span
                  style={{
                    ...styles.difficulty,
                    ...(q.difficulty === "easy" && styles.easy),
                    ...(q.difficulty === "medium" && styles.medium),
                    ...(q.difficulty === "hard" && styles.hard),
                  }}
                >
                  {q.difficulty}
                </span>
              </div>

              {/* OPTIONS */}
              {q.options.map((opt, idx) => (
                <label key={idx} style={styles.option}>
                  <input
                    type="radio"
                    name={`q-${i}`}
                    disabled={submitted}
                    checked={userAnswers[i] === opt}
                    onChange={() => handleSelect(i, opt)}
                  />
                  {opt}
                </label>
              ))}

              {/* ANSWERS */}
              {(mode === "assisted" ||
                (mode === "strict" && showAnswers && submitted)) && (
                <p style={styles.answer}>Answer: {q.answer}</p>
              )}
            </div>
          ))}

          {!submitted && (
            <button style={styles.button} onClick={handleSubmit}>
              Submit Quiz
            </button>
          )}

          {submitted && (
            <button
              style={styles.secondaryButton}
              onClick={() =>
                exportPDF(
                  quiz,
                  {
                    correct: score,
                    total: quiz.quiz.length,
                    accuracy: Math.round(
                      (score / quiz.quiz.length) * 100
                    ),
                  },
                  mode
                )
              }
            >
              📄 Download PDF
            </button>
          )}
        </div>
      )}
    </main>
  );
}

/* ---------------- ROUTER ---------------- */

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: { maxWidth: "760px", margin: "0 auto", padding: "16px" },
  title: { fontSize: "32px", marginBottom: "24px" },
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  modeToggle: { display: "flex", gap: "24px", marginBottom: "16px" },
  button: {
    background: "#6366f1",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginTop: "12px",
  },
  secondaryButton: {
    background: "#e0e7ff",
    color: "#4338ca",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginBottom: "12px",
  },
  error: { color: "#dc2626" },
  headerRow: { display: "flex", justifyContent: "space-between" },
  badge: {
    background: "#e0e7ff",
    color: "#4338ca",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
  },
  timer: { color: "#dc2626", fontWeight: 600 },
  score: { fontWeight: 600 },
  question: { marginBottom: "20px" },
  option: {
    display: "block",
    margin: "6px 0",
    cursor: "pointer",
  },
  answer: { color: "#16a34a", fontWeight: 600, marginTop: "6px" },

  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  difficulty: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "capitalize",
  },
  easy: { background: "#dcfce7", color: "#166534" },
  medium: { background: "#ffedd5", color: "#9a3412" },
  hard: { background: "#fee2e2", color: "#991b1b" },
};
