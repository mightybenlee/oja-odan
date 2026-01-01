import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

import {
  collection,
  onSnapshot,
  query
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const input = document.getElementById("searchInput");
const results = document.getElementById("results");

let currentUser;
let blockedUsers = {};

onAuthStateChanged(auth, async user => {
  if (!user) location.href = "index.html";
  currentUser = user;

  const me = await getDoc(doc(db, "users", user.uid));
  blockedUsers = me.data()?.blocked || {};
});

input.oninput = () => runSearch(input.value.toLowerCase());

function runSearch(term) {
  results.innerHTML = "";

  // USERS
  onSnapshot(collection(db, "users"), snap => {
    snap.forEach(d => {
      const u = d.data();
      if (blockedUsers[d.id]) return;

      if (
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      ) {
        results.innerHTML += `
          <div class="glass-card">
            <img src="${u.photo || ''}" class="avatar-small">
            <strong>${u.name}</strong>
          </div>
        `;
      }
    });
  });

  // POSTS
  onSnapshot(collection(db, "posts"), snap => {
    snap.forEach(d => {
      const p = d.data();
      if (p.text?.toLowerCase().includes(term)) {
        results.innerHTML += `
          <div class="glass-card">
            <p>${p.text}</p>
          </div>
        `;
      }
    });
  });
}