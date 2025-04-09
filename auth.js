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
  get
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const auth = getAuth();
const db = getDatabase();
window.auth = auth;

// Helper function for email validation
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(email);
}

// Signup function
window.signup = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    return alert("Please fill out both email and password fields.");
  }

  if (!isValidEmail(email)) {
    return alert("Please enter a valid email address.");
  }

  // Show loading spinner (optional)
  document.getElementById("loading-spinner").style.display = "block";

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
    })
    .catch((err) => {
      alert("Signup Error: " + err.message);
    })
    .finally(() => {
      document.getElementById("loading-spinner").style.display = "none"; // Hide loading spinner
    });
};

// Login function
window.login = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    return alert("Please fill out both email and password fields.");
  }

  if (!isValidEmail(email)) {
    return alert("Please enter a valid email address.");
  }

  // Show loading spinner (optional)
  document.getElementById("loading-spinner").style.display = "block";

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Logged in successfully!");
      showApp();
    })
    .catch((err) => {
      alert("Login Error: " + err.message);
    })
    .finally(() => {
      document.getElementById("loading-spinner").style.display = "none"; // Hide loading spinner
    });
};

// Logout function
window.logout = function () {
  signOut(auth)
    .then(() => {
      alert("Logged out!");
      location.reload();
    })
    .catch((err) => alert("Logout Error: " + err.message));
};

// UI Switch Helper
function showApp() {
  document.getElementById("auth-area").style.display = "none";
  document.getElementById("app-container").style.display = "flex";
}
