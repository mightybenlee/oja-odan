import { auth } from "/js/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.replace("/index.html");
    } catch (err) {
      alert(err.message);
    }
  });
}
