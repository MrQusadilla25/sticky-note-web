import { auth } from "./firebase-init.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = signupForm.email.value;
  const password = signupForm.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      alert('Signed up successfully');
      signupForm.reset();
    })
    .catch((error) => {
      alert(error.message);
    });
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      alert('Logged in successfully');
      loginForm.reset();
      window.location.reload();
    })
    .catch((error) => {
      alert(error.message);
    });
});

logoutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      alert('Logged out successfully');
      window.location.reload();
    })
    .catch((error) => {
      alert(error.message);
    });
});