// /js/auth.js
import { auth, db } from "/js/firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// --------------------
// DOM ELEMENTS
// --------------------
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

const regName = document.getElementById("reg-name");
const regEmail = document.getElementById("reg-email");
const regPassword = document.getElementById("reg-password");

const googleBtn = document.getElementById("google-login");
const facebookBtn = document.getElementById("facebook-login");
const appleBtn = document.getElementById("apple-login");

// --------------------
// PROVIDERS
// --------------------
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

// --------------------
// EMAIL LOGIN
// --------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // 🔴 STOP PAGE RELOAD

  try {
    await signInWithEmailAndPassword(
      auth,
      loginEmail.value.trim(),
      loginPassword.value.trim()
    );

    window.location.replace("/home.html");
  } catch (err) {
    alert(err.message);
  }
});

// --------------------
// EMAIL REGISTER
// --------------------
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // 🔴 STOP PAGE RELOAD

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      regEmail.value.trim(),
      regPassword.value.trim()
    );

    // Create user profile if not exists
    const userRef = doc(db, "users", cred.user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        name: regName.value.trim(),
        email: regEmail.value.trim(),
        role: "user",
        createdAt: serverTimestamp(),
        blocked: false
      });
    }

    window.location.replace("/home.html");
  } catch (err) {
    alert(err.message);
  }
});

// --------------------
// GOOGLE LOGIN
// --------------------
googleBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(result.user);
    window.location.replace("/home.html");
  } catch (err) {
    alert(err.message);
  }
});

// --------------------
// FACEBOOK LOGIN
// --------------------
facebookBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const result = await signInWithPopup(auth, facebookProvider);
    await ensureUserDoc(result.user);
    window.location.replace("/home.html");
  } catch (err) {
    alert(err.message);
  }
});

// --------------------
// APPLE LOGIN
// --------------------
appleBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const result = await signInWithPopup(auth, appleProvider);
    await ensureUserDoc(result.user);
    window.location.replace("/home.html");
  } catch (err) {
    alert(err.message);
  }
});

// --------------------
// ENSURE USER DOCUMENT
// --------------------
async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || "New User",
      email: user.email,
      role: "user",
      createdAt: serverTimestamp(),
      blocked: false
    });
  }
}
