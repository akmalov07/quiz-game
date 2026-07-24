import React from "react";
import { Star, Circle, Triangle, Sparkles } from "lucide-react";

export default function FloatingShapes() {
  const items = [
    { Icon: Star, top: "8%", left: "6%", size: 26, dur: "6s", color: "#FFE38A" },
    { Icon: Circle, top: "16%", left: "88%", size: 18, dur: "7.5s", color: "#9DE7FF" },
    { Icon: Star, top: "80%", left: "10%", size: 20, dur: "5.5s", color: "#B7A9FF" },
    { Icon: Triangle, top: "72%", left: "90%", size: 24, dur: "6.8s", color: "#7CF0D4" },
    { Icon: Sparkles, top: "4%", left: "45%", size: 20, dur: "8s", color: "#FFD1DE" },
  ];
  return (
    <div className="qg-float-layer">
      {items.map((it, i) => (
        <div key={i} className="qg-float-icon animate-bounce" style={{ top: it.top, left: it.left, animationDuration: it.dur }}>
          <it.Icon size={it.size} color={it.color} fill={it.color} />
        </div>
      ))}
    </div>
  );
}
