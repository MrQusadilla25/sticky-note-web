import { getDatabase, ref, get, push, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getDatabase();
const auth = window.auth;

const notesContainer = document.getElementById("notesContainer");
const createNoteBtn = document.getElementById("createNote");
const displayNameInput = document.getElementById("displayNameInput");
const saveDisplayNameBtn = document.getElementById("saveDisplayName");

// Show welcome message + load notes after auth
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);
  const userData = snapshot.val();

  const name = userData?.displayName || "User";
  const isAdmin = user.email === "dylanfumn@gmail.com";

  const welcomeDiv = document.createElement("div");
  welcomeDiv.style.marginBottom = "20px";
  welcomeDiv.innerHTML = isAdmin
    ? `<h2>Hello ${name}, you're an admin btw <3</h2>`
    : `<h2>Hi there, ${name}!</h2>`;
  document.body.prepend(welcomeDiv);

  loadNotes(user.uid, isAdmin); // Load all notes
});

// Save display name
saveDisplayNameBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;
  const newName = displayNameInput.value.trim();
  if (!newName) return alert("Please enter a display name.");
  await push(ref(db, `users/${user.uid}`), { displayName: newName });
  alert("Display name saved! Reload to update.");
});

// Create note
createNoteBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);
  const userData = snapshot.val();

  if (!userData || !userData.displayName || userData.displayName === "NO DISPLAY NAME") {
    alert("⚠️ You must set a display name in settings before posting a sticky note!");
    return;
  }

  const noteText = prompt("Write your sticky note:");
  if (noteText) {
    const noteRef = push(ref(db, "notes"));
    await noteRef.set({
      text: noteText,
      author: user.uid,
      authorName: userData.displayName,
      timestamp: Date.now(),
    });
  }
});

// Load notes from database
function loadNotes(currentUID, isAdmin) {
  const notesRef = ref(db, "notes");
  onValue(notesRef, (snapshot) => {
    notesContainer.innerHTML = ""; // Clear

    snapshot.forEach((child) => {
      const noteData = child.val();
      const noteId = child.key;

      const noteDiv = document.createElement("div");
      noteDiv.className = "note";
      noteDiv.innerHTML = `
        <p>${noteData.text}</p>
        <small>By: ${noteData.authorName}</small>
      `;

      // Add delete button for admins
      if (isAdmin) {
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️ Delete";
        delBtn.style.marginLeft = "10px";
        delBtn.onclick = () => {
          if (confirm("Delete this note?")) {
            ref(db, `notes/${noteId}`).remove();
          }
        };
        noteDiv.appendChild(delBtn);
      }

      notesContainer.appendChild(noteDiv);
    });
  });
}
