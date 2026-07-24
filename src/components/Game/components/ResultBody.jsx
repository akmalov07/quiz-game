import React from "react";
import { Trophy, RotateCcw } from "lucide-react";
import { cx } from "../utils/helpers";
import Confetti from "./Confetti";

export default function ResultBody({ score, total, log, showConfetti, onRestart, onMenu }) {
  return (
    <div style={{ textAlign: "center", padding: "16px 0", position: "relative" }}>
      {showConfetti && <Confetti />}
      <div className="qg-result-trophy"><Trophy size={38} color="var(--qg-ink)" /></div>
      <h2 className="qg-baloo qg-result-title">
        {score === total ? "Ajoyib! Hammasi to'g'ri! 🏆" : score >= total * 0.7 ? "Zo'r natija! 🎉" : score >= total * 0.4 ? "Yomon emas! 💪" : "Yana urinib ko'r! 🌱"}
      </h2>
      <p className="qg-baloo qg-result-score">{score} / {total}</p>
      <div className="qg-log-row">
        {log.map((l, i) => (
          <div key={i} className={cx("qg-log-dot", l.ok ? "qg-log-dot--ok" : "qg-log-dot--no")}>{l.ok ? "✓" : "✗"}</div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={onRestart} className="qg-btn qg-btn--blue"><RotateCcw size={18} /> Qayta o'ynash</button>
        <button onClick={onMenu} className="qg-link-btn">Menyuga qaytish</button>
      </div>
    </div>
  );
}
