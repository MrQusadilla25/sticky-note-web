import { getDatabase, ref, get, push, onValue, set, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getDatabase();
const auth = window.auth;

const welcomeMessage = document.getElementById("welcomeMessage");
const displayNameInput = document.getElementById("displayNameInput");
const saveDisplayNameBtn = document.getElementById("saveDisplayName");
const noteMessage = document.getElementById("noteMessage");
const noteColor = document.getElementById("noteColor");
const sendNote = document.getElementById("sendNote");
const notesContainer = document.getElementById("notesContainer");
const receivedNotes = document.getElementById("receivedNotes");

// AUTH HANDLER
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  document.getElementById("auth-area").style.display = "none";
  document.getElementById("app-container").style.display = "flex";

  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);
  const userData = snapshot.val() || {};

  const name = userData.displayName || "User";
  const isAdmin = user.email === "dylanfumn@gmail.com";

  welcomeMessage.innerText = isAdmin
    ? `Hello ${name}, you're an admin btw <3`
    : `Hi there, ${name}!`;

  loadNotes(user.uid, isAdmin);
  loadReceivedNotes(user.uid);
});

// SAVE DISPLAY NAME
saveDisplayNameBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;
  const name = displayNameInput.value.trim();
  if (!name) return alert("Enter a name first.");
  await set(ref(db, `users/${user.uid}`), { displayName: name });
  alert("Display name updated. Reload to see changes.");
});

// SEND NOTE
sendNote.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userSnapshot = await get(ref(db, `users/${user.uid}`));
  const userData = userSnapshot.val();
  if (!userData || !userData.displayName) {
    return alert("Please set your display name first.");
  }

  const text = noteMessage.value.trim();
  const color = noteColor.value;
  if (!text) return alert("Write something!");

  await push(ref(db, "notes"), {
    text,
    color,
    author: user.uid,
    authorName: userData.displayName,
    timestamp: Date.now()
  });

  noteMessage.value = "";
});

// LOAD NOTES
function loadNotes(currentUID, isAdmin) {
  const notesRef = ref(db, "notes");
  onValue(notesRef, (snapshot) => {
    notesContainer.innerHTML = "";
    snapshot.forEach((child) => {
      const note = child.val();
      const noteId = child.key;

      const div = document.createElement("div");
      div.className = "note";
      div.style.backgroundColor = note.color || "yellow";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";
      div.style.borderRadius = "5px";

      div.innerHTML = `
        <p>${note.text}</p>
        <small>By: ${note.authorName}</small>
      `;

      if (isAdmin) {
        const btn = document.createElement("button");
        btn.textContent = "🗑️ Delete";
        btn.onclick = () => {
          if (confirm("Delete this note?")) {
            remove(ref(db, `notes/${noteId}`));
          }
        };
        div.appendChild(btn);
      }

      notesContainer.appendChild(div);
    });
  });
}

// Load notes sent to the user (for later implementation)
function loadReceivedNotes(uid) {
  // Placeholder if direct user-to-user sending is added
  receivedNotes.innerHTML = `<li>No private notes (yet!)</li>`;
}
