import { db, auth } from './firebase-init.js';
import { ref, set, push, get, update } from 'firebase/database';

// Function to send a note
function sendNote() {
    const content = prompt("Enter your note content:");
    const user = auth.currentUser;
    if (user) {
        const noteRef = push(ref(db, 'notes/' + user.uid));
        set(noteRef, {
            content: content,
            timestamp: Date.now()
        }).then(() => {
            alert("Note sent successfully!");
            loadNotes(user.uid);
        }).catch(error => {
            alert("Failed to send note: " + error.message);
        });
    } else {
        alert("Please log in first.");
    }
}

// Add event listener for sending notes
document.getElementById("send-note-btn").addEventListener("click", sendNote);

// Delete note from user
document.getElementById("notes-list").addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-note")) {
        const noteId = event.target.getAttribute("data-note-id");
        const user = auth.currentUser;
        if (user) {
            const noteRef = ref(db, 'notes/' + user.uid + '/' + noteId);
            set(noteRef, null).then(() => {
                alert("Note deleted.");
                loadNotes(user.uid);
            }).catch(error => {
                alert("Failed to delete note: " + error.message);
            });
        }
    }
});

// Function to load notes
function loadNotes(userId) {
    get(ref(db, 'notes/' + userId)).then((snapshot) => {
        if (snapshot.exists()) {
            const notes = snapshot.val();
            let notesHTML = '';
            for (let noteId in notes) {
                notesHTML += `<div class="note">
                    <p><strong>Note:</strong> ${notes[noteId].content}</p>
                    <button class="delete-note" data-note-id="${noteId}">Delete</button>
                </div>`;
            }
            document.getElementById("notes-list").innerHTML = notesHTML;
        } else {
            document.getElementById("notes-list").innerHTML = 'No notes found.';
        }
    });
}