// Firebase core imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu5Rjah9i0_Q7W8-auTgpy4X7THw3Y6Zw",
  authDomain: "sendmeanote-99621.firebaseapp.com",
  projectId: "sendmeanote-99621",
  storageBucket: "sendmeanote-99621.firebasestorage.app",
  messagingSenderId: "172688156945",
  appId: "1:172688156945:web:e66ddb5f93bfd1cdf9c4b0",
  measurementId: "G-L9WVZR1LDV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, analytics, auth, db };
