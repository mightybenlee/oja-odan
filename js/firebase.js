// js/firebase.js

// 🔴 REPLACE with your REAL Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "oja-odan-6fc94.firebaseapp.com",
  projectId: "oja-odan-6fc94",
  storageBucket: "oja-odan-6fc94.appspot.com",
  messagingSenderId: "1096739384978",
  appId: "1:1096739384978:web:4a79774605ace1e2cbc04b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
