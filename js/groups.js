// js/groups.js

const logoutBtn = document.getElementById("logoutBtn");
const groupNameInput = document.getElementById("groupName");
const groupTypeSelect = document.getElementById("groupType");
const groupPinInput = document.getElementById("groupPin");
const createGroupBtn = document.getElementById("createGroupBtn");

const pendingGroupsDiv = document.getElementById("pendingGroups");
const availableGroupsDiv = document.getElementById("availableGroups");

let currentUser = null;

// ---------------- AUTH -----------------
auth.onAuthStateChanged(user => {
  if (!user) return;
  currentUser = user;

  loadPendingGroups();
  loadAvailableGroups();
});

// ---------------- LOGOUT -----------------
logoutBtn.onclick = () => auth.signOut().then(() => window.location.href = "index.html");

// ---------------- CREATE GROUP -----------------
createGroupBtn.onclick = async () => {
  if (!currentUser) return;
  if (window.__USER_STATUS__ === "suspended" || window.__USER_STATUS__ === "blocked") {
    alert("You cannot create groups with your current status.");
    return;
  }

  const name = groupNameInput.value.trim();
  const type = groupTypeSelect.value;
  const pin = groupPinInput.value.trim();

  if (!name) {
    alert("Enter a group name.");
    return;
  }

  if (type === "private" && !pin) {
    alert("Private groups require a PIN.");
    return;
  }

  await db.collection("groups").add({
    name,
    type,
    pin: type === "private" ? pin : "",
    creatorUid: currentUser.uid,
    approved: false,
    members: [currentUser.uid],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("Group created. Awaiting admin approval.");
  groupNameInput.value = "";
  groupPinInput.value = "";
  loadPendingGroups();
};

// ---------------- LOAD PENDING GROUPS -----------------
async function loadPendingGroups() {
  const snap = await db.collection("groups")
    .where("approved", "==", false)
    .get();

  pendingGroupsDiv.innerHTML = "";

  snap.forEach(doc => {
    const g = doc.data();
    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `
      <p><strong>${g.name}</strong> (${g.type})</p>
      <button class="approveBtn secondary-btn">Approve</button>
      <button class="rejectBtn danger-btn">Reject</button>
    `;

    // Only admin can approve/reject
    if (window.__USER_ROLE__ !== "admin") {
      div.querySelector(".approveBtn").disabled = true;
      div.querySelector(".rejectBtn").disabled = true;
    } else {
      div.querySelector(".approveBtn").onclick = async () => {
        await db.collection("groups").doc(doc.id).update({ approved: true });
        alert("Group approved.");
        loadPendingGroups();
        loadAvailableGroups();
      };
      div.querySelector(".rejectBtn").onclick = async () => {
        await db.collection("groups").doc(doc.id).delete();
        alert("Group rejected.");
        loadPendingGroups();
      };
    }

    pendingGroupsDiv.appendChild(div);
  });
}

// ---------------- LOAD AVAILABLE GROUPS -----------------
async function loadAvailableGroups() {
  const snap = await db.collection("groups")
    .where("approved", "==", true)
    .get();

  availableGroupsDiv.innerHTML = "";

  snap.forEach(doc => {
    const g = doc.data();
    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `
      <p><strong>${g.name}</strong> (${g.type})</p>
      <button class="joinBtn primary-btn">Join</button>
      <button class="leaveBtn danger-btn">Leave</button>
    `;

    // Join button
    div.querySelector(".joinBtn").onclick = async () => {
      if (g.type === "private") {
        const pin = prompt("Enter PIN to join this private group:");
        if (pin !== g.pin) {
          alert("Incorrect PIN.");
          return;
        }
      }
      const membersRef = db.collection("groups").doc(doc.id);
      await membersRef.update({
        members: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
      });
      alert("Joined group!");
    };

    // Leave button
    div.querySelector(".leaveBtn").onclick = async () => {
      const membersRef = db.collection("groups").doc(doc.id);
      await membersRef.update({
        members: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
      });
      alert("Left group!");
    };

    availableGroupsDiv.appendChild(div);
  });
}
