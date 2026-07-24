import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCZK8lBmdJQHcI0Q61iKEc46C4y1YcgMvo",
  authDomain: "quiz-app-90075.firebaseapp.com",
  databaseURL: "https://quiz-app-90075-default-rtdb.firebaseio.com",
  projectId: "quiz-app-90075",
  storageBucket: "quiz-app-90075.firebasestorage.app",
  messagingSenderId: "524494400646",
  appId: "1:524494400646:web:a0d78182894a8324c13507",
  measurementId: "G-376MGQFFKS",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);