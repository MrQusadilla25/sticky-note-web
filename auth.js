import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Firebase Auth instance
const auth = getAuth();

// Handle Sign Up
export function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("User signed up successfully!");
        // Optionally set additional user data in Firebase Realtime Database
        const db = getDatabase();
        set(ref(db, 'users/' + user.uid), {
          email: user.email,
          displayName: "User", // Set default display name
        });
      })
      .catch((error) => {
        alert("Error signing up: " + error.message);
      });
  } else {
    alert("Please fill out both fields!");
  }
}

// Handle Login
export function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("User logged in successfully!");
        document.getElementById("auth-area").style.display = "none"; // Hide login form
        document.getElementById("app-container").style.display = "block"; // Show app content
        setUserDisplayName(user.displayName || "User");
      })
      .catch((error) => {
        alert("Error logging in: " + error.message);
      });
  } else {
    alert("Please fill out both fields!");
  }
}

// Handle Logout
export function logout() {
  signOut(auth)
    .then(() => {
      alert("Logged out");
      document.getElementById("auth-area").style.display = "block";
      document.getElementById("app-container").style.display = "none";
    })
    .catch((error) => {
      alert("Error logging out: " + error.message);
    });
}

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("auth-area").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    setUserDisplayName(user.displayName || "User"); // Set display name if available
  } else {
    document.getElementById("auth-area").style.display = "block";
    document.getElementById("app-container").style.display = "none";
  }
});

// Set the user display name and update greeting
function setUserDisplayName(displayName) {
  const greetingTextElement = document.getElementById("greetingText");
  greetingTextElement.innerHTML = `Hello, ${displayName || "User"}!`;
}