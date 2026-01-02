// js/friends.js

const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchUserInput");
const searchResults = document.getElementById("searchResults");
const incomingRequests = document.getElementById("incomingRequests");
const friendsList = document.getElementById("friendsList");

let currentUser = null;

// ---------------- AUTH -----------------
auth.onAuthStateChanged(async user => {
  if (!user) return; // authGuard handles redirect
  currentUser = user;

  loadFriends();
  loadIncomingRequests();
});

// ---------------- LOGOUT -----------------
logoutBtn.onclick = () => auth.signOut().then(() => window.location.href = "index.html");

// ---------------- SEARCH USERS -----------------
searchInput.addEventListener("input", async () => {
  const queryText = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = "";

  if (!queryText) return;

  const snap = await db.collection("users")
    .where("username", ">=", queryText)
    .where("username", "<=", queryText + "\uf8ff")
    .get();

  snap.forEach(doc => {
    const u = doc.data();
    if (doc.id === currentUser.uid) return; // skip self

    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `
      <p><strong>${u.username}</strong></p>
      <button data-uid="${doc.id}" class="sendRequestBtn secondary-btn">Send Friend Request</button>
    `;
    div.querySelector(".sendRequestBtn").onclick = () => sendFriendRequest(doc.id);
    searchResults.appendChild(div);
  });
});

// ---------------- SEND FRIEND REQUEST -----------------
async function sendFriendRequest(targetUid) {
  const requestRef = db.collection("friendRequests").doc(`${currentUser.uid}_${targetUid}`);
  const exists = await requestRef.get();
  if (exists.exists) {
    alert("Request already sent.");
    return;
  }

  await requestRef.set({
    from: currentUser.uid,
    to: targetUid,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("Friend request sent!");
}

// ---------------- INCOMING REQUESTS -----------------
async function loadIncomingRequests() {
  const snap = await db.collection("friendRequests")
    .where("to", "==", currentUser.uid)
    .where("status", "==", "pending")
    .get();

  incomingRequests.innerHTML = "";

  snap.forEach(doc => {
    const r = doc.data();
    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `
      <p>Friend request from: <strong>${r.from}</strong></p>
      <button data-id="${doc.id}" class="acceptBtn secondary-btn">Accept</button>
      <button data-id="${doc.id}" class="rejectBtn danger-btn">Reject</button>
    `;

    div.querySelector(".acceptBtn").onclick = () => respondRequest(doc.id, "accepted");
    div.querySelector(".rejectBtn").onclick = () => respondRequest(doc.id, "rejected");

    incomingRequests.appendChild(div);
  });
}

// ---------------- RESPOND TO REQUEST -----------------
async function respondRequest(docId, action) {
  const docRef = db.collection("friendRequests").doc(docId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return;

  const data = docSnap.data();

  if (action === "accepted") {
    // Add to friends collection for both users
    await db.collection("friends").doc(currentUser.uid).set({
      [data.from]: true
    }, { merge: true });

    await db.collection("friends").doc(data.from).set({
      [currentUser.uid]: true
    }, { merge: true });
  }

  await docRef.update({ status: action });
  loadIncomingRequests();
  loadFriends();
}

// ---------------- LOAD FRIENDS -----------------
async function loadFriends() {
  const snap = await db.collection("friends").doc(currentUser.uid).get();
  friendsList.innerHTML = "";

  if (!snap.exists) {
    friendsList.innerHTML = "<p>No friends yet.</p>";
    return;
  }

  const friendsData = snap.data();
  for (const friendUid in friendsData) {
    const userSnap = await db.collection("users").doc(friendUid).get();
    const user = userSnap.data();

    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `
      <p><strong>${user.username || user.firstName}</strong></p>
      <button data-uid="${friendUid}" class="blockBtn danger-btn">Block</button>
    `;
    div.querySelector(".blockBtn").onclick = () => blockFriend(friendUid);

    friendsList.appendChild(div);
  }
}

// ---------------- BLOCK FRIEND -----------------
async function blockFriend(friendUid) {
  if (!confirm("Are you sure you want to block this friend?")) return;
  // Optionally, remove from friends collection
  await db.collection("friends").doc(currentUser.uid).update({
    [friendUid]: firebase.firestore.FieldValue.delete()
  });
  alert("Friend blocked.");
  loadFriends();
}
