// main.js
import { db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Elements
const createNoteBtn = document.getElementById("createNote");
const notesContainer = document.getElementById("notesContainer");

onAuthStateChanged(window.auth, (user) => {
  if (user) {
    createNoteBtn.disabled = false;
  } else {
    createNoteBtn.disabled = true;
  }
});

createNoteBtn.addEventListener("click", async () => {
  const user = window.auth.currentUser;
  if (!user) return;

  try {
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);
    const userData = snapshot.val();

    if (!userData || !userData.displayName || userData.displayName === "NO DISPLAY NAME") {
      alert("⚠️ You must set a display name before posting a sticky note!");
      return;
    }

    const noteText = prompt("Write your sticky note:");
    if (noteText) {
      const note = document.createElement("div");
      note.className = "note";
      note.textContent = `${userData.displayName}: ${noteText}`;
      notesContainer.appendChild(note);
    }
  } catch (error) {
    console.error("Error creating note:", error);
    alert("An error occurred. Please try again.");
  }
});
