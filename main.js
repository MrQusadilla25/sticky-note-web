import { auth, db } from './firebase-init.js';
import { signUpUser, loginUser, sendNote } from './auth.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
  ref, get, update, onValue
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// DOM elements
const email = document.getElementById("email");
const password = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authSection = document.getElementById("auth-section");
const userSection = document.getElementById("user-section");
const tabs = document.getElementById("tabs");
const displayName = document.getElementById("display-name");
const bio = document.getElementById("bio");
const noteBox = document.getElementById("note");

// Auth actions
signupBtn.onclick = () => signUpUser(email.value, password.value);
loginBtn.onclick = () => loginUser(email.value, password.value);
logoutBtn.onclick = () => signOut(auth);

// Show tab
window.showTab = (name) => {
  ["profile", "settings", "send", "inbox"].forEach(id => {
    document.getElementById(`${id}-tab`).style.display = "none";
  });
  document.getElementById(`${name}-tab`).style.display = "block";
};

document.getElementById("saveSettingsBtn").onclick = async () => {
  const uid = auth.currentUser.uid;
  await update(ref(db, `users/${uid}`), {
    displayName: document.getElementById("nameInput").value,
    bio: document.getElementById("bioInput").value,
    color: document.getElementById("colorInput").value
  });
  alert("Updated!");
};

document.getElementById("sendNoteBtn").onclick = async () => {
  try {
    await sendNote(
      auth.currentUser.uid,
      document.getElementById("targetEmail").value,
      document.getElementById("noteText").value
    );
    document.getElementById("sendStatus").textContent = "Note sent!";
  } catch (e) {
    document.getElementById("sendStatus").textContent = e.message;
  }
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.style.display = "none";
    userSection.style.display = "block";
    tabs.style.display = "block";

    const snap = await get(ref(db, `users/${user.uid}`));
    const data = snap.val();

    displayName.textContent = data.displayName;
    bio.textContent = data.bio;
    noteBox.style.background = data.color;

    // Load inbox
    const inboxRef = ref(db, `users/${user.uid}/inbox`);
    onValue(inboxRef, (snapshot) => {
      const inboxDiv = document.getElementById("inboxMessages");
      inboxDiv.innerHTML = "";
      snapshot.forEach((child) => {
        const msg = child.val();
        const div = document.createElement("div");
        div.textContent = `${new Date(msg.timestamp).toLocaleString()} — ${msg.message}`;
        inboxDiv.appendChild(div);
      });
    });

    showTab("profile");
  } else {
    authSection.style.display = "block";
    userSection.style.display = "none";
    tabs.style.display = "none";
  }
});

// Dark mode
document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark-mode");
};
