import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore, collection, query, where, orderBy,
  onSnapshot, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

/* Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "oja-odan-6fc94.firebaseapp.com",
  projectId: "oja-odan-6fc94",
  appId: "1:1096739384978:web:4a79774605ace1e2cbc04b",
  measurementId: "G-Y48C843PEQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* DOM */
const notifBtn = document.getElementById("notifBtn");
const notifDropdown = document.getElementById("notifDropdown");
const notifCount = document.getElementById("notifCount");

let currentUser;

/* TOGGLE */
notifBtn.onclick = () => {
  notifDropdown.classList.toggle("hidden");
};

/* AUTH */
onAuthStateChanged(auth, user => {
  if (!user) return;
  currentUser = user;
  listenNotifications();
});

/* REALTIME LISTENER */
function listenNotifications() {
  const q = query(
    collection(db, "notifications"),
    where("to", "==", currentUser.uid),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, snap => {
    notifDropdown.innerHTML = "";
    let unread = 0;

    snap.forEach(d => {
      const n = d.data();
      if (!n.read) unread++;

      const div = document.createElement("div");
      div.className = "notif-item " + (!n.read ? "unread" : "");
      div.innerHTML = `<p>${n.message}</p>`;

      div.onclick = async () => {
        await updateDoc(doc(db, "notifications", d.id), { read: true });
        if (n.link) location.href = n.link;
      };

      notifDropdown.appendChild(div);
    });

    notifCount.innerText = unread;
    notifCount.style.display = unread ? "inline-block" : "none";
  });
}