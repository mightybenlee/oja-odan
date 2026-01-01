import { deleteObject, ref } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, onSnapshot, doc, getDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

import { startRecording, stopRecording } from "./voice.js";

const recordBtn = document.getElementById("recordBtn");
let recording = false;

recordBtn.onclick = async () => {
  if (!recording) {
    await startRecording(recordBtn);
    recording = true;
  } else {
    stopRecording(recordBtn, async (audioBlob) => {
      const audioRef = ref(storage, `voice/${currentUser.uid}_${Date.now()}.webm`);
      await uploadBytes(audioRef, audioBlob);
      const audioUrl = await getDownloadURL(audioRef);

      await addDoc(collection(db, "groups", groupId, "messages"), {
        senderUid: currentUser.uid,
        senderName: currentUser.email,
        audio: audioUrl,
        timestamp: new Date()
      });

      recording = false;
    });
  }
};


/* Firebase config */
const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4,
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

const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const imageInput = document.getElementById("imageInput");

const groupId = new URLSearchParams(window.location.search).get("group");

let currentUser;

/* AUTH */
onAuthStateChanged(auth, async user => {
  if (!user) location.href = "index.html";
  currentUser = user;
  loadGroup();
  loadMessages();
});

/* LOAD GROUP */
async function loadGroup() {
  const gSnap = await getDoc(doc(db, "groups", groupId));
  if (!gSnap.exists()) return alert("Group not found");

  const g = gSnap.data();
  document.getElementById("groupName").innerText = g.name;

  if (!g.members.includes(currentUser.uid)) {
    alert("You are not a member");
    location.href = "groups.html";
  }

  if (g.muted?.includes(currentUser.uid)) {
    sendBtn.disabled = true;
    messageInput.placeholder = "You are muted by admin";
  }
}

/* SEND MESSAGE */
sendBtn.onclick = async () => {
  if (!messageInput.value && !imageInput.files[0]) return;

  let imgUrl = "";
  if (imageInput.files[0]) {
    const imgRef = ref(storage, `groupChats/${Date.now()}`);
    await uploadBytes(imgRef, imageInput.files[0]);
    imgUrl = await getDownloadURL(imgRef);
  }

  await addDoc(collection(db, "groups", groupId, "messages"), {
    senderUid: currentUser.uid,
    senderName: currentUser.email,
    text: messageInput.value,
    image: imgUrl,
    timestamp: new Date()
  });

  messageInput.value = "";
  imageInput.value = "";
};

/* REAL TIME CHAT */
function loadMessages() {
  onSnapshot(collection(db, "groups", groupId, "messages"), snap => {
    chatBox.innerHTML = "";

    snap.forEach(docu => {
      const m = docu.data();
      const isMe = m.senderUid === currentUser.uid;

      chatBox.innerHTML += `
        <div class="chat-msg ${isMe ? 'me' : ''}">
          <strong>${m.senderName}</strong>

          ${m.text ? `<p>${m.text}</p>` : ""}

          ${m.audio ? `
            <audio controls class="audio-msg">
              <source src="${m.audio}" type="audio/webm">
            </audio>
          ` : ""}

          ${m.image ? `<img src="${m.image}">` : ""}

          ${isMe ? `<button class="del-btn" data-id="${docu.id}" 
            data-audio="${m.audio || ''}" 
            data-image="${m.image || ''}">🗑</button>` : ""}
        </div>
      `;
    });

    chatBox.scrollTop = chatBox.scrollHeight;

    // DELETE HANDLER
    document.querySelectorAll(".del-btn").forEach(btn => {
      btn.onclick = async () => {
        const msgId = btn.dataset.id;
        const audioUrl = btn.dataset.audio;
        const imageUrl = btn.dataset.image;

        if (audioUrl) await deleteObject(ref(storage, audioUrl));
        if (imageUrl) await deleteObject(ref(storage, imageUrl));

        await deleteDoc(doc(db, "groups", groupId, "messages", msgId));
      };
    });
  });
}