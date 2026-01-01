import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, arrayUnion
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

/* ===== Firebase ===== */
const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "oja-odan-6fc94.firebaseapp.com",
  projectId: "oja-odan-6fc94",
  storageBucket: "oja-odan-6fc94.appspot.com",
  appId: "1:1096739384978:web:4a79774605ace1e2cbc04b",
  measurementId: "G-Y48C843PEQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ===== DOM ===== */
const groupsList = document.getElementById("groups-list");
const createBtn = document.getElementById("create-group-btn");

let currentUser;

/* ===== Auth ===== */
onAuthStateChanged(auth, user => {
  if (!user) location.href = "index.html";
  currentUser = user;
  loadGroups();
});

/* ================= CREATE GROUP ================= */
createBtn.onclick = async () => {
  const name = document.getElementById("group-name").value.trim();
  const desc = document.getElementById("group-desc").value.trim();
  const type = document.getElementById("group-type").value;
  const pin = document.getElementById("group-pin").value.trim();

  if (!name || !desc) return alert("Fill all fields");

  if (type === "private" && pin.length < 4)
    return alert("Private group PIN must be at least 4 digits");

  await addDoc(collection(db, "groups"), {
    name,
    description: desc,
    isPublic: type === "public",
    pin: type === "private" ? pin : "",
    adminUid: currentUser.uid,
    members: [currentUser.uid],
    status: type === "public" ? "approved" : "pending",
    createdAt: new Date()
  });

  alert("Group created. Awaiting admin approval if private.");
};

/* ================= LOAD GROUPS ================= */
function loadGroups() {
  const q = query(collection(db, "groups"), where("status", "==", "approved"));

  onSnapshot(q, snapshot => {
    groupsList.innerHTML = "";

    snapshot.forEach(docu => {
      const g = docu.data();
      const div = document.createElement("div");
      div.className = "glass-card";

      const isMember = g.members.includes(currentUser.uid);

      div.innerHTML = `
        <h3>${g.name}</h3>
        <p>${g.description}</p>
        <p>${g.isPublic ? "🌍 Public" : "🔒 Private"}</p>

        <button class="join-btn">
          ${isMember ? "Joined" : "Join Group"}
        </button>

        ${isMember ? `
          <textarea placeholder="Write something..." class="post-text"></textarea>
          <input type="file" class="post-img">
          <button class="post-btn">Post</button>
          <div class="posts"></div>
        ` : ""}
      `;

      groupsList.appendChild(div);

      /* ===== JOIN ===== */
      div.querySelector(".join-btn").onclick = async () => {
        if (isMember) return;

        if (!g.isPublic) {
          const userPin = prompt("Enter group PIN");
          if (userPin !== g.pin) return alert("Wrong PIN");
        }

        await updateDoc(doc(db, "groups", docu.id), {
          members: arrayUnion(currentUser.uid)
        });

        // notify admin
        await addDoc(collection(db, "notifications"), {
          to: g.adminUid,
          type: "group",
          message: `${currentUser.email} joined ${g.name}`,
          timestamp: new Date()
        });
      };

      /* ===== POSTS ===== */
      if (isMember) {
        const postBtn = div.querySelector(".post-btn");
        const postText = div.querySelector(".post-text");
        const postImg = div.querySelector(".post-img");
        const postsDiv = div.querySelector(".posts");

        postBtn.onclick = async () => {
          if (!postText.value && !postImg.files[0]) return;

          let imgUrl = "";
          if (postImg.files[0]) {
            const imgRef = ref(storage, `groupPosts/${Date.now()}`);
            await uploadBytes(imgRef, postImg.files[0]);
            imgUrl = await getDownloadURL(imgRef);
          }

          await addDoc(collection(db, "groups", docu.id, "posts"), {
            author: currentUser.email,
            text: postText.value,
            image: imgUrl,
            timestamp: new Date()
          });

          // notify members
          g.members.forEach(uid => {
            if (uid !== currentUser.uid) {
              addDoc(collection(db, "notifications"), {
                to: uid,
                type: "group",
                message: `New post in ${g.name}`,
                timestamp: new Date()
              });
            }
          });

          postText.value = "";
          postImg.value = "";
        };

        onSnapshot(collection(db, "groups", docu.id, "posts"), snap => {
          postsDiv.innerHTML = "";
          snap.forEach(p => {
            const post = p.data();
            postsDiv.innerHTML += `
              <div class="post">
                <strong>${post.author}</strong>
                <p>${post.text}</p>
                ${post.image ? `<img src="${post.image}">` : ""}
              </div>
            `;
          });
        });
      }
    });
  });
}