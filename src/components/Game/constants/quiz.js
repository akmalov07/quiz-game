import { Triangle, Gem, Circle, Square } from "lucide-react";

export const TIME_PER_Q = 15;

export const OPTION_COLOR_CLASSES = ["qg-option--c0", "qg-option--c1", "qg-option--c2", "qg-option--c3"];
export const SHAPE_ICONS = [Triangle, Gem, Circle, Square];

export const QUESTIONS = [
  { q: "<strong> tegi matnni qanday qiladi?", options: ["Qalin (bold)", "Kursiv", "Chizib tashlangan", "Rangli"], correct: 0 },
  { q: "CSS'da matn rangini o'zgartirish uchun qaysi xususiyat ishlatiladi?", options: ["background", "color", "border", "font-size"], correct: 1 },
  { q: "Flexbox'da elementlarni gorizontal markazlashtirish uchun nima ishlatiladi?", options: ["align-items", "text-align", "justify-content", "float"], correct: 2 },
  { q: "<a href=\"#\"> tegi nima uchun kerak?", options: ["Rasm qo'yish", "Havola (link) yaratish", "Jadval chizish", "Video qo'yish"], correct: 1 },
  { q: "display: none; qo'yilsa nima bo'ladi?", options: ["Element shaffof bo'ladi", "Element kichrayadi", "Element butunlay yashiriladi", "Element aylanadi"], correct: 2 },
  { q: "CSS box-model tartibi (ichkaridan tashqariga) qanday?", options: ["Margin → Border → Padding → Content", "Content → Padding → Border → Margin", "Content → Border → Padding → Margin", "Padding → Margin → Content → Border"], correct: 1 },
  { q: "<ul> tegi ichida odatda qaysi teg ishlatiladi?", options: ["<td>", "<li>", "<tr>", "<p>"], correct: 1 },
  { q: "position: absolute; element qayerga nisbatan joylashadi?", options: ["Doim brauzer oynasiga", "Eng yaqin position:relative ota elementga", "Hech qachon o'zgarmaydi", "Faqat body'ga"], correct: 1 },
  { q: "CSS'da qaysi selektor kuchliroq?", options: [".class", "#id", "Ikkalasi teng", "Bog'liq emas"], correct: 1 },
  { q: "<img alt=\"...\"> atributi nima uchun kerak?", options: ["O'lchamini belgilaydi", "Rasm yuklanmasa matn ko'rsatadi", "Rasmni aylantiradi", "Vazifasi yo'q"], correct: 1 },
  { q: "CSS'da elementga yumaloq burchak berish uchun qaysi xususiyat ishlatiladi?", options: ["border-radius", "corner-round", "box-radius", "round-edges"], correct: 0 },
  { q: "HTML'da izoh (comment) qanday yoziladi?", options: ["// izoh", "<!-- izoh -->", "# izoh", "/* izoh */"], correct: 1 },
  { q: "CSS'da elementni butunlay yashirish, lekin joyini saqlab qolish uchun nima ishlatiladi?", options: ["display: none", "visibility: hidden", "opacity: 100", "hidden: true"], correct: 1 },
  { q: "Flexbox'da bolalarni vertikal joylashtirish yo'nalishini o'zgartiruvchi xususiyat?", options: ["flex-direction", "flex-wrap", "align-self", "order"], correct: 0 },
  { q: "<meta charset=\"UTF-8\"> nima uchun kerak?", options: ["Sahifa rangini belgilaydi", "Matn kodlashini (harflar to'g'ri chiqishini) belgilaydi", "Shrift o'lchamini belgilaydi", "Sahifa tilini tarjima qiladi"], correct: 1 },
  { q: "CSS'da bir nechta elementga bir xil stil berish uchun nima ishlatiladi?", options: ["ID selektor (#)", "Class selektor (.)", "Tag nomi har doim", "Bunday imkoniyat yo'q"], correct: 1 },

  // ---------- JavaScript savollari ----------
  { q: "JavaScript'da o'zgaruvchi e'lon qilish uchun qaysi kalit so'zlar ishlatiladi?", options: ["var, let, const", "int, str, bool", "def, val, set", "dim, set, var"], correct: 0 },
  { q: "console.log() nima uchun ishlatiladi?", options: ["Faylni saqlash uchun", "Brauzer konsoliga ma'lumot chiqarish uchun", "Sahifani qayta yuklash uchun", "CSS stil qo'shish uchun"], correct: 1 },
  { q: "JavaScript'da massiv (array) qanday belgilanadi?", options: ["{}", "()", "[]", "<>"], correct: 2 },
  { q: "== va === operatorlari orasidagi farq nima?", options: ["Hech qanday farq yo'q", "=== qiymat va turini ham tekshiradi", "== faqat sonlar uchun ishlaydi", "=== faqat matnlar uchun ishlaydi"], correct: 1 },
  { q: "Funksiyani e'lon qilish uchun qaysi kalit so'z ishlatiladi?", options: ["func", "function", "def", "method"], correct: 1 },
  { q: "JavaScript'da izoh (comment) qanday yoziladi?", options: ["<!-- izoh -->", "# izoh", "// izoh", "' izoh"], correct: 2 },
  { q: "document.getElementById() nima qiladi?", options: ["Yangi element yaratadi", "id bo'yicha HTML elementni topadi", "Elementni o'chiradi", "CSS faylni ulaydi"], correct: 1 },
  { q: "for tsikli nima uchun ishlatiladi?", options: ["Shart tekshirish uchun", "Ma'lumotni saqlash uchun", "Amallarni bir necha marta takrorlash uchun", "Funksiya chaqirish uchun"], correct: 2 },
  { q: "JavaScript'da massivga yangi element qo'shish uchun qaysi metod ishlatiladi?", options: ["push()", "add()", "insert()", "append()"], correct: 0 },
  { q: "typeof operatori nimani qaytaradi?", options: ["O'zgaruvchining qiymatini", "O'zgaruvchining turini (type)", "O'zgaruvchining nomini", "O'zgaruvchining hajmini"], correct: 1 },
  { q: "JSON.stringify() nima qiladi?", options: ["JSON matnni obyektga aylantiradi", "Obyektni JSON matnga aylantiradi", "Faylni o'chiradi", "Massivni saralaydi"], correct: 1 },
  { q: "addEventListener() nima uchun ishlatiladi?", options: ["Elementga hodisa (event) ulash uchun", "Yangi sahifa ochish uchun", "CSS stil o'zgartirish uchun", "Ma'lumotlar bazasiga ulanish uchun"], correct: 0 },
  { q: "JavaScript'da shart operatori qaysi?", options: ["switch/case", "if/else", "loop/end", "try/catch"], correct: 1 },
  { q: "null va undefined orasidagi farq nima?", options: ["Farqi yo'q, ikkalasi bir xil", "undefined - qiymat berilmagan, null - ataylab bo'sh qilib qo'yilgan", "null faqat massivlarda ishlatiladi", "undefined faqat funksiyalarda ishlatiladi"], correct: 1 },
];
