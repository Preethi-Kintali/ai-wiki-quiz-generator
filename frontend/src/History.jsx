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

  // 🔁 LOAD HISTORY (USED EVERYWHERE)
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
      await loadHistory(); // ✅ IMPORTANT FIX
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
      await loadHistory(); // ✅ IMPORTANT FIX
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

          <button onClick={() => handleDelete(item.id)}>
            Delete
          </button>
        </div>
      ))}

      {/* PAGINATION */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={history.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
}
