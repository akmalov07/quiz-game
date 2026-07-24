import React, { useState, useEffect, useRef } from "react";
import { Play, Trophy, RotateCcw, Footprints, Users, User, Copy, Check, LogIn } from "lucide-react";
import { ref, set, update, get, onValue, off } from "firebase/database";
import { db } from "../../firebase";
import "./game.css";

import { QUESTIONS, TIME_PER_Q } from "./constants/quiz";
import {
  CORRECT_PER_TOKEN,
  MAX_MOVE_TOKENS,
  PLAYER_START,
  RIVAL_POS,
  RIVAL_SURROUND,
  TIGER_BASE,
  FOX_BASE,
  TIGER_BASE_SURROUND,
  FOX_BASE_SURROUND,
  ROUNDS_TO_WIN,
  MAX_ROUNDS,
  hexDistance,
  hexKey,
} from "./constants/hexMap";
import { genCode, genId, shuffleArray, cx } from "./utils/helpers";

import FloatingShapes from "./components/FloatingShapes";
import Confetti from "./components/Confetti";
import BigButton from "./components/BigButton";
import QuizBody from "./components/QuizBody";
import ResultBody from "./components/ResultBody";
import HexMap from "./components/HexMap";
import TeamHexMap from "./components/TeamHexMap";

