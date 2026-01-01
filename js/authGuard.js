// js/authGuard.js
import { auth } from "/js/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

let checked = false;

onAuthStateChanged(auth, user => {
  if (checked) return;
  checked = true;

  const path = window.location.pathname;

  const publicPages = ["/index.html"];
  const isPublic = publicPages.includes(path);

  if (!user && !isPublic) {
    window.location.replace("/index.html");
    return;
  }

  if (user && path === "/index.html") {
    window.location.replace("/home.html");
  }
});
