import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, deleteDoc,
  onSnapshot, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

/* Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyAHkztGejStIi5rJFVJ7NO8IkVJJ2ByoE4",
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
const postItemBtn = document.getElementById("postItem");
const marketList = document.getElementById("marketList");

let currentUser;

/* AUTH */
onAuthStateChanged(auth, user => {
  if (!user) location.href = "index.html";
  currentUser = user;
  loadItems();
});

/* POST ITEM */
postItemBtn.onclick = async () => {
  const title = itemTitle.value.trim();
  const price = itemPrice.value;
  const desc = itemDesc.value.trim();
  const file = itemImage.files[0];

  if (!title || !price || !file) return alert("Fill all fields");

  const imgRef = ref(storage, `market/${currentUser.uid}_${Date.now()}`);
  await uploadBytes(imgRef, file);
  const imgUrl = await getDownloadURL(imgRef);

  await addDoc(collection(db, "marketplace"), {
    sellerUid: currentUser.uid,
    sellerName: currentUser.email,
    title,
    description: desc,
    price,
    imageUrl: imgUrl,
    createdAt: new Date()
  });

  itemTitle.value = "";
  itemPrice.value = "";
  itemDesc.value = "";
  itemImage.value = "";
};

/* LOAD ITEMS */
function loadItems() {
  const q = query(collection(db, "marketplace"), orderBy("createdAt", "desc"));

  onSnapshot(q, snap => {
    marketList.innerHTML = "";

    snap.forEach(d => {
      const item = d.data();
      const div = document.createElement("div");
      div.className = "market-item";

      div.innerHTML = `
        <img src="${item.imageUrl}">
        <div class="info">
          <h4>${item.title}</h4>
          <p>$${item.price}</p>
          <small>${item.sellerName}</small>
          <button class="contact">Contact Seller</button>
          ${item.sellerUid === currentUser.uid ? `<button class="delete">Delete</button>` : ""}
        </div>
      `;

      marketList.appendChild(div);

      /* CONTACT */
      div.querySelector(".contact").onclick = () => {
        window.location.href = `profile.html?uid=${item.sellerUid}`;
      };

      /* DELETE */
      if (item.sellerUid === currentUser.uid) {
        div.querySelector(".delete").onclick = async () => {
          await deleteObject(ref(storage, item.imageUrl));
          await deleteDoc(doc(db, "marketplace", d.id));
        };
      }
    });
  });
}