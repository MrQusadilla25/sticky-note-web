// Import the functions you need from the Firebase SDK
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Initialize Firebase Auth and Database
const auth = getAuth();
const db = getDatabase();

// Sign Up Function
export function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("User signed up successfully!");

        // Save the user's data to Firebase Database
        set(ref(db, 'users/' + user.uid), {
          email: user.email,
          displayName: "User",  // Default display name
        });

        // Optionally, update the UI or redirect the user
        document.getElementById("auth-area").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        setUserDisplayName(user.displayName || "User");
      })
      .catch((error) => {
        alert("Error signing up: " + error.message);
      });
  } else {
    alert("Please fill out both fields!");
  }
}

// Log In Function
export function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("User logged in successfully!");

        // Hide the login form and show the app content
        document.getElementById("auth-area").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        setUserDisplayName(user.displayName || "User");
      })
      .catch((error) => {
        alert("Error logging in: " + error.message);
      });
  } else {
    alert("Please fill out both fields!");
  }
}

// Log Out Function
export function logout() {
  signOut(auth)
    .then(() => {
      alert("User logged out successfully!");
      // Show login screen again
      document.getElementById("auth-area").style.display = "block";
      document.getElementById("app-container").style.display = "none";
    })
    .catch((error) => {
      alert("Error logging out: " + error.message);
    });
}

// Listen for Auth State Changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, show the app content
    document.getElementById("auth-area").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    setUserDisplayName(user.displayName || "User");
  } else {
    // No user is signed in, show login form
    document.getElementById("auth-area").style.display = "block";
    document.getElementById("app-container").style.display = "none";
  }
});

// Set the User's Display Name for the Greeting
function setUserDisplayName(name) {
  const greetingTextElement = document.getElementById("greetingText");
  const userDisplayName = name || "User";
  greetingTextElement.innerHTML = `Hello, ${userDisplayName}!`;
}