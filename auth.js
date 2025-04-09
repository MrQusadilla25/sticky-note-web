import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const auth = getAuth();
window.auth = auth;

document.addEventListener("DOMContentLoaded", () => {
  const authArea = document.getElementById("auth-area");
  const appContainer = document.getElementById("app-container");

  // LOGIN
  window.login = function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log("Logged in!");
      })
      .catch((error) => {
        alert("Login failed: " + error.message);
      });
  };

  // SIGN UP
  window.signup = function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Account created! Now you can log in.");
      })
      .catch((error) => {
        alert("Sign-up failed: " + error.message);
      });
  };

  // HANDLE LOGGED IN/OUT
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authArea.style.display = "none";
      appContainer.style.display = "block"; // or "flex" if you're using flex layout
    } else {
      authArea.style.display = "block";
      appContainer.style.display = "none";
    }
  });
});
