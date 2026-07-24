import React, { useRef } from "react";
import { cx } from "../utils/helpers";
import {
  TEAM_HEX_R,
  HEX_SIZE,
  TIGER_BASE,
  FOX_BASE,
  TIGER_BASE_SURROUND,
  FOX_BASE_SURROUND,
  MAX_ROUNDS,
  MOVE_RANGE,
  hexKey,
  genHexGrid,
  hexToPixel,
  hexPolygonPoints,
  hexDistance,
} from "../constants/hexMap";

export default function TeamHexMap({ moveTokens, teamCaptured, myTeam, round, roundWins, onMove, onBack }) {
  const cells = genHexGrid(TEAM_HEX_R);
  const positions = cells.map((c) => ({ ...c, ...hexToPixel(c.q, c.r) }));
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const pad = HEX_SIZE * 1.4;
  const minX = Math.min(...xs) - pad;
  const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad;
  const maxY = Math.max(...ys) + pad;
  const vbW = maxX - minX;
  const vbH = maxY - minY;

  // maysazor teksturasi uchun tasodifiy dog' va yaltiroq nuqtalar (bir marta hisoblanadi)
  const decor = useRef({
    patches: Array.from({ length: 10 }, () => ({
      x: minX + Math.random() * vbW,
      y: minY + Math.random() * vbH,
      r: 30 + Math.random() * 50,
    })),
    sparkles: Array.from({ length: 26 }, () => ({
      x: minX + Math.random() * vbW,
      y: minY + Math.random() * vbH,
      r: 1.2 + Math.random() * 1.6,
    })),
  }).current;

  const tiger = teamCaptured.tiger || {};
  const fox = teamCaptured.fox || {};
  const myCaptured = myTeam === "tiger" ? tiger : myTeam === "fox" ? fox : {};
  const myOwnedKeys = Object.keys(myCaptured).length
    ? Object.keys(myCaptured)
    : myTeam
    ? [hexKey(myTeam === "tiger" ? TIGER_BASE : FOX_BASE)]
    : [];

  function isReachable(c) {
    if (!myTeam || moveTokens <= 0) return false;
    if (c.q === TIGER_BASE.q && c.r === TIGER_BASE.r) return false;
    if (c.q === FOX_BASE.q && c.r === FOX_BASE.r) return false;
    if (myCaptured[hexKey(c)]) return false;
    return myOwnedKeys.some((k) => {
      const [q, r] = k.split(",").map(Number);
      const dist = hexDistance({ q, r }, c);
      return dist >= 1 && dist <= MOVE_RANGE;
    });
  }

  const winnerTeam = (() => {
    const tigerWin = FOX_BASE_SURROUND.every((s) => tiger[hexKey(s)]);
    const foxWin = TIGER_BASE_SURROUND.every((s) => fox[hexKey(s)]);
    if (tigerWin) return "tiger";
    if (foxWin) return "fox";
    return null;
  })();

  const wins = roundWins || { tiger: 0, fox: 0 };

  return (
    <div>
      <div className="qg-map-token-row" style={{ marginBottom: 10 }}>
        <span className="qg-baloo qg-map-token-chip">
          🏁 Raund {round || 1}/{MAX_ROUNDS} — 🐯 {wins.tiger || 0} : {wins.fox || 0} 🦊
        </span>
      </div>
      <div className="qg-map-hud">
        <div className="qg-map-team qg-map-team--left">
          <div className="qg-map-team-badge qg-map-team-badge--tiger">🐯</div>
          <div className="qg-map-team-info">
            <div className="qg-baloo qg-map-team-name">Team Tiger</div>
            <div className="qg-map-team-player">{Object.keys(tiger).length} katak egallagan</div>
          </div>
        </div>
        <div className="qg-map-timer">🗺️ {moveTokens}</div>
        <div className="qg-map-team qg-map-team--right">
          <div className="qg-map-team-info" style={{ textAlign: "right" }}>
            <div className="qg-baloo qg-map-team-name">Team Fox</div>
            <div className="qg-map-team-player">{Object.keys(fox).length} katak egallagan</div>
          </div>
          <div className="qg-map-team-badge qg-map-team-badge--fox">🦊</div>
        </div>
      </div>

      {!myTeam && (
        <p className="qg-baloo qg-map-status qg-map-status--empty" style={{ marginBottom: 10 }}>
          Avval lobbyda jamoa tanlang.
        </p>
      )}

      <svg viewBox={`${minX} ${minY} ${vbW} ${vbH}`} className="qg-map-svg qg-map-svg--wide" preserveAspectRatio="xMidYMid meet">
        {decor.patches.map((p, i) => (
          <circle key={`patch-${i}`} cx={p.x} cy={p.y} r={p.r} className="qg-grass-patch" />
        ))}

        {positions.map((c) => {
          const key = hexKey(c);
          const isTigerBase = c.q === TIGER_BASE.q && c.r === TIGER_BASE.r;
          const isFoxBase = c.q === FOX_BASE.q && c.r === FOX_BASE.r;
          const ownedByTiger = !isTigerBase && !isFoxBase && !!tiger[key];
          const ownedByFox = !isTigerBase && !isFoxBase && !!fox[key];
          const reachable = isReachable(c);
          const cls = cx(
            "qg-hex",
            isTigerBase && "qg-hex--base-tiger",
            isFoxBase && "qg-hex--base-fox",
            ownedByTiger && "qg-hex--captured",
            ownedByFox && "qg-hex--captured-fox",
            reachable && "qg-hex--reachable"
          );
          return (
            <polygon
              key={key}
              points={hexPolygonPoints(c.x, c.y, HEX_SIZE - 1.5)}
              className={cls}
              onClick={() => reachable && onMove({ q: c.q, r: c.r })}
            />
          );
        })}

        {decor.sparkles.map((s, i) => (
          <circle key={`sparkle-${i}`} cx={s.x} cy={s.y} r={s.r} className="qg-grass-sparkle" />
        ))}

        {(() => {
          const tp = hexToPixel(TIGER_BASE.q, TIGER_BASE.r);
          return (
            <g>
              <circle cx={tp.x} cy={tp.y} r={HEX_SIZE * 0.62} className="qg-base-ring qg-base-ring--tiger" />
              <text x={tp.x} y={tp.y + HEX_SIZE * 0.28} textAnchor="middle" fontSize={HEX_SIZE * 0.6}>🏯</text>
            </g>
          );
        })()}
        {(() => {
          const fp = hexToPixel(FOX_BASE.q, FOX_BASE.r);
          return (
            <g>
              <circle cx={fp.x} cy={fp.y} r={HEX_SIZE * 0.62} className="qg-base-ring qg-base-ring--fox" />
              <text x={fp.x} y={fp.y + HEX_SIZE * 0.28} textAnchor="middle" fontSize={HEX_SIZE * 0.6}>🏰</text>
            </g>
          );
        })()}
      </svg>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        {winnerTeam ? (
          <p className="qg-baloo qg-map-status qg-map-status--win">
            🏆 {winnerTeam === "tiger" ? "Team Tiger" : "Team Fox"} g'olib chiqdi!
          </p>
        ) : myTeam && moveTokens > 0 ? (
          <p className="qg-baloo qg-map-status">
            Sariq belgilangan katakchalarga bosib hudud egallang — {moveTokens} ta harakatingiz bor. Jamoadoshingiz egallagan joylardan ham davom etishingiz mumkin!
          </p>
        ) : (
          <p className="qg-baloo qg-map-status qg-map-status--empty">Harakat tugadi — savollarga qaytilmoqda...</p>
        )}
      </div>
    </div>
  );
}
