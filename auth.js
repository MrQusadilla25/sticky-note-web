// Auth Handling (Login and Sign Up)
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { set, ref, get } from "firebase/database";
import { auth, db } from './firebase-init.js';

// Handle Sign Up
document.getElementById("signup-btn").addEventListener("click", () => {
    const email = prompt("Enter email:");
    const password = prompt("Enter password:");
    const name = prompt("Enter display name:");
    const bio = prompt("Enter bio:");

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Save user info to Firebase Realtime Database
            set(ref(db, 'users/' + user.uid), {
                name: name,
                email: email,
                bio: bio,
                suspended: false
            });
            alert("Sign-up successful!");
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Handle Login
document.getElementById("login-btn").addEventListener("click", () => {
    const email = prompt("Enter email:");
    const password = prompt("Enter password:");

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Check if the user is suspended
            get(ref(db, 'users/' + user.uid))
                .then(snapshot => {
                    if (snapshot.exists() && snapshot.val().suspended) {
                        alert("Your account is suspended.");
                        signOut(auth);
                    } else {
                        alert("Login successful!");
                    }
                });
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Handle Log Out
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        alert("Logged out successfully!");
    }).catch((error) => {
        alert(error.message);
    });
});

// Check User Authentication Status
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Show user profile and their notes
        document.getElementById("user-info").innerHTML = `Welcome ${user.displayName}`;
        loadNotes(user.uid);
    } else {
        document.getElementById("user-info").innerHTML = `Please log in to see your notes.`;
    }
});

// Load notes after login
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