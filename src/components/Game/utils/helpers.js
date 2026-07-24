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

// Savolning javob variantlari tartibini aralashtiradi, to'g'ri javob har doim bir xil joyda
// (masalan doim 2-tugmada) chiqib qolmasligi uchun. `correct` indeksi yangi tartibga moslab yangilanadi.
function shuffleQuestionOptions(q) {
  const order = shuffleArray(q.options.map((_, i) => i));
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correct: order.indexOf(q.correct),
  };
}

// Savollar ro'yxatini ham tartibini, ham har bir savol ichidagi javob variantlarini aralashtirib tayyorlaydi
export function prepareQuizQuestions(questions) {
  return shuffleArray(questions).map(shuffleQuestionOptions);
}
