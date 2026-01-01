import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
  authDomain: "oja-odan-6fc94.firebaseapp.com",
  projectId: "oja-odan-6fc94",
  storageBucket: "oja-odan-6fc94.appspot.com",
  messagingSenderId: "1096739384978",
  appId: "1:1096739384978:web:4a79774605ace1e2cbc04b",
  measurementId: "G-Y48C843PEQ"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// ===== DOM Elements =====
const logoutBtn = document.getElementById("logout-btn");
const friendEmail = document.getElementById("friend-email");
const sendRequestBtn = document.getElementById("send-request");
const requestMsg = document.getElementById("request-msg");
const pendingRequestsDiv = document.getElementById("pending-requests");
const friendsListDiv = document.getElementById("friends-list");

// ===== Auth Check =====
let currentUser;
onAuthStateChanged(auth, user => {
  if(!user) window.location.href = "index.html";
  currentUser = user;
  loadPendingRequests();
  loadFriends();
});

// ===== Logout =====
logoutBtn.onclick = () => signOut(auth).then(() => window.location.href="index.html");

// ===== Send Friend Request with Notification =====
sendRequestBtn.onclick = async () => {
  const email = friendEmail.value.trim();
  if(!email) return;

  try {
    // Add friend request
    const requestRef = await addDoc(collection(db, "friendRequests"), {
      from: currentUser.email,
      to: email,
      status: "pending",
      timestamp: new Date()
    });

    // Add notification for recipient
    await addDoc(collection(db, "notifications"), {
      to: email,
      from: currentUser.displayName || currentUser.email,
      type: "friendRequest",
      message: `${currentUser.displayName || currentUser.email} sent you a friend request`,
      timestamp: new Date()
    });

    requestMsg.textContent = "Friend request sent!";
    friendEmail.value = "";

  } catch(err){
    requestMsg.textContent = "Failed: " + err.message;
  }
};

// ===== Load Pending Requests =====
function loadPendingRequests() {
  const q = query(collection(db, "friendRequests"), where("to", "==", currentUser.email));
  onSnapshot(q, snapshot => {
    pendingRequestsDiv.innerHTML = "";

    if(snapshot.empty){
      pendingRequestsDiv.innerHTML = "<p>No pending requests</p>";
      return;
    }

    snapshot.docs.forEach(docu => {
      const data = docu.data();
      const div = document.createElement("div");
      div.className = "glass-card friend-request";
      div.innerHTML = `
        <p><strong>${data.from}</strong> wants to be your friend</p>
        <button class="accept-btn">Accept</button>
        <button class="decline-btn">Decline</button>
      `;
      pendingRequestsDiv.appendChild(div);

      // Accept Friend
      div.querySelector(".accept-btn").onclick = async () => {
        await addDoc(collection(db, "friends"), {
          users: [currentUser.email, data.from],
          timestamp: new Date()
        });
        await deleteDoc(doc(db, "friendRequests", docu.id));

        // Notification to sender that request accepted
        await addDoc(collection(db, "notifications"), {
          to: data.from,
          from: currentUser.displayName || currentUser.email,
          type: "friendRequestAccepted",
          message: `${currentUser.displayName || currentUser.email} accepted your friend request`,
          timestamp: new Date()
        });
      };

      // Decline Friend
      div.querySelector(".decline-btn").onclick = async () => {
        await deleteDoc(doc(db, "friendRequests", docu.id));
      };
    });
  });
}

// ===== Load Friends List =====
function loadFriends() {
  const q = collection(db, "friends");
  onSnapshot(q, snapshot => {
    friendsListDiv.innerHTML = "";

    snapshot.docs.forEach(docu => {
      const data = docu.data();
      if(data.users.includes(currentUser.email)){
        const friendEmailAddress = data.users.find(u => u !== currentUser.email);
        const div = document.createElement("div");
        div.className = "glass-card friend-item";
        div.innerHTML = `
          <p>${friendEmailAddress}</p>
          <button class="block-btn">Block</button>
        `;
        friendsListDiv.appendChild(div);

        // Block friend (remove from friends)
        div.querySelector(".block-btn").onclick = async () => {
          await deleteDoc(doc(db, "friends", docu.id));

          // Optional: add notification about being blocked
          await addDoc(collection(db, "notifications"), {
            to: friendEmailAddress,
            from: currentUser.displayName || currentUser.email,
            type: "blocked",
            message: `${currentUser.displayName || currentUser.email} blocked you`,
            timestamp: new Date()
          });
        };
      }
    });

    if(friendsListDiv.innerHTML === ""){
      friendsListDiv.innerHTML = "<p>No friends yet</p>";
    }
  });
}

async function isBlocked(targetUid) {
  const snap = await getDoc(doc(db, "users", targetUid));
  return snap.data()?.blocked?.[currentUser.uid];
}