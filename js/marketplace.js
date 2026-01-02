const logoutBtn = document.getElementById("logoutBtn");
const postBtn = document.getElementById("postItemBtn");
const itemNameInput = document.getElementById("itemName");
const itemPriceInput = document.getElementById("itemPrice");
const itemImageInput = document.getElementById("itemImage");
const marketplaceFeed = document.getElementById("marketplaceFeed");

let currentUser = null;

auth.onAuthStateChanged(user => {
  if (!user) return;
  currentUser = user;
  loadMarketplaceItems();
});

logoutBtn.onclick = () => auth.signOut().then(() => window.location.href = "index.html");

postBtn.onclick = async () => {
  if (!currentUser) return;

  const name = itemNameInput.value.trim();
  const price = parseFloat(itemPriceInput.value);
  const file = itemImageInput.files[0];

  if (!name || !price) {
    alert("Please enter item name and price.");
    return;
  }

  let imageUrl = "";
  if (file) {
    const storageRef = storage.ref(`marketplace/${currentUser.uid}_${Date.now()}`);
    await storageRef.put(file);
    imageUrl = await storageRef.getDownloadURL();
  }

  await db.collection("marketplace").add({
    sellerUid: currentUser.uid,
    name,
    price,
    image: imageUrl,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  itemNameInput.value = "";
  itemPriceInput.value = "";
  itemImageInput.value = "";

  loadMarketplaceItems();
};

async function loadMarketplaceItems() {
  const snap = await db.collection("marketplace").orderBy("createdAt", "desc").get();
  marketplaceFeed.innerHTML = "";

  snap.forEach(doc => {
    const item = doc.data();
    const div = document.createElement("div");
    div.className = "glass-card";
    div.innerHTML = `
      <p><strong>${item.name}</strong></p>
      <p>Price: $${item.price.toFixed(2)}</p>
      ${item.image ? `<img src="${item.image}" class="marketplace-image">` : ""}
    `;
    marketplaceFeed.appendChild(div);
  });
}
