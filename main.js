import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
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
    const note = document.createElement("div");
    note.className = "note";
    note.textContent = noteText;
    document.getElementById("notesContainer").appendChild(note);
  }
});
