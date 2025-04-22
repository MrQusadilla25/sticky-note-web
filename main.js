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
const toast = document.getElementById("toast");
const loading = document.getElementById("loading");

// Helpers
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function showLoading(show) {
  loading.style.display = show ? "flex" : "none";
}

// Auth actions
signupBtn.onclick = async () => {
  try {
    showLoading(true);
    await signUpUser(email.value, password.value);
    showToast("Account created successfully!");
  } catch (e) {
    showToast(e.message);
  } finally {
    showLoading(false);
  }
};

loginBtn.onclick = async () => {
  try {
    showLoading(true);
    await loginUser(email.value, password.value);
    showToast("Logged in successfully!");
  } catch (e) {
    showToast(e.message);
  } finally {
    showLoading(false);
  }
};

logoutBtn.onclick = () => signOut(auth);

// Show tab
window.showTab = (name) => {
  ["profile", "settings", "send", "inbox"].forEach(id => {
    const tab = document.getElementById(`${id}-tab`);
    tab.classList.remove("tab-visible");
    setTimeout(() => tab.style.display = "none", 300);
  });

  const newTab = document.getElementById(`${name}-tab`);
  newTab.style.display = "block";
  setTimeout(() => newTab.classList.add("tab-visible"), 10);
};

document.getElementById("saveSettingsBtn").onclick = async () => {
  try {
    const uid = auth.currentUser.uid;
    await update(ref(db, `users/${uid}`), {
      displayName: document.getElementById("nameInput").value,
      bio: document.getElementById("bioInput").value,
      color: document.getElementById("colorInput").value
    });
    showToast("Settings updated!");
  } catch (e) {
    showToast(e.message);
  }
};

document.getElementById("sendNoteBtn").onclick = async () => {
  try {
    await sendNote(
      auth.currentUser.uid,
      document.getElementById("targetEmail").value,
      document.getElementById("noteText").value
    );
    showToast("Note sent!");
  } catch (e) {
    showToast(e.message);
  }
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.style.display = "none";
    userSection.style.display = "block";
    tabs.style.display = "flex";

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
