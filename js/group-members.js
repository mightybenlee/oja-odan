import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const membersList = document.getElementById("membersList");
const groupId = new URLSearchParams(window.location.search).get("group");

let currentUser, groupData;

/* AUTH */
onAuthStateChanged(auth, async user => {
  if (!user) location.href = "index.html";
  currentUser = user;
  await loadGroup();
  renderMembers();
});

/* LOAD GROUP */
async function loadGroup() {
  const snap = await getDoc(doc(db, "groups", groupId));
  if (!snap.exists()) return alert("Group not found");
  groupData = snap.data();

  if (!groupData.admins?.includes(currentUser.uid) && groupData.adminUid !== currentUser.uid) {
    alert("Admins only");
    history.back();
  }
}

/* RENDER MEMBERS */
function renderMembers() {
  membersList.innerHTML = "";

  groupData.members.forEach(uid => {
    const div = document.createElement("div");
    div.className = "member-card";

    div.innerHTML = `
      <p>${uid}</p>
      <button class="mute">Mute</button>
      <button class="kick">Remove</button>
      <button class="admin">Make Admin</button>
    `;

    membersList.appendChild(div);

    /* MUTE */
    div.querySelector(".mute").onclick = async () => {
      await updateDoc(doc(db, "groups", groupId), {
        muted: arrayUnion(uid)
      });
      notify(uid, "You were muted in a group");
    };

    /* REMOVE */
    div.querySelector(".kick").onclick = async () => {
      await updateDoc(doc(db, "groups", groupId), {
        members: arrayRemove(uid),
        muted: arrayRemove(uid)
      });
      notify(uid, "You were removed from a group");
    };

    /* MAKE ADMIN */
    div.querySelector(".admin").onclick = async () => {
      await updateDoc(doc(db, "groups", groupId), {
        admins: arrayUnion(uid)
      });
      notify(uid, "You are now a group admin");
    };
  });
}

/* NOTIFY */
function notify(to, message) {
  addDoc(collection(db, "notifications"), {
    to,
    type: "group",
    message,
    timestamp: new Date()
  });
}