// js/auth.js

// Get forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Login form elements
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

// Register form elements
const regFirstName = document.getElementById("regFirstName");
const regLastName = document.getElementById("regLastName");
const regUsername = document.getElementById("regUsername");
const regEmail = document.getElementById("regEmail");
const regNumber = document.getElementById("regNumber");
const regAddress = document.getElementById("regAddress");
const regSex = document.getElementById("regSex");
const regGender = document.getElementById("regGender");
const regPassword = document.getElementById("regPassword");
const regRetypePassword = document.getElementById("regRetypePassword");

// ---------------- LOGIN -----------------
loginForm.addEventListener("submit", e => {
  e.preventDefault(); // prevent reload

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(async (cred) => {
      const user = cred.user;
      const adminSnap = await db.collection("admins").doc(user.uid).get();

      if (adminSnap.exists) {
        // User is admin → go to admin page
        window.location.href = "admin.html";
      } else {
        // Normal user → home
        window.location.href = "home.html";
      }
    })
    .catch(err => alert("Login failed: " + err.message));
});
// ---------------- REGISTER -----------------
registerForm.addEventListener("submit", async e => {
  e.preventDefault(); // prevent reload

  // Trim inputs
  const firstName = regFirstName.value.trim();
  const lastName = regLastName.value.trim();
  const username = regUsername.value.trim();
  const email = regEmail.value.trim();
  const number = regNumber.value.trim();
  const address = regAddress.value.trim();
  const sex = regSex.value;
  const gender = regGender.value;
  const password = regPassword.value;
  const retype = regRetypePassword.value;

  // Validation
  if (!firstName || !lastName || !username || !email || !number || !address || !sex || !gender || !password || !retype) {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== retype) {
    alert("Passwords do not match.");
    return;
  }

  try {
    // Create Firebase Auth user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    await db.collection("users").doc(user.uid).set({
      firstName,
      lastName,
      username,
      email,
      phoneNumber: number,
      address,
      sex,
      gender,
      role: "user",        // default role
      status: "active",    // active by default
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Registration successful!");
    window.location.href = "home.html";

  } catch (err) {
    alert("Registration failed: " + err.message);
  }
});




