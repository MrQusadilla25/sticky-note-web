import { getDatabase, ref, set, push, get, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getDatabase();
const auth = window.auth;

const displayNameInput = document.getElementById("displayNameInput");
const saveDisplayNameBtn = document.getElementById("saveDisplayName");

const recipientList = document.getElementById("recipientList");
const privateRecipientList = document.getElementById("privateRecipientList");
const receivedNotes = document.getElementById("receivedNotes");

const sendNoteBtn = document.getElementById("sendNote");
const noteColor = document.getElementById("noteColor");
const noteMessage = document.getElementById("noteMessage");

const sendPrivateNoteBtn = document.getElementById("sendPrivateNoteBtn");
const privateNoteMessage = document.getElementById("privateNoteMessage");

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);
  const userData = snapshot.val();

  const displayName = userData?.displayName || "NO DISPLAY NAME";

  document.getElementById("welcomeMessage").textContent = `Welcome, ${displayName}!`;
  document.getElementById("auth-area").style.display = "none";
  document.getElementById("app-container").style.display = "flex";

  loadMailbox(user.uid);
  loadUsers();
});

saveDisplayNameBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;
  const newName = displayNameInput.value.trim();
  if (!newName) return alert("Enter a name");

  await set(ref(db, `users/${user.uid}`), {
    email: user.email,
    displayName: newName,
    status: "online"
  });

  alert("Display name updated! Reload to apply.");
});

sendNoteBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;
  const message = noteMessage.value.trim();
  if (!message) return alert("Message empty.");
  const color = noteColor.value;

  const userSnap = await get(ref(db, `users/${user.uid}`));
  const userData = userSnap.val();

  await push(ref(db, `publicNotes`), {
    text: message,
    color,
    author: user.uid,
    authorName: userData.displayName,
    timestamp: Date.now()
  });

  noteMessage.value = "";
  alert("Note sent.");
});

sendPrivateNoteBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const recipientUID = privateRecipientList.value;
  const message = privateNoteMessage.value.trim();
  if (!message) return alert("Enter a message.");

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

function loadMailbox(uid) {
  const refMailbox = ref(db, `privateNotes/${uid}`);
  onValue(refMailbox, (snapshot) => {
    receivedNotes.innerHTML = "";
    snapshot.forEach((note) => {
      const data = note.val();
      const li = document.createElement("li");
      li.innerHTML = `<strong>From:</strong> ${data.senderName}<br>${data.text}`;
      receivedNotes.appendChild(li);
    });
  });
}

function loadUsers() {
  const usersRef = ref(db, "users");
  onValue(usersRef, (snapshot) => {
    recipientList.innerHTML = "";
    privateRecipientList.innerHTML = "";
    snapshot.forEach((child) => {
      const user = child.val();
      const option = document.createElement("option");
      option.value = child.key;
      option.textContent = user.displayName;
      recipientList.appendChild(option.cloneNode(true));
      privateRecipientList.appendChild(option);
    });
  });
}

window.showTab = function (tabId) {
  document.querySelectorAll(".tab-section").forEach((el) => {
    el.style.display = "none";
  });
  document.getElementById(tabId).style.display = "block";
};