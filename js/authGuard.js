import { auth, db } from "/js/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;

  // Allow index.html always
  if (path.includes("index.html")) return;

  // Not logged in → block everything
  if (!user) {
    window.location.replace("/index.html");
    return;
  }

  // Admin page protection
  if (path.includes("admin.html")) {
    const adminSnap = await getDoc(doc(db, "admins", user.uid));
    if (!adminSnap.exists()) {
      window.location.replace("/home.html");
    }
  }
});
