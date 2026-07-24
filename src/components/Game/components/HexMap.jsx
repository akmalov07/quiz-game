import React from "react";
import { cx } from "../utils/helpers";
import { HEX_R, HEX_SIZE, PLAYER_START, RIVAL_POS, MOVE_RANGE, genHexGrid, hexToPixel, hexPolygonPoints, hexDistance } from "../constants/hexMap";

export default function HexMap({ moveTokens, mapPos, mapPath, mapWon, onMove, onBack, playerName }) {
  const cells = genHexGrid(HEX_R);
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
  const path = mapPath || [];
  const isCaptured = (c) => path.some((p) => p.q === c.q && p.r === c.r);

  return (
    <div>
      <div className="qg-map-hud">
        <div className="qg-map-team qg-map-team--left">
          <div className="qg-map-team-badge qg-map-team-badge--tiger">🐯</div>
          <div className="qg-map-team-info">
            <div className="qg-baloo qg-map-team-name">Team Tiger</div>
            <div className="qg-map-team-player">{playerName || "Siz"}</div>
          </div>
        </div>
        <div className="qg-map-timer">🗺️ {moveTokens}</div>
        <div className="qg-map-team qg-map-team--right">
          <div className="qg-map-team-info" style={{ textAlign: "right" }}>
            <div className="qg-baloo qg-map-team-name">Team Fox</div>
            <div className="qg-map-team-player">Raqib bazasi</div>
          </div>
          <div className="qg-map-team-badge qg-map-team-badge--fox">🦊</div>
        </div>
      </div>

      <svg viewBox={`${minX} ${minY} ${vbW} ${vbH}`} className="qg-map-svg">
        {positions.map((c) => {
          const isRival = c.q === RIVAL_POS.q && c.r === RIVAL_POS.r;
          const isOwnBase = c.q === PLAYER_START.q && c.r === PLAYER_START.r;
          const captured = !isRival && isCaptured(c);
          // raqib katagiga bevosita bosib kirib bo'lmaydi, faqat uning atrofidagi bo'sh katakchalarga yurish mumkin
          const dist = hexDistance(mapPos, c);
          const isReachable = !isRival && !mapWon && moveTokens > 0 && dist >= 1 && dist <= MOVE_RANGE;
          const cls = cx(
            "qg-hex",
            isRival && "qg-hex--rival",
            !isRival && isOwnBase && "qg-hex--own-base",
            captured && "qg-hex--captured",
            isReachable && "qg-hex--reachable"
          );
          return (
            <polygon
              key={`${c.q},${c.r}`}
              points={hexPolygonPoints(c.x, c.y, HEX_SIZE - 2)}
              className={cls}
              onClick={() => isReachable && onMove({ q: c.q, r: c.r })}
            />
          );
        })}

        {/* O'zining qasri — doim ko'rinadi */}
        {(() => {
          const op = hexToPixel(PLAYER_START.q, PLAYER_START.r);
          return <text x={op.x} y={op.y + 10} textAnchor="middle" fontSize={HEX_SIZE * 0.85}>🏯</text>;
        })()}

        {/* Raqib qasri — doim ko'rinadi */}
        {(() => {
          const rp = hexToPixel(RIVAL_POS.q, RIVAL_POS.r);
          return <text x={rp.x} y={rp.y + 10} textAnchor="middle" fontSize={HEX_SIZE * 0.9}>🏰</text>;
        })()}

        {/* O'yinchining joriy joylashuvi (qasr ustida bo'lsa ham ko'rinib turadi) */}
        {(() => {
          const pp = hexToPixel(mapPos.q, mapPos.r);
          return <text x={pp.x} y={pp.y - 6} textAnchor="middle" fontSize={HEX_SIZE * 0.9}>🐯</text>;
        })()}
      </svg>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        {mapWon ? (
          <p className="qg-baloo qg-map-status qg-map-status--win">🏆 Siz yutdingiz! Raqib qasrini butunlay o'rab oldingiz!</p>
        ) : moveTokens > 0 ? (
          <p className="qg-baloo qg-map-status">Yashil hexlarga bosib yuring — {moveTokens} ta harakatingiz bor. Raqib qasrini o'rab olsangiz yutasiz!</p>
        ) : (
          <p className="qg-baloo qg-map-status qg-map-status--empty">Harakat tugadi — savollarga qaytilmoqda...</p>
        )}
      </div>
    </div>
  );
}
