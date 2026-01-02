import { auth, db, storage } from "/js/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

// --------------------
// DOM ELEMENTS
// --------------------
const avatarImg = document.getElementById("profile-avatar");
const nameInput = document.getElementById("profile-name");
const bioInput = document.getElementById("profile-bio");
const saveBtn = document.getElementById("save-profile");

const avatarInput = document.getElementById("avatar-upload");
const changeAvatarBtn = document.getElementById("change-avatar");

// --------------------
// LOAD USER PROFILE
// --------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    nameInput.value = data.name || "";
    bioInput.value = data.bio || "";
    if (data.avatar) avatarImg.src = data.avatar;
  }
});

// --------------------
// SAVE PROFILE (NAME + BIO)
// --------------------
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateDoc(doc(db, "users", user.uid), {
      name: nameInput.value.trim(),
      bio: bioInput.value.trim()
    });

    alert("Profile updated");
  } catch (err) {
    alert(err.message);
  }
});

// --------------------
// AVATAR UPLOAD (REPLACE + DELETE OLD)
// --------------------
changeAvatarBtn.addEventListener("click", () => {
  avatarInput.click();
});

avatarInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  let oldPath = null;
  if (snap.exists()) {
    oldPath = snap.data().avatarPath || null;
  }

  try {
    // Delete old avatar if exists
    if (oldPath) {
      await deleteObject(ref(storage, oldPath));
    }

    // Upload new avatar
    const newPath = `avatars/${user.uid}_${Date.now()}`;
    const avatarRef = ref(storage, newPath);

    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);

    // Update Firestore
    await updateDoc(userRef, {
      avatar: url,
      avatarPath: newPath
    });

    avatarImg.src = url;
    alert("Avatar updated");

  } catch (err) {
    alert(err.message);
  }
});
