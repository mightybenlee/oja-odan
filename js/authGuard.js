// js/authGuard.js

// Ensure Firebase is loaded first
if (!auth || !db) {
  alert("Firebase not loaded. Make sure firebase.js is included first.");
}

// Protect pages based on auth & user status
auth.onAuthStateChanged(async (user) => {
  const path = window.location.pathname.toLowerCase();

  // Always allow index.html (login/register)
  if (path.includes("index.html")) return;

  // If not logged in, redirect to index
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  try {
    // Fetch user document
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      // If user record not found, logout
      await auth.signOut();
      window.location.href = "index.html";
      return;
    }

    const data = userDoc.data();

    // BLOCKED USERS → logout immediately
    if (data.status === "blocked") {
      alert("Your account has been blocked. Contact admin.");
      await auth.signOut();
      window.location.href = "index.html";
      return;
    }

    // Save status globally for other pages (home/profile)
    window.__USER_STATUS__ = data.status || "active";
    window.__USER_ROLE__ = data.role || "user";

    // Admin page check
    if (path.includes("admin.html")) {
      const adminDoc = await db.collection("admins").doc(user.uid).get();
      if (!adminDoc.exists) {
        alert("You are not authorized to access admin page.");
        window.location.href = "home.html";
        return;
      }
    }

  } catch (err) {
    console.error("Auth Guard Error:", err);
    await auth.signOut();
    window.location.href = "index.html";
  }
});
