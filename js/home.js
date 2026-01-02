// js/home.js

const postBtn = document.getElementById("postBtn");
const postText = document.getElementById("postText");
const postImage = document.getElementById("postImage");
const feed = document.getElementById("feed");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

// ---------------- AUTH -----------------
auth.onAuthStateChanged(user => {
  if (!user) return; // authGuard already redirects
  currentUser = user;

  // Disable posting for suspended users
  if (window.__USER_STATUS__ === "suspended") {
    postBtn.disabled = true;
    postBtn.innerText = "Account Suspended";
  }

  loadFeed();
});

// ---------------- LOGOUT -----------------
logoutBtn.onclick = () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
};

// ---------------- CREATE POST -----------------
postBtn.onclick = async () => {
  if (!currentUser) return;
  if (window.__USER_STATUS__ === "suspended") {
    alert("Your account is suspended. Cannot post.");
    return;
  }

  const text = postText.value.trim();
  const file = postImage.files[0];

  if (!text && !file) {
    alert("Cannot post empty content.");
    return;
  }

  let imageUrl = "";
  if (file) {
    const storageRef = storage.ref(`posts/${currentUser.uid}_${Date.now()}`);
    await storageRef.put(file);
    imageUrl = await storageRef.getDownloadURL();
  }

  await db.collection("posts").add({
    uid: currentUser.uid,
    author: currentUser.displayName || currentUser.email,
    text,
    image: imageUrl,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  postText.value = "";
  postImage.value = "";
};

// ---------------- LOAD FEED -----------------
function loadFeed() {
  const query = db.collection("posts").orderBy("createdAt", "desc");
  query.onSnapshot(snapshot => {
    feed.innerHTML = "";
    snapshot.forEach(doc => {
      const post = doc.data();

      const div = document.createElement("div");
      div.className = "glass-card post";
      div.innerHTML = `
        <p><strong>${post.author}</strong></p>
        <p>${post.text || ""}</p>
        ${post.image ? `<img src="${post.image}" class="post-image">` : ""}
      `;

      feed.appendChild(div);
    });
  });
}
