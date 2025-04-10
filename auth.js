import { auth, db } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Stay signed in
setPersistence(auth, browserLocalPersistence);

// Sign up
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save user info in database
    await set(ref(db, 'users/' + uid), {
      email: email,
      displayName: "User"
    });

    location.reload();
  } catch (error) {
    alert(error.message);
  }
};

// Log in
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.reload();
  } catch (error) {
    alert(error.message);
  }
};

// Log out
window.logout = async function () {
  await signOut(auth);
  location.reload();
};

// Check auth state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("auth-area").style.display = "none";
    document.getElementById("app-container").style.display = "block";

    // Get user data
    const snapshot = await get(ref(db, 'users/' + user.uid));
    const data = snapshot.val();
    const displayName = data?.displayName || "User";
    window.currentUser = user;
    window.currentDisplayName = displayName;

    window.setUserDisplayName(displayName);
    loadNotes();
  } else {
    document.getElementById("auth-area").style.display = "block";
    document.getElementById("app-container").style.display = "none";
  }
});
