import { auth, db, storage } from "/js/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

const avatar = document.getElementById("profile-avatar");
const nameInput = document.getElementById("profile-name");
const upload = document.getElementById("avatar-upload");
const saveBtn = document.getElementById("save-profile");

let currentUser = null;
let oldAvatarPath = "";

onAuthStateChanged(auth, async user => {
  if (!user) return;
  currentUser = user;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    const data = snap.data();
    nameInput.value = data.name || "";
    avatar.src = data.avatar || "";
    oldAvatarPath = data.avatarPath || "";
  }
});

saveBtn.onclick = async () => {
  if (!currentUser) return;

  let avatarUrl = avatar.src;
  let avatarPath = oldAvatarPath;

  if (upload.files[0]) {
    if (oldAvatarPath) {
      await deleteObject(ref(storage, oldAvatarPath)).catch(()=>{});
    }
    avatarPath = `avatars/${currentUser.uid}`;
    const imgRef = ref(storage, avatarPath);
    await uploadBytes(imgRef, upload.files[0]);
    avatarUrl = await getDownloadURL(imgRef);
  }

  await setDoc(doc(db, "users", currentUser.uid), {
    name: nameInput.value,
    avatar: avatarUrl,
    avatarPath
  });

  alert("Profile saved");
};
