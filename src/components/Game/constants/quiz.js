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
];
