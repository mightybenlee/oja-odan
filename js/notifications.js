// js/notifications.js

const logoutBtn = document.getElementById("logoutBtn");
const friendRequestNotifications = document.getElementById("friendRequestNotifications");
const groupNotifications = document.getElementById("groupNotifications");
const adminNotifications = document.getElementById("adminNotifications");

let currentUser = null;

// ---------------- AUTH -----------------
auth.onAuthStateChanged(async user => {
  if (!user) return;
  currentUser = user;

  loadFriendRequestNotifications();
  loadGroupNotifications();
  loadAdminNotifications();
});

// ---------------- LOGOUT -----------------
logoutBtn.onclick = () => auth.signOut().then(() => window.location.href = "index.html");

// ---------------- FRIEND REQUEST NOTIFICATIONS -----------------
async function loadFriendRequestNotifications() {
  const snap = await db.collection("friendRequests")
    .where("to", "==", currentUser.uid)
    .where("status", "==", "pending")
    .get();

  friendRequestNotifications.innerHTML = "";
  if (snap.empty) {
    friendRequestNotifications.innerHTML = "<p>No new friend requests.</p>";
    return;
  }

  snap.forEach(doc => {
    const r = doc.data();
    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `
      <p>Friend request from <strong>${r.from}</strong></p>
      <button class="secondary-btn" onclick="acceptFriend('${doc.id}')">Accept</button>
      <button class="danger-btn" onclick="rejectFriend('${doc.id}')">Reject</button>
    `;
    friendRequestNotifications.appendChild(div);
  });
}

async function acceptFriend(docId) {
  const docRef = db.collection("friendRequests").doc(docId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return;

  const data = docSnap.data();

  // Add to friends collection for both users
  await db.collection("friends").doc(currentUser.uid).set({
    [data.from]: true
  }, { merge: true });
  await db.collection("friends").doc(data.from).set({
    [currentUser.uid]: true
  }, { merge: true });

  await docRef.update({ status: "accepted" });
  alert("Friend request accepted!");
  loadFriendRequestNotifications();
}

async function rejectFriend(docId) {
  await db.collection("friendRequests").doc(docId).update({ status: "rejected" });
  alert("Friend request rejected!");
  loadFriendRequestNotifications();
}

// ---------------- GROUP NOTIFICATIONS -----------------
async function loadGroupNotifications() {
  const snap = await db.collection("groups")
    .where("members", "array-contains", currentUser.uid)
    .get();

  groupNotifications.innerHTML = "";

  snap.forEach(doc => {
    const g = doc.data();
    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `<p>You are a member of group <strong>${g.name}</strong> (${g.type})</p>`;
    groupNotifications.appendChild(div);
  });
}

// ---------------- ADMIN SHOUTOUTS -----------------
async function loadAdminNotifications() {
  const snap = await db.collection("shoutouts").orderBy("createdAt", "desc").get();
  adminNotifications.innerHTML = "";

  snap.forEach(doc => {
    const s = doc.data();
    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `<p>${s.message}</p>`;
    adminNotifications.appendChild(div);
  });
}