export default function Game() {
  const [screen, setScreen] = useState("entry"); // entry | menu | quiz | result | lobby | mp-quiz | mp-result
  const [playerName, setPlayerName] = useState("");
  const [playerId] = useState(genId);
  const [error, setError] = useState("");

  // solo quiz state
  const [current, setCurrent] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState(() => shuffleArray(QUESTIONS));
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [log, setLog] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const soloExpiredRef = useRef(false);

  // multiplayer state
  const [roomCode, setRoomCode] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [mpSelected, setMpSelected] = useState(null);
  const [mpLocked, setMpLocked] = useState(false);
  const [mpTimeLeft, setMpTimeLeft] = useState(TIME_PER_Q);
  const [mpCurrent, setMpCurrent] = useState(0);
  const [mpQuizQuestions, setMpQuizQuestions] = useState(() => shuffleArray(QUESTIONS));
  const [codeCopied, setCodeCopied] = useState(false);
  const [teamCaptured, setTeamCaptured] = useState({ tiger: {}, fox: {} });
  const mpExpiredRef = useRef(false);
  const mapWinnerAppliedRef = useRef(false);
  const roundNotifiedRef = useRef(0);
  const [preRoundScreen, setPreRoundScreen] = useState("map");

  // ---------- xarita (hex-map) state ----------
  const [correctSinceToken, setCorrectSinceToken] = useState(0);
  const [moveTokens, setMoveTokens] = useState(0);
  const [mapPos, setMapPos] = useState(PLAYER_START);
  const [mapPath, setMapPath] = useState([PLAYER_START]);
  const [mapWon, setMapWon] = useState(false);
  const [previousScreen, setPreviousScreen] = useState("menu");

  useEffect(() => {
    if (screen !== "quiz" || locked) return;
    soloExpiredRef.current = false;
    setTimeLeft(TIME_PER_Q);
    const start = Date.now();
    const id = setInterval(() => {
      const left = TIME_PER_Q - (Date.now() - start) / 1000;
      if (left <= 0) {
        setTimeLeft(0);
        if (!soloExpiredRef.current) {
          soloExpiredRef.current = true;
          commitSoloAnswer(-1);
        }
        clearInterval(id);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, current, locked]);

  function startSolo() {
    setQuizQuestions(shuffleArray(QUESTIONS));
    setCurrent(0);
    setScore(0);
    setLog([]);
    setSelected(null);
    setLocked(false);
    setCorrectSinceToken(0);
    setMoveTokens(0);
    setMapPos(PLAYER_START);
    setMapPath([PLAYER_START]);
    setMapWon(false);
    setScreen("quiz");
  }

  function openMap(fromScreen) {
    setPreviousScreen(fromScreen);
    setScreen("map");
  }

  function moveOnMap(target) {
    if (moveTokens <= 0 || mapWon) return;
    if (hexDistance(mapPos, target) !== 1) return;
    // Raqib qasrining katagiga bevosita bosib kirib bo'lmaydi — uni faqat o'rab olish mumkin
    if (target.q === RIVAL_POS.q && target.r === RIVAL_POS.r) return;
    setMapPos(target);
    setMapPath((path) => {
      const already = path.some((p) => p.q === target.q && p.r === target.r);
      const nextPath = already ? path : [...path, target];
      // g'alaba: qasr atrofidagi BARCHA (mavjud) katakchalar bosib o'tilgan bo'lsa
      const surrounded = RIVAL_SURROUND.every((s) => nextPath.some((p) => p.q === s.q && p.r === s.r));
      if (surrounded) setMapWon(true);
      return nextPath;
    });
    setMoveTokens((t) => t - 1);
  }

  // G'olib chiqqanda — o'yin to'xtaydi va alohida "Siz yutdingiz!" ekraniga o'tiladi
  useEffect(() => {
    if (!mapWon) return;
    if (roomCode && room) {
      update(ref(db, `rooms/${roomCode}`), {
        mapWinner: { id: playerId, name: playerName || "O'yinchi" },
      }).catch(() => {});
    }
    const t = setTimeout(() => setScreen("map-result"), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapWon]);

  // ---------- Jamoaviy (2 jamoa) xarita rejimi ----------
  function moveOnMapTeam(target) {
    if (moveTokens <= 0 || !room) return;
    const me = players.find((p) => p.id === playerId);
    const myTeam = me && me.team;
    if (!myTeam) return;
    const enemyTeam = myTeam === "tiger" ? "fox" : "tiger";
    const myBase = myTeam === "tiger" ? TIGER_BASE : FOX_BASE;
    const enemyBase = myTeam === "tiger" ? FOX_BASE : TIGER_BASE;
    // o'z bazasiga yoki raqib bazasiga bevosita bosib kirib bo'lmaydi
    if ((target.q === myBase.q && target.r === myBase.r) || (target.q === enemyBase.q && target.r === enemyBase.r)) return;

    const mine = teamCaptured[myTeam] || {};
    const key = hexKey(target);
    if (mine[key]) return; // allaqachon o'z jamoamizniki

    // jamoadoshning bosgan (egallagan) katakchalari ustidan ham davom etib yurish mumkin
    const ownedKeys = Object.keys(mine).length ? Object.keys(mine) : [hexKey(myBase)];
    const isAdjacent = ownedKeys.some((k) => {
      const [q, r] = k.split(",").map(Number);
      return hexDistance({ q, r }, target) === 1;
    });
    if (!isAdjacent) return;

    setMoveTokens((t) => t - 1);

    const nextMine = { ...mine, [key]: true };
    const enemyBaseSurround = myTeam === "tiger" ? FOX_BASE_SURROUND : TIGER_BASE_SURROUND;
    const roundWon = enemyBaseSurround.every((s) => nextMine[hexKey(s)]);

    if (roundWon) {
      // Raund yutildi — xaritani (ikkala jamoa uchun ham) tozalab, keyingi raundga o'tamiz.
      // ROUNDS_TO_WIN ta raund yutgan jamoa esa o'yinning umumiy g'olibi bo'ladi (best-of-3).
      const currentWins = (room.roundWins && room.roundWins[myTeam]) || 0;
      const newWins = currentWins + 1;
      const currentRound = room.round || 1;
      const updates = { [`rooms/${roomCode}/roundWins/${myTeam}`]: newWins };
      if (newWins >= ROUNDS_TO_WIN) {
        updates[`rooms/${roomCode}/mapWinner`] = { id: playerId, name: playerName || "O'yinchi", team: myTeam };
      } else {
        updates[`rooms/${roomCode}/roundWinner`] = { team: myTeam, name: playerName || "O'yinchi", round: currentRound };
        updates[`rooms/${roomCode}/round`] = currentRound + 1;
        updates[`rooms/${roomCode}/captured`] = { tiger: {}, fox: {} };
      }
      update(ref(db), updates).catch(() => {});
    } else {
      const updates = {};
      updates[`rooms/${roomCode}/captured/${myTeam}/${key}`] = true;
      const enemyHas = (teamCaptured[enemyTeam] || {})[key];
      if (enemyHas) updates[`rooms/${roomCode}/captured/${enemyTeam}/${key}`] = null; // raqibdan tortib olish
      update(ref(db), updates).catch(() => {});
    }
  }

  function commitSoloAnswer(i) {
    if (locked) return;
    setLocked(true);
    setSelected(i);
    const q = quizQuestions[current];
    const isCorrect = i === q.correct;
    const willEarnToken = isCorrect && correctSinceToken + 1 >= CORRECT_PER_TOKEN;
    if (isCorrect) {
      setScore((s) => s + 1);
      setCorrectSinceToken((prev) => {
        const next = prev + 1;
        if (next >= CORRECT_PER_TOKEN) {
          setMoveTokens((t) => Math.min(MAX_MOVE_TOKENS, t + 1));
          return 0;
        }
        return next;
      });
    }
    setLog((l) => [...l, { n: current + 1, ok: isCorrect }]);
    const isLast = current + 1 >= QUESTIONS.length;
    setTimeout(() => {
      if (!isLast) {
        setCurrent((c) => c + 1);
        setSelected(null);
        setLocked(false);
        if (willEarnToken) {
          openMap("quiz");
        }
      } else {
        setShowConfetti(true);
        setScreen("result");
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 1100);
  }

  // ---------- MULTIPLAYER: Firebase Realtime Database ----------
  async function createRoom(mode) {
    setError("");
    mapWinnerAppliedRef.current = false;
    roundNotifiedRef.current = 0;
    const code = genCode();
    try {
      const roomInit = {
        hostId: playerId,
        status: "lobby",
        mode: mode || "quiz",
        currentQuestion: 0,
        questionStartedAt: null,
      };
      // Jamoaviy xarita raundli (best-of-3): har bir raund alohida g'olib chiqaradi
      if (mode === "map") {
        roomInit.round = 1;
        roomInit.roundWins = { tiger: 0, fox: 0 };
      }
      await set(ref(db, `rooms/${code}`), roomInit);
      const hostData = {
        name: playerName || "Xost",
        score: 0,
        lastAnsweredQuestion: -1,
      };
      // Xona ochgan odam avtomatik 1-jamoaga (Tiger) tushadi
      if (mode === "map") hostData.team = "tiger";
      await set(ref(db, `rooms/${code}/players/${playerId}`), hostData);
      setRoomCode(code);
      setIsHost(true);
      setScreen("lobby");
    } catch (e) {
      setError("Xona yaratishda xatolik yuz berdi. Internet aloqasini tekshiring.");
    }
  }

  async function joinRoom() {
    const code = joinCodeInput.trim();
    if (code.length !== 4) { setError("4 xonali kodni kiriting."); return; }
    setError("");
    mapWinnerAppliedRef.current = false;
    roundNotifiedRef.current = 0;
    try {
      const snap = await get(ref(db, `rooms/${code}`));
      if (!snap.exists()) { setError("Bunday xona topilmadi. Kodni tekshiring."); return; }
      const roomData = snap.val();
      const existingPlayers = roomData.players || {};
      const playerCount = Object.keys(existingPlayers).length;
      if (roomData.mode === "map" && playerCount >= 4) {
        setError("Xona to'la — bu rejimda maksimal 4 kishi o'ynay oladi.");
        return;
      }
      const playerData = {
        name: playerName || "O'yinchi",
        score: 0,
        lastAnsweredQuestion: -1,
      };
      // Jamoalar navbat bilan avtomatik taqsimlanadi: 1-, 3-... kishi Tiger, 2-, 4-... kishi Fox
      if (roomData.mode === "map") playerData.team = playerCount % 2 === 0 ? "tiger" : "fox";
      await set(ref(db, `rooms/${code}/players/${playerId}`), playerData);
      setRoomCode(code);
      setIsHost(false);
      setScreen("lobby");
    } catch (e) {
      setError("Ulanishda xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  }

  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    if (!roomCode || !["lobby", "mp-quiz", "mp-result", "map", "map-result", "round-result"].includes(screen)) return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const listener = onValue(roomRef, (snap) => {
      const r = snap.val();
      if (!r) return;
      setRoom({ code: roomCode, ...r });
      if (r.status === "playing") {
        setScreen((s) => {
          if (s === "lobby") {
            setMpQuizQuestions(shuffleArray(QUESTIONS));
            setMpCurrent(0);
            setMpSelected(null);
            setMpLocked(false);
            setCorrectSinceToken(0);
            setMoveTokens(0);
            setMapPos(PLAYER_START);
            setMapPath([PLAYER_START]);
            setMapWon(false);
            return "mp-quiz";
          }
          return s;
        });
      }
      // Kimdir raqib qasrini o'rab olsa — BARCHA o'yinchilarning ekrani bir vaqtda ochiladi
      if (r.mapWinner && !mapWinnerAppliedRef.current) {
        mapWinnerAppliedRef.current = true;
        setScreen("map-result");
      } else if (r.roundWinner && r.roundWinner.round !== roundNotifiedRef.current) {
        // Bir raund yutildi (lekin o'yin hali tugamadi) — BARCHA o'yinchilarga qisqa "raund tugadi" xabari ko'rsatiladi
        roundNotifiedRef.current = r.roundWinner.round;
        if (screenRef.current !== "round-result") setPreRoundScreen(screenRef.current);
        setScreen("round-result");
      }
      const playersObj = r.players || {};
      setPlayers(Object.entries(playersObj).map(([id, p]) => ({ id, ...p })));
      setTeamCaptured({ tiger: (r.captured && r.captured.tiger) || {}, fox: (r.captured && r.captured.fox) || {} });
    });
    return () => off(roomRef, "value", listener);
  }, [roomCode, screen]);

  async function hostStart() {
    if (!room) return;
    await update(ref(db, `rooms/${roomCode}`), { status: "playing" });
  }

  // savol o'zgarganda mahalliy javob holatini tozalash
  useEffect(() => {
    setMpSelected(null);
    setMpLocked(false);
  }, [mpCurrent]);

  // ---------- har bir o'yinchi uchun MUSTAQIL taymer ----------
  // boshqalarni kutmaydi: javob berilishi bilan (yoki vaqt tugashi bilan) darhol keyingi savolga o'tadi
  useEffect(() => {
    if (screen !== "mp-quiz" || mpLocked) return;
    mpExpiredRef.current = false;
    setMpTimeLeft(TIME_PER_Q);
    const start = Date.now();
    const id = setInterval(() => {
      const left = TIME_PER_Q - (Date.now() - start) / 1000;
      if (left <= 0) {
        setMpTimeLeft(0);
        if (!mpExpiredRef.current) {
          mpExpiredRef.current = true;
          submitMpAnswer(-1);
        }
        clearInterval(id);
      } else {
        setMpTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, mpCurrent, mpLocked]);

  async function submitMpAnswer(i) {
    if (mpLocked || !room) return;
    setMpLocked(true);
    setMpSelected(i);
    const q = mpQuizQuestions[mpCurrent];
    const me = players.find((p) => p.id === playerId);
    const isCorrect = i === q.correct;
    const newScore = (me ? me.score : 0) + (isCorrect ? 1 : 0);
    const willEarnToken = isCorrect && room.mode === "map" && correctSinceToken + 1 >= CORRECT_PER_TOKEN;
    if (isCorrect && room.mode === "map") {
      setCorrectSinceToken((prev) => {
        const next = prev + 1;
        if (next >= CORRECT_PER_TOKEN) {
          setMoveTokens((t) => Math.min(MAX_MOVE_TOKENS, t + 1));
          return 0;
        }
        return next;
      });
    }
    try {
      await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
        score: newScore,
        lastAnsweredQuestion: mpCurrent,
      });
    } catch (e) {}

    // javob berilgach — darhol (boshqalarni kutmasdan) keyingi savolga o'tish
    const isLast = mpCurrent + 1 >= QUESTIONS.length;
    setTimeout(() => {
      if (!isLast) {
        setMpCurrent((c) => c + 1);
        if (willEarnToken) {
          openMap("mp-quiz");
        }
      } else {
        finishMp();
      }
    }, 1100);
  }

  async function finishMp() {
    try {
      await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { finished: true });
    } catch (e) {}
    setScreen("mp-result");
  }

  function copyCode() {
    try {
      navigator.clipboard.writeText(roomCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    } catch (e) {}
  }

  function backToMenu() {
    setScreen("menu");
    setRoomCode("");
    setRoom(null);
    setPlayers([]);
    setError("");
    mapWinnerAppliedRef.current = false;
    roundNotifiedRef.current = 0;
  }

  const progressPct =
    screen === "quiz" ? (current / QUESTIONS.length) * 100 :
    screen === "result" ? 100 :
    screen === "mp-quiz" ? (mpCurrent / QUESTIONS.length) * 100 :
    screen === "mp-result" ? 100 : 0;

  const showRunner = ["quiz", "result", "mp-quiz", "mp-result", "lobby"].includes(screen);

  // Xaritada harakatlar tugaganda — avtomatik ravishda savollarga qaytish
  useEffect(() => {
    if (screen !== "map") return;
    if (moveTokens > 0) return;
    const t = setTimeout(() => setScreen(previousScreen), 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, moveTokens]);

  // Raund tugagani haqidagi xabar bir necha soniyadan keyin avtomatik yopiladi
  useEffect(() => {
    if (screen !== "round-result") return;
    const t = setTimeout(() => setScreen(preRoundScreen || "map"), 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Xarita ekrani — karta/div ichida emas, to'g'ridan-to'g'ri butun sahifada chiqadi
  if (screen === "map") {
    return (
      <div className="qg-fullmap-page">
        {roomCode ? (
          <TeamHexMap
            moveTokens={moveTokens}
            teamCaptured={teamCaptured}
            myTeam={(players.find((p) => p.id === playerId) || {}).team}
            round={(room && room.round) || 1}
            roundWins={(room && room.roundWins) || { tiger: 0, fox: 0 }}
            onMove={moveOnMapTeam}
            onBack={() => setScreen(previousScreen)}
          />
        ) : (
          <HexMap
            moveTokens={moveTokens}
            mapPos={mapPos}
            mapPath={mapPath}
            mapWon={mapWon}
            onMove={moveOnMap}
            onBack={() => setScreen(previousScreen)}
            playerName={playerName}
          />
        )}
      </div>
    );
  }

  return (
    <div className="qg-page">
      <FloatingShapes />

      <div className={cx("qg-card", "qg-pop", (screen === "map" || screen === "map-result") && "qg-card--wide")}>
        {showRunner && (
          <div style={{ marginBottom: 24 }}>
            <div className="qg-progress-track">
              <div className="qg-progress-fill" style={{ width: `${progressPct}%` }} />
              <div className="qg-runner-dot" style={{ left: `calc(${progressPct}% - 14px)` }}>
                <Footprints size={14} color="var(--qg-ink)" />
              </div>
            </div>
          </div>
        )}

        {screen === "entry" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div className="qg-badge">HTML &amp; CSS Bilag'oni 🎯</div>
            <h1 className="qg-baloo qg-h1" style={{ fontSize: 26 }}>Ismingizni kiriting</h1>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 16))}
              placeholder="Masalan: Aziz"
              className="qg-input"
              style={{ marginBottom: 24 }}
            />
            <BigButton onClick={() => playerName.trim() && setScreen("menu")} variant="green" icon={Play} disabled={!playerName.trim()}>
              Davom etish
            </BigButton>
          </div>
        )}

        {screen === "menu" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <h1 className="qg-baloo qg-h1" style={{ fontSize: 24, marginBottom: 4 }}>Salom, {playerName}! 👋</h1>
            <p className="qg-subtitle" style={{ marginBottom: 28 }}>Qanday o'ynaymiz?</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
              <BigButton onClick={startSolo} variant="blue" icon={User}>Yakka o'zim o'ynash</BigButton>
              <BigButton onClick={() => setScreen("mp-select")} variant="green" icon={Users}>Xona yaratish (do'stlar bilan)</BigButton>
            </div>

            <div className="qg-divider-row">
              <div className="qg-divider-line" />
              <span className="qg-baloo qg-divider-label">YOKI</span>
              <div className="qg-divider-line" />
            </div>

            <div className="qg-join-row">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Xona kodi (4 raqam)"
                className="qg-input qg-input--code"
                style={{ flex: 1 }}
              />
              <button onClick={joinRoom} className="qg-btn qg-btn--yellow" style={{ width: "auto", padding: "0 20px" }}>
                <LogIn size={18} /> Kirish
              </button>
            </div>
            {error && <p className="qg-error-text">{error}</p>}
          </div>
        )}

        {screen === "mp-select" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <h1 className="qg-baloo qg-h1" style={{ fontSize: 22, marginBottom: 4 }}>Qanday xona yaratamiz?</h1>
            <p className="qg-subtitle" style={{ marginBottom: 24 }}>Ikkala rejimda ham do'stlaringiz shu kod bilan qo'shiladi.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => createRoom("quiz")} className="qg-mode-card">
                <span className="qg-mode-card-icon">🧠</span>
                <span>
                  <span className="qg-baloo qg-mode-card-title">Oddiy viktorina</span>
                  <span className="qg-mode-card-desc">Savol-javob, kim ko'proq to'g'ri topsa o'sha g'olib</span>
                </span>
              </button>
              <button onClick={() => createRoom("map")} className="qg-mode-card">
                <span className="qg-mode-card-icon">🗺️</span>
                <span>
                  <span className="qg-baloo qg-mode-card-title">Jamoaviy xarita o'yini</span>
                  <span className="qg-mode-card-desc">To'g'ri javoblar orqali xaritada raqib bazasiga yurish</span>
                </span>
              </button>
            </div>

            <button onClick={() => setScreen("menu")} className="qg-link-btn">Ortga</button>
          </div>
        )}

        {screen === "lobby" && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <p className="qg-baloo qg-dim-text" style={{ fontSize: 14, marginBottom: 8 }}>XONA KODI</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
              <div className="qg-lobby-code">{roomCode}</div>
              <button onClick={copyCode} className="qg-btn qg-btn--blue qg-btn--small">
                {codeCopied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p className="qg-subtitle" style={{ marginBottom: 20 }}>
              Do'stlaringizga shu kodni yuboring — ular "Xonaga qo'shilish" orqali kiritadi.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 20, minHeight: 44 }}>
              {players.map((p) => (
                <div key={p.id} className={cx("qg-player-chip", room && p.id === room.hostId && "qg-player-chip--host")}>
                  {room && p.id === room.hostId ? "👑" : "🙂"} {p.name}
                  {room && room.mode === "map" && (p.team ? (p.team === "tiger" ? " 🐯" : " 🦊") : " ❔")}
                </div>
              ))}
            </div>

            {room && room.mode === "map" && (() => {
              const tigerCount = players.filter((p) => p.team === "tiger").length;
              const foxCount = players.filter((p) => p.team === "fox").length;
              return (
                <div style={{ marginBottom: 20 }}>
                  <p className="qg-baloo qg-dim-text" style={{ fontSize: 13, marginBottom: 10 }}>Jamoalar avtomatik taqsimlanadi (har jamoada max 2 kishi)</p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <div className="qg-mode-card" style={{ padding: "10px 16px" }}>
                      <span className="qg-mode-card-icon">🐯</span>
                      <span>
                        <span className="qg-baloo qg-mode-card-title">Team Tiger</span>
                        <span className="qg-mode-card-desc">{tigerCount}/2 kishi</span>
                      </span>
                    </div>
                    <div className="qg-mode-card" style={{ padding: "10px 16px" }}>
                      <span className="qg-mode-card-icon">🦊</span>
                      <span>
                        <span className="qg-baloo qg-mode-card-title">Team Fox</span>
                        <span className="qg-mode-card-desc">{foxCount}/2 kishi</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {isHost ? (
              <BigButton onClick={hostStart} variant="green" icon={Play} disabled={players.length < 1}>
                O'yinni boshlash ({players.length} kishi)
              </BigButton>
            ) : (
              <p className="qg-baloo qg-dim-text" style={{ fontWeight: 700 }}>
                Xost o'yinni boshlashini kuting...
              </p>
            )}
            <button onClick={backToMenu} className="qg-link-btn">Chiqish</button>
          </div>
        )}

        {screen === "quiz" && (
          <div>
            <div className="qg-map-token-row">
              <span className="qg-baloo qg-map-token-chip">🗺️ Keyingi yurish: {correctSinceToken}/{CORRECT_PER_TOKEN} to'g'ri javob</span>
            </div>
            <QuizBody
              q={quizQuestions[current]}
              qIndex={current}
              total={QUESTIONS.length}
              score={score}
              timeLeft={timeLeft}
              selected={selected}
              locked={locked}
              onSelect={commitSoloAnswer}
            />
          </div>
        )}

        {screen === "result" && (
          <div>
            <ResultBody score={score} total={QUESTIONS.length} log={log} showConfetti={showConfetti} onRestart={startSolo} onMenu={backToMenu} />
            {moveTokens > 0 && !mapWon && (
              <button onClick={() => openMap("result")} className="qg-baloo qg-map-enter-btn" style={{ marginTop: 12, width: "100%" }}>
                🗺️ Xaritada yurish ({moveTokens} ta harakat qoldi)
              </button>
            )}
          </div>
        )}

        {screen === "round-result" && room && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div className="qg-result-trophy" style={{ fontSize: 38 }}>🏁</div>
            {(() => {
              const rw = room.roundWinner || {};
              const wins = room.roundWins || { tiger: 0, fox: 0 };
              const teamLabel = rw.team === "tiger" ? "Team Tiger 🐯" : rw.team === "fox" ? "Team Fox 🦊" : "";
              return (
                <>
                  <h2 className="qg-baloo qg-result-title" style={{ marginBottom: 4 }}>
                    {teamLabel} {rw.round}-raundni yutdi!
                  </h2>
                  <p className="qg-subtitle" style={{ marginBottom: 8 }}>
                    Hisob: 🐯 {wins.tiger || 0} — {wins.fox || 0} 🦊
                  </p>
                  <p className="qg-baloo qg-dim-text" style={{ fontWeight: 700 }}>
                    {room.round || 1}-raund boshlanmoqda...
                  </p>
                </>
              );
            })()}
          </div>
        )}

        {screen === "map-result" && (
          <div style={{ textAlign: "center", padding: "16px 0", position: "relative" }}>
            <Confetti />
            <div className="qg-result-trophy"><Trophy size={38} color="var(--qg-ink)" /></div>
            {(() => {
              const winnerTeam = room && room.mapWinner && room.mapWinner.team;
              const myTeam = (players.find((p) => p.id === playerId) || {}).team;
              const winnerName = roomCode ? (room && room.mapWinner ? room.mapWinner.name : "") : (playerName || "Siz");
              const teamLabel = winnerTeam === "tiger" ? "Team Tiger 🐯" : winnerTeam === "fox" ? "Team Fox 🦊" : "";
              const iWon = roomCode ? !!(winnerTeam && myTeam && winnerTeam === myTeam) : true;
              return (
                <>
                  <h2 className="qg-baloo qg-result-title" style={{ marginBottom: 4 }}>
                    {iWon ? "🏆 Sizning jamoangiz yutdi!" : roomCode ? `🏆 ${teamLabel} yutdi!` : "🏆 Siz yutdingiz!"}
                  </h2>
                  <p className="qg-subtitle" style={{ marginBottom: roomCode ? 4 : 20 }}>
                    {roomCode
                      ? `${winnerName} (${teamLabel}) raqib bazasini butunlay o'rab oldi va g'alaba qozondi!`
                      : `${winnerName} raqib qasrini butunlay o'rab oldi va g'alaba qozondi!`}
                  </p>
                  {roomCode && room && room.roundWins && (
                    <p className="qg-baloo qg-dim-text" style={{ marginBottom: 20 }}>
                      Yakuniy hisob: 🐯 {room.roundWins.tiger || 0} : {room.roundWins.fox || 0} 🦊
                    </p>
                  )}
                </>
              );
            })()}
            {roomCode ? (
              <div className="qg-leaderboard">
                {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                  <div key={p.id} className={cx("qg-leaderboard-row", i === 0 && "qg-leaderboard-row--first")}>
                    <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {p.name}{p.id === playerId ? " (siz)" : ""}</span>
                    <span>{p.score} ball {p.finished ? "✅" : "⏳"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="qg-baloo qg-result-score">{score} / {quizQuestions.length}</p>
            )}

            <button
              onClick={() => {
                setMapWon(false);
                setMapPos(PLAYER_START);
                setMapPath([PLAYER_START]);
                setMoveTokens(0);
                setCorrectSinceToken(0);
                setScreen(roomCode ? "mp-result" : "menu");
              }}
              className="qg-btn qg-btn--blue"
              style={{ marginTop: 8 }}
            >
              <RotateCcw size={18} /> Davom etish
            </button>
          </div>
        )}

        {screen === "mp-quiz" && room && (
          <div>
            <div className="qg-quiz-top">
              <span className="qg-baloo qg-quiz-top-label">Savol {mpCurrent + 1} / {QUESTIONS.length}</span>
              <span className="qg-baloo qg-score-chip">
                <Users size={14} /> {players.filter((p) => p.finished).length}/{players.length} tugatdi
              </span>
            </div>
            {room.mode === "map" && (
              <div className="qg-map-token-row">
                <span className="qg-baloo qg-map-token-chip">🗺️ Keyingi yurish: {correctSinceToken}/{CORRECT_PER_TOKEN} to'g'ri javob</span>
                <span className="qg-baloo qg-map-token-chip">
                  🏁 Raund {room.round || 1}/{MAX_ROUNDS} — 🐯 {(room.roundWins && room.roundWins.tiger) || 0} : {(room.roundWins && room.roundWins.fox) || 0} 🦊
                </span>
              </div>
            )}
            <QuizBody
              q={mpQuizQuestions[mpCurrent]}
              qIndex={mpCurrent}
              total={QUESTIONS.length}
              score={(players.find((p) => p.id === playerId) || {}).score || 0}
              timeLeft={mpTimeLeft}
              selected={mpSelected}
              locked={mpLocked}
              onSelect={submitMpAnswer}
              hideTopBar
            />
          </div>
        )}

        {screen === "mp-result" && (
          <div style={{ textAlign: "center", padding: "16px 0", position: "relative" }}>
            <Confetti />
            <div className="qg-result-trophy"><Trophy size={38} color="var(--qg-ink)" /></div>
            <h2 className="qg-baloo qg-result-title" style={{ marginBottom: 20 }}>Reyting jadvali 🏆</h2>
            {room && room.mapWinner && (
              <p className="qg-baloo qg-map-status qg-map-status--win" style={{ marginBottom: 16 }}>
                🗺️ {room.mapWinner.name} raqib qasrini o'rab olib, xarita jangida g'olib chiqdi!
              </p>
            )}

            <div className="qg-leaderboard">
              {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.id} className={cx("qg-leaderboard-row", i === 0 && "qg-leaderboard-row--first")}>
                  <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {p.name}{p.id === playerId ? " (siz)" : ""}</span>
                  <span>{p.score} ball {p.finished ? "✅" : "⏳"}</span>
                </div>
              ))}
            </div>

            <button onClick={backToMenu} className="qg-btn qg-btn--blue">
              <RotateCcw size={18} /> Menyuga qaytish
            </button>
            {room && room.mode === "map" && moveTokens > 0 && !mapWon && (
              <button onClick={() => openMap("mp-result")} className="qg-baloo qg-map-enter-btn" style={{ marginTop: 12, width: "100%" }}>
                🗺️ Xaritada yurish ({moveTokens} ta harakat qoldi)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
