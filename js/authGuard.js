import { auth, db } from "/js/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;

  // Allow login page
  if (path.includes("index.html")) return;

  if (!user) {
    window.location.replace("/index.html");
    return;
  }

  // Fetch user record
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await signOut(auth);
    window.location.replace("/index.html");
    return;
  }

  const data = snap.data();

  // BLOCKED = total ban
  if (data.status === "blocked") {
    alert("Your account has been blocked.");
    await signOut(auth);
    window.location.replace("/index.html");
    return;
  }

  // ADMIN PAGE CHECK
  if (path.includes("admin.html")) {
    const adminSnap = await getDoc(doc(db, "admins", user.uid));
    if (!adminSnap.exists()) {
      window.location.replace("/home.html");
    }
  }

  // expose status globally
  window.__USER_STATUS__ = data.status || "active";
});
