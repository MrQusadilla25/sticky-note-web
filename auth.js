// auth.js
import { auth, db } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  ref,
  set,
  update,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authArea = document.getElementById("auth-area");
const main = document.querySelector("main");

window.signup = function () {
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userRef = ref(db, 'users/' + user.uid);
      set(userRef, {
        displayName: "NO DISPLAY NAME",
        status: "online"
      });
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
      const user = userCredential.user;
      const userRef = ref(db, 'users/' + user.uid);

      update(userRef, {
        status: "online"
      });

      // Set offline status on disconnect
      onDisconnect(ref(db, 'users/' + user.uid + '/status')).set("offline");
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

// Optional: If you want a sign out button somewhere
window.logout = function () {
  const user = auth.currentUser;
  if (user) {
    const userRef = ref(db, 'users/' + user.uid);
    update(userRef, { status: "offline" });
  }

  signOut(auth);
};

