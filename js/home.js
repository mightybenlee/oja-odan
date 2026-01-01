import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, updateDoc, arrayUnion, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

import { doc, setDoc, updateDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

async function reportItem(type, reportedId, reason = "Abuse") {
  await addDoc(collection(db, "reports"), {
    type,
    reportedId,
    reportedBy: currentUser.uid,
    reason,
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("Report submitted");
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("report-btn")) {
    reportItem("post", e.target.dataset.id);
  }
});
const userRef = doc(db, "users", user.uid);

await setDoc(userRef, {
  name: user.displayName || user.email,
  photo: user.photoURL || "",
  online: true,
  lastSeen: serverTimestamp()
}, { merge: true });

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
const storage = getStorage(app);

// ===== DOM Elements =====
const logoutBtn = document.getElementById("logout-btn");
const newPostText = document.getElementById("new-post-text");
const postImage = document.getElementById("post-image");
const postBtn = document.getElementById("post-btn");
const postsFeed = document.getElementById("posts-feed");

// ===== Auth Check =====
let currentUser;
let friendsList = [];
onAuthStateChanged(auth, async user => {
  if(!user) window.location.href = "index.html";
  currentUser = user;
  await loadFriendsList();
  loadFeed();
});

// ===== Logout =====
logoutBtn.onclick = () => signOut(auth).then(() => window.location.href="index.html");

// ===== Load Friends List =====
async function loadFriendsList(){
  const q = collection(db, "friends");
  const snapshot = await getDocs(q);
  friendsList = snapshot.docs
    .filter(docu => docu.data().users.includes(currentUser.email))
    .map(docu => docu.data().users.find(u => u !== currentUser.email));
}

import { onSnapshot } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const statusEl = document.getElementById("userStatus");

onSnapshot(doc(db, "users", userUid), snap => {
  if (!snap.exists()) return;
  const u = snap.data();

  if (u.online) {
    statusEl.innerHTML = `<span class="dot online"></span> Online`;
  } else {
    statusEl.innerHTML = `<span class="dot offline"></span> Last seen`;
  }
});

function formatLastSeen(ts) {
  if (!ts) return "";
  const date = ts.toDate();
  return date.toLocaleString();
}
// ===== Create New Post =====
postBtn.onclick = async () => {
  const text = newPostText.value.trim();
  if(!text && !postImage.files[0]) return;

  let imageUrl = "";
  if(postImage.files[0]){
    const file = postImage.files[0];
    const storageRef = ref(storage, `posts/${currentUser.uid}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "posts"), {
    uid: currentUser.uid,
    email: currentUser.email,
    author: currentUser.displayName || currentUser.email,
    text,
    imageUrl,
    likes: [],
    timestamp: new Date()
  });

  newPostText.value = "";
  postImage.value = "";
};

// ===== Load Home Feed =====
function loadFeed() {
  const q = collection(db, "posts");
  onSnapshot(q, snapshot => {
    postsFeed.innerHTML = "";

    // Filter posts to show only friends or self
    const filteredPosts = snapshot.docs
      .filter(docu => friendsList.includes(docu.data().email) || docu.data().email === currentUser.email)
      .sort((a,b) => b.data().timestamp - a.data().timestamp);

    filteredPosts.forEach(docu => {
      const data = docu.data();
      const div = document.createElement("div");
      div.className = "glass-card post-card";
      div.innerHTML = `
        <h4 class="post-author" data-email="${data.email}">${data.author}</h4>
        <p>${data.text}</p>
        ${data.imageUrl ? `<img src="${data.imageUrl}" class="post-image">` : ""}
        <div class="post-actions">
          <button class="like-btn">${data.likes.includes(currentUser.uid) ? "❤️ Liked" : "🤍 Like"} (${data.likes.length})</button>
          <input type="text" class="comment-input" placeholder="Comment...">
          <button class="comment-btn">Post</button>
        </div>
        <div class="comments-list"></div>
      `;
      postsFeed.appendChild(div);


      // Clickable author -> go to profile page
      div.querySelector(".post-author").onclick = () => {
        window.location.href = `profile.html?user=${encodeURIComponent(data.email)}`;
      };

      // Like button
      div.querySelector(".like-btn").onclick = async () => {
        if(!data.likes.includes(currentUser.uid)){
          await updateDoc(doc(db, "posts", docu.id), { likes: arrayUnion(currentUser.uid) });

          if(currentUser.email !== data.email){
            await addDoc(collection(db, "notifications"), {
              to: data.email,
              from: currentUser.displayName || currentUser.email,
              type: "like",
              message: `${currentUser.displayName || currentUser.email} liked your post`,
              timestamp: new Date()
            });
          }
        }
      };

      // Comment button
      const commentInput = div.querySelector(".comment-input");
      div.querySelector(".comment-btn").onclick = async () => {
        const commentText = commentInput.value.trim();
        if(!commentText) return;

        const commentsRef = collection(db, "posts", docu.id, "comments");
        await addDoc(commentsRef, {
          user: currentUser.displayName || currentUser.email,
          text: commentText,
          timestamp: new Date()
        });

        // Add notification
        if(currentUser.email !== data.email){
          await addDoc(collection(db, "notifications"), {
            to: data.email,
            from: currentUser.displayName || currentUser.email,
            type: "comment",
            message: `${currentUser.displayName || currentUser.email} commented: "${commentText}"`,
            timestamp: new Date()
          });
        }

        commentInput.value = "";
      };

      // Load comments in real-time
      const commentsDiv = div.querySelector(".comments-list");
      const commentsRef = collection(db, "posts", docu.id, "comments");
      onSnapshot(commentsRef, snapshot => {
        commentsDiv.innerHTML = "";
        snapshot.docs
          .sort((a,b) => a.data().timestamp - b.data().timestamp)
          .forEach(commentDoc => {
            const cData = commentDoc.data();
            const p = document.createElement("p");
            p.textContent = `${cData.user}: ${cData.text}`;
            commentsDiv.appendChild(p);
          });
      });
    });
  });
}