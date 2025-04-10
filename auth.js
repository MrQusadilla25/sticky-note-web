// auth.js
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from './firebase-init.js';
import { initializeGreeting, setupAppEvents, showTab } from './main.js';

const auth = getAuth(app);

document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const displayName = prompt("Enter a display name:");
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    showApp(user);
  } catch (error) {
    alert("Signup error: " + error.message);
  }
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    showApp(user);
  } catch (error) {
    alert("Login error: " + error.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    showApp(user);
  }
});

function showApp(user) {
  document.getElementById("auth-area").style.display = "none";
  document.getElementById("app-container").style.display = "block";

  const name = user.displayName || "User";
  initializeGreeting(name);
  setupAppEvents(user);
  showTab("home-tab");
}

window.logout = () => {
  signOut(auth).then(() => {
    location.reload();
  });
};
