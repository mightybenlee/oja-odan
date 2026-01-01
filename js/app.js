import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// ===== Firebase config =====
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
const feedDiv = document.getElementById("feed");
const postBtn = document.getElementById("post-btn");
const postText = document.getElementById("post-text");
const postImg = document.getElementById("post-img");
const userAvatar = document.getElementById("user-avatar");

// ===== Auth check =====
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";

  // Update avatar in new post
  userAvatar.src = user.photoURL || `https://i.pravatar.cc/50?u=${user.uid}`;

  // Post button
  postBtn.onclick = async () => {
    if (!postText.value && !postImg.value) return;

    await addDoc(collection(db,"posts"), {
      uid: user.uid,
      name: user.displayName || user.email,
      avatar: user.photoURL || `https://i.pravatar.cc/50?u=${user.uid}`,
      text: postText.value,
      img: postImg.value || `https://picsum.photos/400?random=${Math.floor(Math.random()*1000)}`,
      timestamp: serverTimestamp(),
      likes: [],
      comments: []
    });

    postText.value = "";
    postImg.value = "";
  };

  // Live feed
  const postsCol = collection(db,"posts");
  onSnapshot(postsCol, snapshot => {
    feedDiv.innerHTML = "";
    snapshot.docs.sort((a,b) => b.data().timestamp?.seconds - a.data().timestamp?.seconds).forEach(docu => {
      const data = docu.data();
      const div = document.createElement("div");
      div.className = "post glass-card";

      const time = data.timestamp?.toDate ? timeAgo(data.timestamp.toDate()) : "";

      div.innerHTML = `
        <div class="post-header">
          <img src="${data.avatar}" alt="avatar">
          <b>${data.name}</b>
          <span style="margin-left:auto; font-size:12px; color:#ccc;">${time}</span>
        </div>
        <p>${data.text}</p>
        ${data.img?`<img src="${data.img}" alt="post-image">`:''}
        <div style="margin-top:10px;">
          <button class="like-btn">${data.likes.includes(user.uid)?'❤️':'🤍'} ${data.likes.length}</button>
          <input type="text" class="comment-input" placeholder="Comment">
          <button class="comment-btn">Comment</button>
          <div class="comments"></div>
        </div>
      `;
      feedDiv.appendChild(div);

      // Like button
      div.querySelector(".like-btn").onclick = async () => {
        const likes = data.likes.includes(user.uid) ? data.likes.filter(id=>id!==user.uid) : [...data.likes,user.uid];
        await updateDoc(doc(db,"posts",docu.id), {likes});
      };

      // Comment button
      div.querySelector(".comment-btn").onclick = async () => {
        const commentInput = div.querySelector(".comment-input");
        if(!commentInput.value) return;
        const newComments = [...data.comments,{uid:user.uid,name:user.displayName||user.email,text:commentInput.value}];
        await updateDoc(doc(db,"posts",docu.id), {comments:newComments});
        commentInput.value = "";
      };

      // Render comments
      const commentsDiv = div.querySelector(".comments");
      commentsDiv.innerHTML = "";
      data.comments.forEach(c => {
        const cDiv = document.createElement("div");
        cDiv.innerHTML = `<b>${c.name}</b>: ${c.text}`;
        commentsDiv.appendChild(cDiv);
      });
    });
  });
});

// ===== Utilities =====
function timeAgo(date){
  const now = new Date();
  const seconds = Math.floor((now - date)/1000);
  if(seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds/60);
  if(minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes/60);
  if(hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours/24);
  return `${days}d ago`;
}

