import { auth, db } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// Sign up function
export function signUpUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const deviceName = navigator.userAgent;

      return set(ref(db, `users/${user.uid}`), {
        email: user.email,
        displayName: "New User",
        bio: "",
        note: "",
        color: "#ffff88",
        device: deviceName,
        suspended: false
      });
    });
}