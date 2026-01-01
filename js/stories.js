import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, onSnapshot, query, where,
  updateDoc, doc, arrayUnion
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

/* Firebase */
const firebaseConfig = {
  apiKey: "1:1096739384978:web:4a79774605ace1e2cbc04b",
  measurementId: "G-Y48C843PEQ"",
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

/* DOM */
const storiesBar = document.getElementById("storiesBar");
const storyFile = document.getElementById("storyFile");
const viewer = document.getElementById("storyViewer");
const storyContent = document.getElementById("storyContent");
const closeStory = document.getElementById("closeStory");

let currentUser;

/* AUTH */
onAuthStateChanged(auth, user => {
  if (!user) location.href = "index.html";
  currentUser = user;
  loadStories();
});

/* UPLOAD STORY */
storyFile.onchange = async () => {
  const file = storyFile.files[0];
  if (!file) return;

  const type = file.type.startsWith("video") ? "video" : "image";
  const refPath = ref(storage, `stories/${currentUser.uid}_${Date.now()}`);
  await uploadBytes(refPath, file);
  const url = await getDownloadURL(refPath);

  await addDoc(collection(db, "stories"), {
    userUid: currentUser.uid,
    userName: currentUser.email,
    mediaUrl: url,
    mediaType: type,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    viewers: []
  });

  alert("Story posted!");
};

/* LOAD STORIES (24h only) */
function loadStories() {
  const q = query(
    collection(db, "stories"),
    where("expiresAt", ">", new Date())
  );

  onSnapshot(q, snap => {
    storiesBar.innerHTML = "";

    snap.forEach(d => {
      const s = d.data();
      const div = document.createElement("div");
      div.className = "story-bubble";

      div.innerHTML = `<img src="${s.mediaUrl}">`;
      div.onclick = () => openStory(d.id, s);

      storiesBar.appendChild(div);
    });
  });
}

/* VIEW STORY */
async function openStory(id, story) {
  viewer.classList.remove("hidden");
  storyContent.innerHTML = story.mediaType === "video"
    ? `<video src="${story.mediaUrl}" autoplay></video>`
    : `<img src="${story.mediaUrl}">`;

  await updateDoc(doc(db, "stories", id), {
    viewers: arrayUnion(currentUser.uid)
  });
}

/* CLOSE */
closeStory.onclick = () => {
  viewer.classList.add("hidden");
  storyContent.innerHTML = "";
};