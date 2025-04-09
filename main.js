import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getDatabase();
const auth = window.auth;

document.getElementById("createNote").addEventListener("click", async () => {
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
    const noteId = Date.now();
    const note = {
      id: noteId,
      text: noteText,
      from: userData.displayName,
      uid: user.uid
    };

    await set(ref(db, `notes/${noteId}`), note);
    renderNote(note, user.email);
  }
});

function renderNote(note, userEmail) {
  const noteDiv = document.createElement("div");
  noteDiv.className = "note";
  noteDiv.innerHTML = `
    <p><strong>${note.from}:</strong> ${note.text}</p>
  `;

  // Admin-only delete button
  if (userEmail === "dylanfumn@gmail.com") {
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑 Delete";
    delBtn.onclick = () => {
      remove(ref(db, `notes/${note.id}`));
      noteDiv.remove();
    };
    noteDiv.appendChild(delBtn);
  }

  document.getElementById("notesContainer").appendChild(noteDiv);
}
