import { auth, db, storage } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

// DOM
const logoutBtn = document.getElementById("logout-btn");
const profileAvatar = document.getElementById("profile-avatar");
const changeAvatar = document.getElementById("change-avatar");
const avatarUpload = document.getElementById("avatar-upload");
const profileName = document.getElementById("profile-name");
const profileBio = document.getElementById("profile-bio");
const saveProfile = document.getElementById("save-profile");
const userPostsDiv = document.getElementById("user-posts");

let currentUser;
let currentAvatarPath = null;

// AUTH CHECK
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  profileAvatar.src = user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`;
  profileName.value = user.displayName || "";

  loadUserPosts();
});

// LOGOUT
logoutBtn.onclick = () => {
  signOut(auth).then(() => window.location.href = "index.html");
};

// CHANGE AVATAR
changeAvatar.onclick = () => avatarUpload.click();

avatarUpload.onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    // delete old avatar
    if (currentAvatarPath) {
      await deleteObject(ref(storage, currentAvatarPath)).catch(() => {});
    }

    // upload new
    const avatarRef = ref(storage, `avatars/${currentUser.uid}`);
    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);

    currentAvatarPath = avatarRef.fullPath;

    await updateProfile(currentUser, { photoURL: url });
    await updateDoc(doc(db, "users", currentUser.uid), {
      photo: url,
      photoPath: currentAvatarPath
    });

    profileAvatar.src = url;
    alert("Profile picture updated");
  } catch (err) {
    alert(err.message);
  }
};

// SAVE PROFILE
saveProfile.onclick = async () => {
  try {
    await updateProfile(currentUser, {
      displayName: profileName.value
    });

    await updateDoc(doc(db, "users", currentUser.uid), {
      name: profileName.value,
      bio: profileBio.value
    });

    alert("Profile updated");
  } catch (err) {
    alert(err.message);
  }
};

// LOAD USER POSTS
function loadUserPosts() {
  const q = query(
    collection(db, "posts"),
    where("uid", "==", currentUser.uid)
  );

  onSnapshot(q, snap => {
    userPostsDiv.innerHTML = "";
    snap.forEach(d => {
      const post = d.data();
      userPostsDiv.innerHTML += `<div class="glass-card"><p>${post.text}</p></div>`;
    });
  });
}

import {
  getDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const blockBtn = document.getElementById("blockUserBtn");
const unblockBtn = document.getElementById("unblockUserBtn");

// profileUserId = UID of profile being viewed
let profileUserId = null;

// Call this when viewing another user's profile
async function loadPrivacyState() {
  if (!profileUserId || profileUserId === currentUser.uid) return;

  const myDoc = await getDoc(doc(db, "users", currentUser.uid));
  const blocked = myDoc.data()?.blocked || {};

  if (blocked[profileUserId]) {
    blockBtn.classList.add("hidden");
    unblockBtn.classList.remove("hidden");
  } else {
    unblockBtn.classList.add("hidden");
    blockBtn.classList.remove("hidden");
  }
}

blockBtn.onclick = async () => {
  await updateDoc(doc(db, "users", currentUser.uid), {
    [`blocked.${profileUserId}`]: true
  });
  alert("User blocked");
  loadPrivacyState();
};

unblockBtn.onclick = async () => {
  await updateDoc(doc(db, "users", currentUser.uid), {
    [`blocked.${profileUserId}`]: false
  });
  alert("User unblocked");
  loadPrivacyState();
};

async function isBlocked(targetUid) {
  const snap = await getDoc(doc(db, "users", targetUid));
  return snap.data()?.blocked?.[currentUser.uid];
}

reportUserBtn.onclick = () => {
  reportItem("user", profileUserId, "Harassment");
};