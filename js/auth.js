import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { 
  getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, 
  signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

import { doc, setDoc, updateDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const userRef = doc(db, "users", user.uid);

await setDoc(userRef, {
  name: user.displayName || user.email,
  photo: user.photoURL || "",
  online: true,
  lastSeen: serverTimestamp()
}, { merge: true });

// ===== Firebase config =====
const firebaseConfig = {
  apiKey: ""AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "oja-odan-6fc94.firebaseapp.com",
  projectId: "oja-odan-6fc94",
  storageBucket: "oja-odan-6fc94.appspot.com",
  messagingSenderId: "1096739384978",
  appId: "1:1096739384978:web:4a79774605ace1e2cbc04b",
  measurementId: "G-Y48C843PEQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.addEventListener("beforeunload", async () => {
  if (!currentUser) return;

  await updateDoc(doc(db, "users", currentUser.uid), {
    online: false,
    lastSeen: serverTimestamp()
  });
});

function formatLastSeen(ts) {
  if (!ts) return "";
  const date = ts.toDate();
  return date.toLocaleString();
}

// ===== Forms =====
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// ===== Social Buttons =====
const googleBtn = document.getElementById("google-login");
const facebookBtn = document.getElementById("facebook-login");
const appleBtn = document.getElementById("apple-login");

// ===== Providers =====
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

// ===== Login =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  window.location.replace("/home.html");
  } catch(err) {
    alert("Login failed: " + err.message);
  }
});

// ===== Register =====
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await userCredential.user.updateProfile({ displayName: name });
    window.location.replace("/home.html");
  } catch(err) {
    alert("Registration failed: " + err.message);
  }
});


// ===== Social Logins =====
googleBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
   window.location.replace("/home.html");
  } catch(err) { alert(err.message); }
};

facebookBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, facebookProvider);
    window.location.replace("/home.html");
  } catch(err) { alert(err.message); }
};

appleBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, appleProvider);
   window.location.replace("/home.html");
  } catch(err) { alert(err.message); }
};
