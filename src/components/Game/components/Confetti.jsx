import React, { useRef } from "react";

export default function Confetti() {
  const pieces = useRef(
    Array.from({ length: 40 }, (_, i) => {
      const colors = ["var(--qg-red)", "var(--qg-blue)", "var(--qg-yellow)", "var(--qg-green)", "#FFFFFF"];
      return {
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 2 + Math.random() * 1.5,
        color: colors[i % colors.length],
        rot: Math.random() * 360,
        size: 6 + Math.random() * 6,
      };
    })
  ).current;
  return (
    <div className="qg-confetti-layer">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="qg-confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            transform: `rotate(${p.rot}deg)`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
