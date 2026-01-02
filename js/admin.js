import { auth, db } from "/js/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const usersList = document.getElementById("users-list");

/* AUTH CHECK (extra safety) */
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "/index.html";
  } else {
    loadUsers();
  }
});

/* LOAD USERS */
async function loadUsers() {
  usersList.innerHTML = "Loading users...";
  const snap = await getDocs(collection(db, "users"));
  usersList.innerHTML = "";

  snap.forEach(docu => {
    const u = docu.data();
    const uid = docu.id;

    const div = document.createElement("div");
    div.className = "glass-card";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <p><strong>${u.name || "No name"}</strong></p>
      <p>${u.email || ""}</p>
      <p>Status: <b>${u.status || "active"}</b></p>

      <button class="secondary-btn" data-action="warn">Warn</button>
      <button class="secondary-btn" data-action="suspend">Suspend</button>
      <button class="danger-btn" data-action="block">Block</button>
      <button class="danger-btn" data-action="delete">Delete</button>
    `;

    div.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => handleAction(uid, btn.dataset.action);
    });

    usersList.appendChild(div);
  });
}

/* ADMIN ACTIONS */
async function handleAction(uid, action) {
  const ref = doc(db, "users", uid);

  if (action === "warn") {
    const msg = prompt("Enter warning message:");
    if (!msg) return;
    await updateDoc(ref, { warning: msg });
    alert("Warning sent");
  }

  if (action === "suspend") {
    await updateDoc(ref, { status: "suspended" });
    alert("User suspended");
  }

  if (action === "block") {
    await updateDoc(ref, { status: "blocked" });
    alert("User blocked");
  }

  if (action === "delete") {
    if (!confirm("Delete user permanently?")) return;
    await deleteDoc(ref);
    alert("User deleted");
  }

  loadUsers();
}
