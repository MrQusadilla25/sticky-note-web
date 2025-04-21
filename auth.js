import { auth, db } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

document.getElementById('sign-up').addEventListener('click', () => {
  const email = email.value;
  const password = password.value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCred => {
      const uid = userCred.user.uid;
      const device = navigator.userAgent;
      set(ref(db, `users/${uid}`), {
        email,
        displayName: email.split('@')[0],
        device
      });
    });
});

document.getElementById('sign-in').addEventListener('click', () => {
  const email = email.value;
  const password = password.value;
  signInWithEmailAndPassword(auth, email, password);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    const device = navigator.userAgent;
    get(ref(db, `users/${uid}/suspended`)).then(snapshot => {
      if (snapshot.exists() && snapshot.val() === true) {
        alert("Account suspended: " + snapshot.val().reason);
        auth.signOut();
      } else {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('displayName').innerText = user.email.split('@')[0];
      }
    });
  }
});
