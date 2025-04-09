import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const auth = window.auth;

window.login = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password).catch(err => alert(err.message));
};

window.signup = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password).then(userCred => {
    updateProfile(userCred.user, {
      displayName: email.split("@")[0]
    });
  }).catch(err => alert(err.message));
};
