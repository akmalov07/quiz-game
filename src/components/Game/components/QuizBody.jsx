import React from "react";
import { cx } from "../utils/helpers";
import { TIME_PER_Q, OPTION_COLOR_CLASSES, SHAPE_ICONS } from "../constants/quiz";

export default function QuizBody({ q, qIndex, total, score, timeLeft, selected, locked, onSelect, hideTopBar }) {
  const timerPct = Math.max(0, (timeLeft / TIME_PER_Q) * 100);
  return (
    <div>
      {!hideTopBar && (
        <div className="qg-quiz-top">
          <span className="qg-baloo qg-quiz-top-label">Savol {qIndex + 1} / {total}</span>
          <span className="qg-baloo qg-score-chip">⭐ {score} ball</span>
        </div>
      )}
      <div className="qg-timer-track">
        <div className={cx("qg-timer-fill", timerPct < 30 && "qg-timer-fill--danger")} style={{ width: `${timerPct}%` }} />
      </div>
      <div key={qIndex} className="qg-pop qg-question-box">
        <p className="qg-baloo qg-question-text">{q.q}</p>
      </div>
      <div className="qg-options-grid">
        {q.options.map((opt, i) => {
          const Icon = SHAPE_ICONS[i];
          const isSelected = selected === i;
          const isCorrectOpt = i === q.correct;
          let stateClass = OPTION_COLOR_CLASSES[i];
          if (locked) {
            if (isCorrectOpt) stateClass = "qg-option--correct";
            else if (isSelected) stateClass = "qg-option--wrong";
            else stateClass = "qg-option--dim";
          }
          return (
            <button key={i} disabled={locked} onClick={() => onSelect(i)} className={cx("qg-option", stateClass)}>
              <Icon size={20} fill="white" color="white" />
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
