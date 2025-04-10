import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  update
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Initialize Firebase services
const auth = getAuth();
const db = getDatabase();

// Make available globally if needed elsewhere
window.auth = auth;
window.db = db;

// Signup function
window.signup = function () {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    return alert("Please fill out both email and password fields.");
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      return set(ref(db, `users/${user.uid}`), {
        email: user.email,
        displayName: "NO DISPLAY NAME",
        status: "online"
      });
    })
    .then(() => {
      alert("Account created successfully!");
      showApp();
      clearInputs(); // Clear input fields after successful signup
    })
    .catch((err) => alert("Signup Error: " + err.message));
};

// Login function
window.login = function () {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    return alert("Please fill out both email and password fields.");
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return update(ref(db, `users/${user.uid}`), {
        status: "online"
      });
    })
    .then(() => {
      alert("Logged in successfully!");
      showApp();
      clearInputs(); // Clear input fields after successful login
    })
    .catch((err) => alert("Login Error: " + err.message));
};

// Logout function
window.logout = function () {
  const user = auth.currentUser;
  if (user) {
    update(ref(db, `users/${user.uid}`), {
      status: "offline"
    }).finally(() => {
      signOut(auth)
        .then(() => {
          alert("Logged out!");
          location.reload();
        })
        .catch((err) => alert("Logout Error: " + err.message));
    });
  }
};

// Helper to switch to app view
function showApp() {
  const authArea = document.getElementById("auth-area");
  const appContainer = document.getElementById("app-container");

  if (authArea) authArea.style.display = "none";
  if (appContainer) appContainer.style.display = "flex";
}

// Check if user is already logged in when the page loads
window.onload = function () {
  const user = auth.currentUser;
  if (user) {
    showApp(); // Show the app if a user is logged in
  }
};

// Clear input fields after login or signup
function clearInputs() {
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
}
