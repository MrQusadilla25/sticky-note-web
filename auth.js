import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const auth = window.auth;

window.signup = () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Signed up successfully!"))
    .catch((err) => alert(err.message));
};

window.login = () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Logged in!"))
    .catch((err) => alert(err.message));
};

window.logout = () => {
  signOut(auth)
    .then(() => alert("Logged out."))
    .catch((err) => alert(err.message));
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("auth-area").style.display = "none";
    document.querySelector("main").style.display = "block";
  } else {
    document.getElementById("auth-area").style.display = "block";
    document.querySelector("main").style.display = "none";
  }
});
