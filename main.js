import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  update
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

// DOM elements
const receivedNotes = document.getElementById("receivedNotes");
const recipientList = document.getElementById("recipientList");
const privateRecipientList = document.getElementById("privateRecipientList");
const welcomeMessage = document.getElementById("welcomeMessage");

const appContainer = document.getElementById("app-container");
const authArea = document.getElementById("auth-area");

// Listen for auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    authArea.style.display = "none";
    appContainer.style.display = "flex";
    loadUsers();
    loadNotes(user.uid);
    loadPrivateNotes(user.uid);
    updateWelcomeMessage(user.uid);
  } else {
    authArea.style.display = "block";
    appContainer.style.display = "none";
  }
});

// Load all users for recipient lists
function loadUsers() {
  const usersRef = ref(db, "users");
  onValue(usersRef, (snapshot) => {
    recipientList.innerHTML = "";
    privateRecipientList.innerHTML = "";
    snapshot.forEach((child) => {
      const user = child.val();
      const option = document.createElement("option");
      option.value = child.key;
      option.textContent = user.displayName || user.email;
      recipientList.appendChild(option.cloneNode(true));
      privateRecipientList.appendChild(option.cloneNode(true));
    });
  });
}

// Load public notes
function loadNotes(currentUid) {
  const notesRef = ref(db, "notes");
  onValue(notesRef, (snapshot) => {
    receivedNotes.innerHTML = "";
    snapshot.forEach((child) => {
      const note = child.val();
      if (note.to === currentUid && !note.private) {
        const li = document.createElement("li");
        li.textContent = note.message;
        li.style.background = note.color || "yellow";
        receivedNotes.appendChild(li);
      }
    });
  });
}

// Load private notes
function loadPrivateNotes(currentUid) {
  const notesRef = ref(db, "notes");
  onValue(notesRef, (snapshot) => {
    snapshot.forEach((child) => {
      const note = child.val();
      if (note.to === currentUid && note.private) {
        const li = document.createElement("li");
        li.textContent = `(Private) ${note.message}`;
        li.style.background = note.color || "#ccc";
        receivedNotes.appendChild(li);
      }
    });
  });
}

// Send public note
document.getElementById("sendNote").addEventListener("click", () => {
  const to = recipientList.value;
  const message = document.getElementById("noteMessage").value;
  const color = document.getElementById("noteColor").value;
  const from = auth.currentUser.uid;

  if (!to || !message) return alert("Fill all fields.");

  const noteRef = push(ref(db, "notes"));
  set(noteRef, {
    to,
    from,
    message,
    color,
    private: false
  }).then(() => {
    alert("Note sent!");
    document.getElementById("noteMessage").value = "";
  });
});

// Send private note
document.getElementById("sendPrivateNoteBtn").addEventListener("click", () => {
  const to = privateRecipientList.value;
  const message = document.getElementById("privateNoteMessage").value;
  const from = auth.currentUser.uid;

  if (!to || !message) return alert("Fill all fields.");

  const noteRef = push(ref(db, "notes"));
  set(noteRef, {
    to,
    from,
    message,
    color: "#ccc",
    private: true
  }).then(() => {
    alert("Private note sent!");
    document.getElementById("privateNoteMessage").value = "";
  });
});

// Update display name
document.getElementById("saveDisplayName").addEventListener("click", () => {
  const newName = document.getElementById("displayNameInput").value.trim();
  const userId = auth.currentUser.uid;

  if (!newName) return alert("Please enter a display name.");

  const userRef = ref(db, `users/${userId}`);
  update(userRef, {
    displayName: newName
  }).then(() => {
    alert("Name updated!");
    updateWelcomeMessage(userId);
  });
});

// Update welcome message
function updateWelcomeMessage(uid) {
  const userRef = ref(db, `users/${uid}`);
  onValue(userRef, (snapshot) => {
    const user = snapshot.val();
    welcomeMessage.textContent = `Welcome, ${user.displayName || user.email}!`;
  });
}

// Logout function
window.logout = function () {
  signOut(auth).then(() => {
    alert("Logged out");
    location.reload();
  });
};

// Tab switching using showTab()
window.showTab = function (tabId) {
  document.querySelectorAll(".tab-section").forEach((section) => {
    section.style.display = "none";
  });
  const target = document.getElementById(tabId);
  if (target) {
    target.style.display = "block";
  }
};