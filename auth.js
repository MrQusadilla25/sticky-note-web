import { db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
  ref,
  set,
  push,
  get,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

export async function signUpUser(email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await set(ref(db, `users/${user.uid}`), {
    email,
    displayName: email.split("@")[0],
    bio: "",
    color: "#fffaa8",
  });
}

export async function loginUser(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function sendNote(fromUID, toEmail, message) {
  const snapshot = await get(ref(db, "users"));
  let targetUID = null;

  snapshot.forEach((child) => {
    if (child.val().email === toEmail) targetUID = child.key;
  });

  if (!targetUID) throw new Error("User not found");

  const noteRef = push(ref(db, `users/${targetUID}/inbox`));
  await set(noteRef, {
    from: fromUID,
    message,
    timestamp: Date.now(),
  });
}