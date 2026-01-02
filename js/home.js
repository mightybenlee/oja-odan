// /home.js
import { auth, db, storage } from "/js/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

/* ===== DOM ===== */
const postBtn = document.getElementById("post-btn");
const postText = document.getElementById("new-post-text");
const postImage = document.getElementById("post-image");
const feed = document.getElementById("posts-feed");
const logoutBtn = document.getElementById("logout-btn");

/* ===== AUTH ===== */
let currentUser = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.replace("/index.html");
    return;
  }
  currentUser = user;
  loadFeed();
});

/* ===== LOGOUT ===== */
if (logoutBtn) {
  logoutBtn.onclick = () => {
    signOut(auth).then(() => {
      window.location.replace("/index.html");
    });
  };
}

/* ===== CREATE POST ===== */
postBtn.onclick = async () => {
  if (!currentUser) return;

  const text = postText.value.trim();
  const file = postImage.files[0];
  if (!text && !file) return;

  let imageUrl = "";

  if (file) {
    const imgRef = ref(storage, `posts/${currentUser.uid}_${Date.now()}`);
    await uploadBytes(imgRef, file);
    imageUrl = await getDownloadURL(imgRef);
  }

  await addDoc(collection(db, "posts"), {
    uid: currentUser.uid,
    author: currentUser.displayName || currentUser.email,
    text,
    image: imageUrl,
    createdAt: serverTimestamp()
  });

  postText.value = "";
  postImage.value = "";
};

/* ===== LOAD FEED ===== */
function loadFeed() {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snap => {
    feed.innerHTML = "";
    snap.forEach(docu => {
      const p = docu.data();

      const div = document.createElement("div");
      div.className = "glass-card post";

      div.innerHTML = `
        <h4>${p.author}</h4>
        <p>${p.text || ""}</p>
        ${p.image ? `<img src="${p.image}" class="post-image">` : ""}
      `;

      feed.appendChild(div);
    });
  });
  }
