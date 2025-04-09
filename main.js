import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getDatabase();
const auth = window.auth;

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  // Show app, hide login
  document.getElementById("auth-area").style.display = "none";
  document.getElementById("app-container").style.display = "block";

  const name = user.displayName || user.email.split("@")[0];
  document.getElementById("welcomeMessage").innerText = `Hi there, ${name}!`;

  // Save user to DB
  set(ref(db, `users/${user.uid}`), {
    displayName: name,
    email: user.email
  });

  // Load users into recipient list
  onValue(ref(db, "users"), (snapshot) => {
    const select = document.getElementById("recipientList");
    select.innerHTML = "";
    snapshot.forEach(child => {
      if (child.key !== user.uid) {
        const opt = document.createElement("option");
        opt.value = child.key;
        opt.textContent = child.val().displayName || "Unnamed";
        select.appendChild(opt);
      }
    });
  });

  // Load received notes
  onValue(ref(db, "notes"), (snapshot) => {
    const list = document.getElementById("receivedNotes");
    list.innerHTML = "";
    snapshot.forEach(noteSnap => {
      const note = noteSnap.val();
      if (note.to === user.uid) {
        const li = document.createElement("li");
        li.style.backgroundColor = note.color || "yellow";
        li.textContent = `From ${note.fromName}: ${note.message}`;
        list.appendChild(li);
      }
    });
  });

  // Send note
  document.getElementById("sendNote").addEventListener("click", () => {
    const to = document.getElementById("recipientList").value;
    const message = document.getElementById("noteMessage").value;
    const color = document.getElementById("noteColor").value;

    if (!to || !message) return alert("Please complete the form!");

    const newNote = {
      from: user.uid,
      fromName: name,
      to,
      message,
      color,
      timestamp: Date.now()
    };

    push(ref(db, "notes"), newNote).then(() => {
      document.getElementById("noteMessage").value = "";
      alert("Note sent!");
    });
  });
});
