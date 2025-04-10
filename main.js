// main.js
import { auth, db } from './firebase-init.js';
import { ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Save a note to the Firebase Database
export function saveNoteToDatabase(noteContent, noteType, recipient) {
    const user = auth.currentUser;
    if (!user) return;

    const noteData = {
        content: noteContent,
        type: noteType,
        recipient: recipient || "Public",
        timestamp: Date.now()
    };

    const notesRef = ref(db, 'users/' + user.uid + '/notes');
    const newNoteRef = push(notesRef);
    set(newNoteRef, noteData);
}

// Load user notes from Firebase Database
export function loadUserNotes() {
    const user = auth.currentUser;
    if (!user) return;

    const notesRef = ref(db, 'users/' + user.uid + '/notes');
    onValue(notesRef, (snapshot) => {
        const notes = snapshot.val();
        displayNotes(notes);
    });
}

// Display the notes on the UI
function displayNotes(notes) {
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = "";  // Clear existing notes

    for (const noteId in notes) {
        const note = notes[noteId];
        const noteItem = document.createElement('li');
        noteItem.textContent = `${note.content} - ${note.recipient}`;
        noteList.appendChild(noteItem);
    }
}