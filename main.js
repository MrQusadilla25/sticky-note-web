import { auth, db } from './firebase-init.js';
import { signUpUser, loginUser } from './auth.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const status = document.getElementById("status");
const authSection = document.getElementById("auth-section");
const userSection = document.getElementById("user-section");

// Sign up
signupBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return (status.textContent = "Enter email and password.");
  try {
    await signUpUser(email, password);
    status.textContent = "Signed up!";
  } catch (error) {
    status.textContent = "Sign-up error: " + error.message;
  }
});

// Log in
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return (status.textContent = "Enter email and password.");
  try {
    await loginUser(email, password);
    status.textContent = "Logged in!";
  } catch (error) {
    status.textContent = "Login error: " + error.message;
  }
});

// Log out
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  status.textContent = "Logged out.";
  userSection.style.display = "none";
  authSection.style.display = "block";
});

// Auto-login + show user data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snapshot = await get(ref(db, `users/${user.uid}`));
    const data = snapshot.val();

    if (data.suspended) {
      alert(`You are suspended. Reason: ${data.suspendReason || "No reason provided"}`);
      await signOut(auth);
      return;
    }

    document.getElementById("display-name").textContent = data.displayName;
    document.getElementById("bio").textContent = data.bio;
    document.getElementById("note").style.backgroundColor = data.color;
    document.getElementById("note").textContent = data.note || "(Empty note)";
    userSection.style.display = "block";
    authSection.style.display = "none";
  } else {
    userSection.style.display = "none";
    authSection.style.display = "block";
  }
});