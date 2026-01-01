// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "oja-odan-6fc94.firebaseapp.com",
  projectId: "oja-odan-6fc94",
  storageBucket: "oja-odan-6fc94.appspot.com",
  messagingSenderId: "1096739384978",
  appId: "1:1096739384978:web:4a79774605ace1e2cbc04b"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);