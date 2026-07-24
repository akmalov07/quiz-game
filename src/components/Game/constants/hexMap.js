// ---------- Xarita (hex-grid) rejimi uchun sozlamalar ----------
export const CORRECT_PER_TOKEN = 2; // har 2 ta to'g'ri javobdan keyin 1 ta yurish huquqi
export const MAX_MOVE_TOKENS = 3;   // jami to'planadigan yurish soni
export const BASE_DIST = 2;         // baza markazdan qancha uzoqlikda joylashadi
export const HEX_R = BASE_DIST + 1; // xarita radiusi — bazadan 1 qator ortiqcha bo'sh joy (bufer, to'liq aylanib o'tish uchun yetarli)
export const HEX_SIZE = 34;         // har bir hex piksel o'lchami
export const PLAYER_START = { q: -BASE_DIST, r: 0 };
export const RIVAL_POS = { q: 0, r: 0 }; // xaritaning aynan o'rtasida — to'liq aylanib o'rab olish kerak

export function hexToPixel(q, r) {
  const x = HEX_SIZE * 1.5 * q;
  const y = HEX_SIZE * Math.sqrt(3) * (r + q / 2);
  return { x, y };
}

export function hexPolygonPoints(cx, cy, size) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

export function hexDistance(a, b) {
  const as = -a.q - a.r;
  const bs = -b.q - b.r;
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(as - bs));
}

export function genHexGrid(radius) {
  const cells = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) cells.push({ q, r });
  }
  return cells;
}

const AXIAL_DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];

export function isValidHex(pos, radius) {
  const s = -pos.q - pos.r;
  return Math.abs(pos.q) <= radius && Math.abs(pos.r) <= radius && Math.abs(s) <= radius;
}

export function hexNeighbors(pos, radius) {
  return AXIAL_DIRS
    .map(([dq, dr]) => ({ q: pos.q + dq, r: pos.r + dr }))
    .filter((p) => isValidHex(p, radius));
}

// Raqib qasrini o'rab olish uchun bosib o'tilishi shart bo'lgan katakchalar
export const RIVAL_SURROUND = hexNeighbors(RIVAL_POS, HEX_R);

// ---------- Jamoaviy (2 jamoa) xarita rejimi uchun ----------
// Bazalar chekkada joylashsa, ularning ba'zi qo'shni katakchalari xaritadan tashqarida qolib ketadi
// (burchakdagi katakning atigi 3 ta qo'shnisi bo'ladi, 6 ta emas) — shu sabab bazani to'liq aylanib o'tish shart bo'lmay qoladi.
// TEAM_HEX_R = TEAM_BASE_DIST + 1 orqali bazadan 1 qator qo'shimcha bufer saqlanadi, shu bilan bazalar atrofida
// har doim to'liq (6 tomonlama) halqa bo'ladi — xarita qanchalik kichraytirilsa ham bu buferni kamaytirmaslik kerak.
// Yakka o'yindan (HEX_R/BASE_DIST) alohida — jamoaviy xaritani mustaqil ravishda kichraytirish mumkin bo'lsin uchun.
export const TEAM_BASE_DIST = 2;
export const TEAM_HEX_R = TEAM_BASE_DIST + 1;
export const TIGER_BASE = { q: -TEAM_BASE_DIST, r: 0 };
export const FOX_BASE = { q: TEAM_BASE_DIST, r: 0 };
export const TIGER_BASE_SURROUND = hexNeighbors(TIGER_BASE, TEAM_HEX_R);
export const FOX_BASE_SURROUND = hexNeighbors(FOX_BASE, TEAM_HEX_R);
export const hexKey = (p) => `${p.q},${p.r}`;

// Jamoaviy xarita endi raundli: bir jamoa raqib bazasini o'rab olsa, o'sha RAUND yutiladi (umumiy o'yin emas).
// ROUNDS_TO_WIN ta raund yutgan jamoa umumiy g'olib bo'ladi (best-of-3) — shu sabab 3-raunddan oshib ketmaydi.
export const ROUNDS_TO_WIN = 2;
export const MAX_ROUNDS = 3;

// Bitta yurish (token) bilan necha katakkacha bosib o'tish mumkinligi — xarita tezroq bosib o'tilishi uchun
export const MOVE_RANGE = 3;
