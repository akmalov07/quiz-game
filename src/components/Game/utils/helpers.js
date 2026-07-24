export function genCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function genId() {
  return "p" + Math.random().toString(36).slice(2, 8);
}

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}
