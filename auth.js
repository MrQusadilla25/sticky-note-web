import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const auth = getAuth();
const db = getDatabase();
window.auth = auth;

window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return set(ref(db, `users/${user.uid}`), {
        email: user.email,
        displayName: "NO DISPLAY NAME",
        status: "online"
      });
    })
    .then(() => {
      alert("Account created successfully!");
    })
    .catch((err) => alert(err.message));
};

window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Logged in successfully!");
      document.getElementById("auth-area").style.display = "none";
      document.getElementById("app-container").style.display = "flex";
    })
    .catch((err) => alert(err.message));
};

window.logout = function () {
  signOut(auth).then(() => {
    location.reload();
  });
};