import { auth, db } from './firebase-init.js';
import { ref, set, get, push, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// DOM elements
const noteContent = document.getElementById('noteContent');
const noteType = document.getElementById('noteType');
const recipient = document.getElementById('recipient');
const saveNoteButton = document.getElementById('saveNoteButton');
const publicNotesList = document.getElementById('publicNotesList');
const messageList = document.getElementById('messageList');
const notification = document.getElementById('notification');
const greetingText = document.getElementById('greetingText');

// Load notes for the signed-in user
function loadNotes() {
    if (!auth.currentUser) {
        return; // Return if no user is signed in
    }

    const uid = auth.currentUser.uid;
    loadPublicNotes(uid);
    loadPrivateMessages(uid);
}

// Load Public Notes
function loadPublicNotes(uid) {
    const publicNotesList = document.getElementById("publicNotesList");
    publicNotesList.innerHTML = "";  // Clear the list before appending new items

    onValue(ref(db, 'publicNotes'), (snapshot) => {
        publicNotesList.innerHTML = "";  // Clear the list to ensure it's empty
        snapshot.forEach((childSnapshot) => {
            const note = childSnapshot.val();
            const li = document.createElement('li');
            li.textContent = `${note.recipient}: ${note.note}`;
            publicNotesList.appendChild(li);
        });
    });
}

// Load Private Messages
function loadPrivateMessages(uid) {
    const messageList = document.getElementById("messageList");
    messageList.innerHTML = "";  // Clear the list before appending new items

    onValue(ref(db, `users/${uid}/privateMessages`), (snapshot) => {
        messageList.innerHTML = "";  // Clear the list to ensure it's empty
        snapshot.forEach((childSnapshot) => {
            const msg = childSnapshot.val();
            const li = document.createElement('li');
            li.textContent = `${msg.recipient}: ${msg.note}`;
            messageList.appendChild(li);
        });
    });
}

// Save Note Functionality
saveNoteButton.addEventListener('click', async () => {
    const note = noteContent.value;
    const type = noteType.value;
    const recipientName = recipient.value.trim();

    // Validate input
    if (note.trim() === "") {
        alert("Please write something before saving.");
        return;
    }

    // Get current user
    const uid = auth.currentUser?.uid;
    if (!uid) {
        alert("Please log in first.");
        return;
    }

    const noteData = {
        note,
        recipient: type === 'dm' ? recipientName : "All",  // Handle recipient for DM type
        isPublic: type === 'public', // Determine if the note is public
    };

    // Save the note to Firebase based on type
    if (type === 'private') {
        // Private note saved under the user's privateMessages
        await push(ref(db, `users/${uid}/privateMessages`), noteData);
    } else if (type === 'public') {
        // Public note saved under publicNotes
        await push(ref(db, 'publicNotes'), noteData);
    } else if (type === 'dm' && recipientName) {
        // Direct message saved under the user's privateMessages
        await push(ref(db, `users/${uid}/privateMessages`), noteData);
    }

    // Show confirmation message
    notification.textContent = `Your note has been ${type === 'public' ? 'posted on the Sticky Wall.' : `sent to ${recipientName || 'Me'}`}.`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);

    // Reload the list of public and private notes
    loadNotes();
});

// Handle Authentication State Changes (To Load User Notes)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const displayName = user.displayName || "User";
        window.currentUser = user;
        window.currentDisplayName = displayName;

        greetingText.textContent = displayName;

        loadNotes(); // Load the notes when the user is signed in
    } else {
        // Handle when user is logged out
        greetingText.textContent = "User";
        publicNotesList.innerHTML = "";
        messageList.innerHTML = "";
    }
});

// Initial Load (When the page is loaded or user logs in)
document.addEventListener('DOMContentLoaded', () => {
    loadNotes(); // Load notes after page is loaded
});