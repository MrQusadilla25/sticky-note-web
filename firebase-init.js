// Initialize Firebase (your own config here)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("You have been logged out.");
      window.location.reload(); // or redirect to login page if you have one
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Error logging out.");
    });
});

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcnxp_iGUMTp4klEhiB5sCcCvh6IAxe9Y",
  authDomain: "stickynoteapp-883b8.firebaseapp.com",
  databaseURL: "https://stickynoteapp-883b8-default-rtdb.firebaseio.com",
  projectId: "stickynoteapp-883b8",
  storageBucket: "stickynoteapp-883b8.appspot.com",
  messagingSenderId: "637398429722",
  appId: "1:637398429722:web:e3f58a02328e68b75961a3",
  measurementId: "G-D27CEZ4WJN"
};

// Initialize the Firebase app with the config
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Make the auth object globally available
window.auth = auth;
