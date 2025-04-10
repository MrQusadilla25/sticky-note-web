import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const auth = getAuth();
const db = getDatabase();

// Handle Sign Up
export function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("User signed up successfully!");
        // Optionally, add user to Firebase Realtime Database
        set(ref(db, 'users/' + user.uid), {
          email: user.email,
          displayName: "User", // Default display name
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

// Monitor auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("auth-area").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    setUserDisplayName(user.displayName || "User");
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