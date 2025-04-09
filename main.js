import { getDatabase, ref, set, push, get, onValue, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getDatabase();
const auth = window.auth;

// UI Elements
const recipientList = document.getElementById("recipientList");
const sendPrivateNoteBtn = document.getElementById("sendPrivateNoteBtn");
const privateNoteMessage = document.getElementById("privateNoteMessage");
const privateRecipientList = document.getElementById("privateRecipientList");

const noteColor = document.getElementById("noteColor");
const noteMessage = document.getElementById("noteMessage");
const sendNoteBtn = document.getElementById("sendNote");
const receivedNotes = document.getElementById("receivedNotes");

const displayNameInput = document.getElementById("displayNameInput");
const saveDisplayNameBtn = document.getElementById("saveDisplayName");

// On login
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);
  const userData = snapshot.val();

  const displayName = userData?.displayName || "NO DISPLAY NAME";
  const isAdmin = user.email === "dylanfumn@gmail.com";

  document.getElementById("welcomeMessage").textContent = isAdmin
    ? `Welcome back, ${displayName} (Admin)`
    : `Welcome, ${displayName}!`;

  // Pre-fill display name input
  if (displayNameInput && displayName !== "NO DISPLAY NAME") {
    displayNameInput.value = displayName;
  }

  loadMailbox(user.uid);
  loadUsersForPrivateNotes(isAdmin);
});

// Save display name
saveDisplayNameBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const newName = displayNameInput.value.trim();
  if (!newName) return alert("Please enter a display name.");

  try {
    await update(ref(db, `users/${user.uid}`), {
      displayName: newName
    });

    alert("Display name updated! Reload the page to see changes.");
  } catch (error) {
    console.error("Error updating display name:", error);
    alert("Something went wrong while saving your name.");
  }
});

// Send public sticky note
sendNoteBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userSnap = await get(ref(db, `users/${user.uid}`));
  const userData = userSnap.val();

  if (!userData || !userData.displayName || userData.displayName === "NO DISPLAY NAME") {
    return alert("Please set a display name before posting a note.");
  }

  const message = noteMessage.value.trim();
  if (!message) return alert("Please write a message.");

  const color = noteColor.value;

  await push(ref(db, `publicNotes`), {
    text: message,
    color,
    author: user.uid,
    authorName: userData.displayName,
    timestamp: Date.now()
  });

  noteMessage.value = "";
  alert("Public note sent!");
});

// Send private sticky note
sendPrivateNoteBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const recipientUID = privateRecipientList.value;
  const message = privateNoteMessage.value.trim();
  if (!message) return alert("Please write a private note.");

  const userSnap = await get(ref(db, `users/${user.uid}`));
  const userData = userSnap.val();

  await push(ref(db, `privateNotes/${recipientUID}`), {
    text: message,
    sender: user.uid,
    senderName: userData.displayName,
    timestamp: Date.now()
  });

  privateNoteMessage.value = "";
  alert("Private note sent!");
});

// Load received notes
function loadMailbox(currentUID) {
  const privateRef = ref(db, `privateNotes/${currentUID}`);
  onValue(privateRef, (snapshot) => {
    receivedNotes.innerHTML = "";
    snapshot.forEach((note) => {
      const data = note.val();
      const li = document.createElement("li");
      li.innerHTML = `<strong>From:</strong> ${data.senderName}<br>${data.text}`;
      receivedNotes.appendChild(li);
    });
  });
}

// Load users (with admin display of email)
function loadUsersForPrivateNotes(isAdmin) {
  const usersRef = ref(db, "users");
  onValue(usersRef, (snapshot) => {
    privateRecipientList.innerHTML = "";
    recipientList.innerHTML = "";

    snapshot.forEach((child) => {
      const user = child.val();
      const uid = child.key;

      if (!user.displayName) return;

      const label = isAdmin
        ? `${user.displayName} (${user.email})`
        : user.displayName;

      const option = document.createElement("option");
      option.value = uid;
      option.textContent = label;

      privateRecipientList.appendChild(option);
      recipientList.appendChild(option.cloneNode(true));
    });
  });
}
