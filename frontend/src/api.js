const BASE_URL = "http://127.0.0.1:8000";

/* ---------------- GENERATE QUIZ ---------------- */
export async function generateQuiz(url, mode) {
  const res = await fetch(`${BASE_URL}/generate-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, mode }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "API error");
  }

  return res.json();
}

/* ---------------- HISTORY ---------------- */
export async function fetchHistory(page = 1, limit = 5) {
  const res = await fetch(
    `${BASE_URL}/history?page=${page}&limit=${limit}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }

  return res.json();
}

/* ---------------- DELETE ONE ---------------- */
export async function deleteQuiz(id) {
  const res = await fetch(`${BASE_URL}/history/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete quiz");
  }

  return res.json();
}

/* ---------------- DELETE ALL ---------------- */
export async function deleteAllQuizzes() {
  const res = await fetch(`${BASE_URL}/history`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete all quizzes");
  }

  return res.json();
}
