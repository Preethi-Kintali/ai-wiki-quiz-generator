import { useEffect, useState } from "react";
import {
  fetchHistory,
  deleteQuiz,
  deleteAllQuizzes,
} from "./api";

export default function History() {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 5;
  const [loading, setLoading] = useState(false);

  // 🆕 MODAL STATE
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // 🔁 LOAD HISTORY
  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await fetchHistory(page, limit);
      setHistory(res.data || []);
    } catch (err) {
      alert("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page]);

  // ❌ DELETE SINGLE QUIZ
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this quiz?");
    if (!ok) return;

    try {
      await deleteQuiz(id);
      await loadHistory();
    } catch (err) {
      alert(err.message);
    }
  };

  // ❌ DELETE ALL QUIZZES
  const handleDeleteAll = async () => {
    const ok = window.confirm("Delete ALL quizzes?");
    if (!ok) return;

    try {
      await deleteAllQuizzes();
      setPage(1);
      await loadHistory();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📚 Quiz History</h1>

      <button onClick={handleDeleteAll} disabled={loading}>
        Delete All
      </button>

      {loading && <p>Loading...</p>}

      {!loading && history.length === 0 && (
        <p>No quiz history found.</p>
      )}

      {history.map((item) => (
        <div
          key={item.id}
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "8px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2>{item.title}</h2>

          <p style={{ lineHeight: "1.6" }}>
            {item.summary}
          </p>

          <button onClick={() => setSelectedQuiz(item)}>
            Details
          </button>

          <button
            onClick={() => handleDelete(item.id)}
            style={{ marginLeft: "10px" }}
          >
            Delete
          </button>
        </div>
      ))}

      {/* 🆕 DETAILS MODAL */}
      {selectedQuiz && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2>{selectedQuiz.title}</h2>

            {JSON.parse(selectedQuiz.quiz).map((q, index) => (
              <div key={index} style={{ marginBottom: "16px" }}>
                <p><b>Q{index + 1}:</b> {q.question}</p>

                <ul>
                  {q.options.map((op, i) => (
                    <li key={i}>{op}</li>
                  ))}
                </ul>

                <p><b>Answer:</b> {q.answer}</p>
                <p><b>Difficulty:</b> {q.difficulty}</p>
                <p><b>Explanation:</b> {q.explanation}</p>
                <hr />
              </div>
            ))}

            <button onClick={() => setSelectedQuiz(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🧾 MODAL STYLES */
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  width: "70%",
  maxHeight: "80%",
  overflowY: "auto",
  borderRadius: "8px",
};
