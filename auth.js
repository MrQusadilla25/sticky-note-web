// auth.js
import { auth, db } from './firebase-init.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authArea = document.getElementById("auth-area");
const main = document.querySelector("main");

window.signup = function () {
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User signed up:", userCredential.user);
    })
    .catch((error) => {
      alert(error.message);
    });
};

window.login = function () {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User logged in:", userCredential.user);
    })
    .catch((error) => {
      alert(error.message);
    });
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    authArea.style.display = "none";
    main.style.display = "block";
  } else {
    authArea.style.display = "block";
    main.style.display = "none";
  }
});
