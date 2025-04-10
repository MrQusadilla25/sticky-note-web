import { auth, db } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, set, get, onValue, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Set persistence for the authentication state (call this once at the beginning)
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

    location.reload();  // Reload the page after successful sign-up
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
    location.reload();  // Reload the page after successful login
  } catch (error) {
    alert(error.message);
  }
};

// Log out
window.logout = async function () {
  await signOut(auth);
  location.reload();  // Reload the page after logging out
};

// Load notes for the signed-in user
function loadNotes() {
  if (!auth.currentUser) {
    return; // Return if no user is signed in
  }

  const uid = auth.currentUser.uid;
  const historyList = document.getElementById("noteHistory");
  historyList.innerHTML = "";  // Clear the list before appending new items

  onValue(ref(db, "users/" + uid + "/notes"), (snapshot) => {
    historyList.innerHTML = ""; // Clear the list again to ensure it's empty
    snapshot.forEach((childSnapshot) => {
      const note = childSnapshot.val();
      const li = document.createElement("li");
      li.textContent = `"${note.content}" to ${note.recipient} (${note.isPublic ? "Public" : "Private"})`;
      historyList.appendChild(li);
    });
  });
}

// Check authentication state (to handle login/signup sessions)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Show app and hide auth area if the user is logged in
    document.getElementById("auth-area").style.display = "none";
    document.getElementById("app-container").style.display = "block";

    // Get user data from Firebase
    const snapshot = await get(ref(db, 'users/' + user.uid));
    const data = snapshot.val();
    const displayName = data?.displayName || "User";
    window.currentUser = user;
    window.currentDisplayName = displayName;

    // Set the display name and load the user's notes
    window.setUserDisplayName(displayName);
    loadNotes();
  } else {
    // Show login/signup area if no user is signed in
    document.getElementById("auth-area").style.display = "block";
    document.getElementById("app-container").style.display = "none";
  }
});
