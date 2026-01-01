import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, where, arrayUnion } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "oja-odan-6fc94.firebaseapp.com",
  projectId: "oja-odan-6fc94",
  storageBucket: "oja-odan-6fc94.appspot.com",
  messagingSenderId: "1096739384978",
  appId: "1:1096739384978:web:4a79774605ace1e2cbc04b",
  measurementId: "G-Y48C843PEQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// ===== DOM Elements =====
const groupNameInput = document.getElementById("group-name");
const groupDescInput = document.getElementById("group-desc");
const groupTypeSelect = document.getElementById("group-type");
const groupPinInput = document.getElementById("group-pin");
const createGroupBtn = document.getElementById("create-group-btn");
const groupsListDiv = document.getElementById("groups-list");

let currentUser;

// ===== Auth Check =====
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";
  currentUser = user;
  loadGroups();
});

// ===== Create Group =====
createGroupBtn.onclick = async () => {
  const name = groupNameInput.value.trim();
  const desc = groupDescInput.value.trim();
  const type = groupTypeSelect.value;
  const pin = type === "private" ? groupPinInput.value.trim() : "";

  if (!name || !desc) return alert("Please fill all fields");
  if (type === "private" && pin.length < 4) return alert("PIN must be at least 4 digits");

  await addDoc(collection(db, "groups"), {
    name,
    description: desc,
    isPublic: type === "public",
    pin,
    adminUid: currentUser.uid,
    members: [currentUser.uid], // Admin automatically member
    status: type === "public" ? "approved" : "pending",
    createdAt: new Date()
  });

  alert("Group created! Pending admin approval if private.");
  groupNameInput.value = "";
  groupDescInput.value = "";
  groupPinInput.value = "";
  loadGroups();
};

// ===== Load Groups =====
async function loadGroups() {
  const q = collection(db, "groups");
  onSnapshot(q, snapshot => {
    groupsListDiv.innerHTML = "";

    snapshot.docs.forEach(docu => {
      const data = docu.data();
      const div = document.createElement("div");
      div.className = "glass-card";
      div.innerHTML = `
        <h3>${data.name} (${data.isPublic ? "Public" : "Private"})</h3>
        <p>${data.description}</p>
        <p>Status: ${data.status}</p>
        <p>Members: ${data.members.length}</p>
        <button class="join-btn">${data.members.includes(currentUser.uid) ? "Joined" : "Join"}</button>
      `;
      groupsListDiv.appendChild(div);

      const joinBtn = div.querySelector(".join-btn");

      joinBtn.onclick = async () => {
        if (data.members.includes(currentUser.uid)) return alert("Already a member");

        if (!data.isPublic) {
          const userPin = prompt("Enter group PIN:");
          if (userPin !== data.pin) return alert("Incorrect PIN!");
        }

        // Add user to members
        await updateDoc(doc(db, "groups", docu.id), { members: arrayUnion(currentUser.uid) });
        alert("Joined group!");
      };
    });
  });
}