// /js/auth.js
import { auth, db } from "/js/firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const toggle = document.getElementById("toggle");
const title = document.getElementById("title");
const errorBox = document.getElementById("errorBox");

let isLogin = true;

// Toggle mode
toggle.onclick = () => {
  isLogin = !isLogin;
  title.textContent = isLogin ? "Login" : "Register";
  submitBtn.textContent = isLogin ? "Login" : "Register";
  toggle.innerHTML = isLogin
    ? `No account? <span>Register</span>`
    : `Have an account? <span>Login</span>`;
};

// Submit
submitBtn.onclick = async () => {
  errorBox.textContent = "";
  submitBtn.disabled = true;

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email.value, password.value);
    } else {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        email: email.value,
        role: "user",
        createdAt: serverTimestamp()
      });
    }

    // FORCE redirect (important)
    window.location.replace("/home.html");

  } catch (err) {
    errorBox.textContent = err.message;
  }

  submitBtn.disabled = false;
};

// If already logged in
onAuthStateChanged(auth, user => {
  if (user && window.location.pathname === "/index.html") {
    window.location.replace("/home.html");
  }
});
