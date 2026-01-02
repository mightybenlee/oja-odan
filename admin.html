import { auth, db } from "./firebase.js";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// ===== DOM =====
const usersList = document.getElementById("users-list");
const groupsList = document.getElementById("groups-list");

// ===== LOAD USERS =====
async function loadUsers() {
  usersList.innerHTML = "Loading users...";

  const snap = await getDocs(collection(db, "users"));
  usersList.innerHTML = "";

  snap.forEach(userDoc => {
    const u = userDoc.data();

    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `
      <strong>${u.firstName || "User"} ${u.lastName || ""}</strong><br>
      <small>${u.email}</small><br>
      <p>Status: <b>${u.status || "active"}</b></p>
      <button class="danger-btn">Suspend</button>
      <button class="secondary-btn">Delete</button>
    `;

    const suspendBtn = div.querySelector(".danger-btn");
    const deleteBtn = div.querySelector(".secondary-btn");

    suspendBtn.onclick = async () => {
      await updateDoc(doc(db, "users", userDoc.id), {
        status: "suspended"
      });
      alert("User suspended");
      loadUsers();
    };

    deleteBtn.onclick = async () => {
      if (!confirm("Delete user permanently?")) return;
      await deleteDoc(doc(db, "users", userDoc.id));
      alert("User deleted");
      loadUsers();
    };

    usersList.appendChild(div);
  });
}

// ===== LOAD GROUPS =====
async function loadGroups() {
  groupsList.innerHTML = "Loading groups...";

  const snap = await getDocs(collection(db, "groups"));
  groupsList.innerHTML = "";

  snap.forEach(groupDoc => {
    const g = groupDoc.data();

    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `
      <h4>${g.name}</h4>
      <p>${g.description}</p>
      <p>Status: <b>${g.status}</b></p>
      ${g.status === "pending"
        ? `<button class="primary-btn">Approve</button>`
        : `<button class="danger-btn">Delete</button>`
      }
    `;

    const btn = div.querySelector("button");

    btn.onclick = async () => {
      if (g.status === "pending") {
        await updateDoc(doc(db, "groups", groupDoc.id), {
          status: "approved"
        });
        alert("Group approved");
      } else {
        if (!confirm("Delete group?")) return;
        await deleteDoc(doc(db, "groups", groupDoc.id));
        alert("Group deleted");
      }
      loadGroups();
    };

    groupsList.appendChild(div);
  });
}

// ===== INIT =====
loadUsers();
loadGroups();
