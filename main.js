import { auth, db } from './firebase-init.js';
import { ref, update } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

document.getElementById('updateDisplayName').addEventListener('click', () => {
  const newName = document.getElementById('newDisplayName').value;
  update(ref(db, `users/${auth.currentUser.uid}`), {
    displayName: newName
  });
  document.getElementById('displayName').innerText = newName;
});

document.getElementById('updateBio').addEventListener('click', () => {
  const bio = document.getElementById('bio').value;
  update(ref(db, `users/${auth.currentUser.uid}`), {
    bio
  });
});

document.getElementById('sendNote').addEventListener('click', () => {
  const note = document.getElementById('note').value;
  const color = document.getElementById('noteColor').value;
  update(ref(db, `users/${auth.currentUser.uid}`), {
    note,
    color
  });
});
