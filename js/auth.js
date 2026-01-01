// js/auth.js
import { auth, db } from "/js/firebase.js";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// --------------------
// DOM ELEMENTS
// --------------------
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggle");
const title = document.getElementById("title");

let isLogin = true;

// --------------------
// TOGGLE LOGIN / REGISTER
// --------------------
toggleText.onclick = () => {
  isLogin = !isLogin;

  title.textContent = isLogin ? "Login" : "Register";
  submitBtn.textContent = isLogin ? "Login" : "Register";

  toggleText.innerHTML = isLogin
    ? `No account? <span>Register</span>`
    : `Have an account? <span>Login</span>`;
};

// --------------------
// SUBMIT AUTH
// --------------------
submitBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  submitBtn.disabled = true;

  try {
    let userCred;

    if (isLogin) {
      userCred = await signInWithEmailAndPassword(auth, email, password);
    } else {
      userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Create user profile in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: email,
        name: email.split("@")[0],
        createdAt: serverTimestamp(),
        online: true
      });
    }

    // SAFE REDIRECT (NO LOOP)
    window.location.replace("/home.html");

  } catch (err) {
    alert(err.message);
  }

  submitBtn.disabled = false;
};

// --------------------
// AUTH STATE LISTENER (LOOP SAFE)
// --------------------
onAuthStateChanged(auth, user => {
  const path = window.location.pathname;

  // User logged in but still on login page
  if (user && path.includes("index.html")) {
    window.location.replace("/home.html");
    return;
  }

  // User NOT logged in but on protected pages
  if (!user && !path.includes("index.html")) {
    window.location.replace("/index.html");
  }
});
