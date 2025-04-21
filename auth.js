import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

export async function signUpUser(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await set(ref(db, "users/" + cred.user.uid), {
    email: email,
    displayName: "New User",
    bio: "This is my bio.",
    note: "Hello world!",
    color: "#ffff88",
    suspended: false
  });
}

export async function loginUser(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}