import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const auth = getAuth();
const db = getDatabase();
window.auth = auth;

const authArea = document.getElementById("auth-area");
const appContainer = document.getElementById("app-container");

window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userRef = ref(db, `users/${user.uid}`);
      set(userRef, {
        email: user.email,
        displayName: "NO DISPLAY NAME",
        status: "online"
      }).then(() => {
        alert("Account created successfully!");
        // Hide the login area and show the app content
        authArea.style.display = "none";
        appContainer.style.display = "block";
        loadUserData(user.uid);
      }).catch((error) => {
        alert("Error saving user info: " + error.message);
      });
    })
    .catch((error) => {
      alert(error.message);
    });
};

window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userRef = ref(db, `users/${user.uid}`);
      // Ensure user record is created if not exists
      set(userRef, {
        email: user.email,
        displayName: "NO DISPLAY NAME",
        status: "online"
      }).then(() => {
        alert("Login successful!");
        // Hide the login area and show the app content
        authArea.style.display = "none";
        appContainer.style.display = "block";
        loadUserData(user.uid);
      }).catch((error) => {
        alert("Error saving user info: " + error.message);
      });
    })
    .catch((error) => {
      alert(error.message);
    });
};

function loadUserData(userId) {
  const userRef = ref(db, `users/${userId}`);
  get(userRef).then((snapshot) => {
    const userData = snapshot.val();
    if (userData) {
      const displayName = userData.displayName;
      document.getElementById("welcomeMessage").textContent = `Welcome, ${displayName || "Guest"}!`;
    }
  }).catch((error) => {
    console.log("Error loading user data:", error);
  });
}
