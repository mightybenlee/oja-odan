// js/profile.js

const logoutBtn = document.getElementById("logoutBtn");

const profileAvatar = document.getElementById("profileAvatar");
const avatarUpload = document.getElementById("avatarUpload");
const changeAvatarBtn = document.getElementById("changeAvatarBtn");

const firstNameInput = document.getElementById("profileFirstName");
const lastNameInput = document.getElementById("profileLastName");
const usernameInput = document.getElementById("profileUsername");
const emailInput = document.getElementById("profileEmail");
const numberInput = document.getElementById("profileNumber");
const addressInput = document.getElementById("profileAddress");
const sexSelect = document.getElementById("profileSex");
const genderSelect = document.getElementById("profileGender");

const saveBtn = document.getElementById("saveProfileBtn");

let currentUser = null;
let oldAvatarPath = "";

// ---------------- AUTH -----------------
auth.onAuthStateChanged(async user => {
  if (!user) return; // authGuard.js will redirect
  currentUser = user;

  // Load profile from Firestore
  const docSnap = await db.collection("users").doc(user.uid).get();
  if (docSnap.exists) {
    const data = docSnap.data();
    firstNameInput.value = data.firstName || "";
    lastNameInput.value = data.lastName || "";
    usernameInput.value = data.username || "";
    emailInput.value = data.email || user.email;
    numberInput.value = data.phoneNumber || "";
    addressInput.value = data.address || "";
    sexSelect.value = data.sex || "";
    genderSelect.value = data.gender || "";
    profileAvatar.src = data.avatar || "assets/default-avatar.png";
    oldAvatarPath = data.avatarPath || "";
  }

  // Disable editing for suspended users
  if (window.__USER_STATUS__ === "suspended") {
    saveBtn.disabled = true;
    saveBtn.innerText = "Account Suspended";
    changeAvatarBtn.disabled = true;
  }
});

// ---------------- LOGOUT -----------------
logoutBtn.onclick = () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
};

// ---------------- CHANGE AVATAR BUTTON -----------------
changeAvatarBtn.onclick = () => avatarUpload.click();

// ---------------- SAVE PROFILE -----------------
saveBtn.onclick = async () => {
  if (!currentUser) return;
  if (window.__USER_STATUS__ === "suspended") {
    alert("Profile editing disabled (suspended)");
    return;
  }

  let avatarUrl = profileAvatar.src;
  let avatarPath = oldAvatarPath;

  if (avatarUpload.files[0]) {
    // Delete old avatar if exists
    if (oldAvatarPath) {
      try {
        await storage.ref(oldAvatarPath).delete();
      } catch (err) {
        console.warn("Old avatar not found or already deleted");
      }
    }

    avatarPath = `avatars/${currentUser.uid}_${Date.now()}`;
    const imgRef = storage.ref(avatarPath);
    await imgRef.put(avatarUpload.files[0]);
    avatarUrl = await imgRef.getDownloadURL();
  }

  // Update Firestore
  await db.collection("users").doc(currentUser.uid).set({
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
    username: usernameInput.value,
    phoneNumber: numberInput.value,
    address: addressInput.value,
    sex: sexSelect.value,
    gender: genderSelect.value,
    avatar: avatarUrl,
    avatarPath: avatarPath
  }, { merge: true });

  alert("Profile updated successfully!");
};
