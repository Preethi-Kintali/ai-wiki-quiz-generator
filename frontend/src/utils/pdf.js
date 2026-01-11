// src/utils/pdf.js
import jsPDF from "jspdf";

export function exportPDF(quiz, score, mode) {
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(16);
  doc.text("AI Wiki Quiz Generator", 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Topic: ${quiz.title}`, 10, y);
  y += 7;
  doc.text(`Mode: ${mode.toUpperCase()}`, 10, y);
  y += 7;

  if (score) {
    doc.text(
      `Score: ${score.correct}/${score.total} (${score.accuracy}%)`,
      10,
      y
    );
    y += 10;
  }

  quiz.quiz.forEach((q, index) => {
    doc.text(`Q${index + 1}. ${q.question}`, 10, y);
    y += 7;

    q.options.forEach((opt) => {
      doc.text(`- ${opt}`, 14, y);
      y += 6;
    });

    doc.text(`Correct Answer: ${q.answer}`, 14, y);
    y += 10;

    doc.line(10, y, 200, y);
    y += 8;
  });

  doc.save(`${quiz.title}-quiz.pdf`);
}
