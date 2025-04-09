import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "./firebase-init.js";

const auth = getAuth(app);
window.auth = auth;

const authArea = document.getElementById("auth-area");
const appContainer = document.getElementById("app-container");

window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => console.log("Logged in!"))
    .catch((error) => alert("Login failed: " + error.message));
};

window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Account created! Now you can log in."))
    .catch((error) => alert("Sign-up failed: " + error.message));
};

// Control auth UI visibility
onAuthStateChanged(auth, (user) => {
  if (user) {
    authArea.style.display = "none";
    appContainer.style.display = "flex";
  } else {
    authArea.style.display = "block";
    appContainer.style.display = "none";
  }
});
