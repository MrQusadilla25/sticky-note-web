import { auth, db, storage } from './firebase-init.js';
import {
  ref as dbRef,
  set,
  get,
  update,
  push,
  remove,
  onValue,
  child
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';

// DOM Elements
const displayNameInput = document.getElementById('displayName');
const bioInput = document.getElementById('bio');
const noteColorInput = document.getElementById('noteColor');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

const sendToInput = document.getElementById('sendTo');
const noteMessageInput = document.getElementById('noteMessage');
const noteColorPicker = document.getElementById('noteColorPicker');
const sendNoteBtn = document.getElementById('sendNoteBtn');
const cooldownNotice = document.getElementById('cooldownNotice');

const notesList = document.getElementById('notesList');
const clearInboxBtn = document.getElementById('clearInboxBtn');

const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');
const loading = document.getElementById('loading');

const profilePic = document.getElementById('profilePic');
const uploadProfilePic = document.getElementById('uploadProfilePic');

// Utilities
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showSpinner() {
  loading.classList.remove('hidden');
}
function hideSpinner() {
  loading.classList.add('hidden');
}

// Auth State
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const uid = user.uid;
  const userRef = dbRef(db, `users/${uid}`);

  // Load settings
  get(userRef).then(snapshot => {
    const data = snapshot.val();
    if (data) {
      displayNameInput.value = data.displayName || '';
      bioInput.value = data.bio || '';
      noteColorInput.value = data.noteColor || '#ffff88';
      noteColorPicker.value = data.noteColor || '#ffff88';

      // Profile Picture
      if (data.pictureban) {
        uploadProfilePic.classList.add('hidden');
        deleteProfilePicture(uid); // Remove if banned
        showToast("You are banned from changing profile pictures.");
      } else {
        uploadProfilePic.classList.remove('hidden');
        loadProfilePicture(uid);
      }
    }
  });

  // Load inbox
  const inboxRef = dbRef(db, `inbox/${uid}`);
  onValue(inboxRef, snapshot => {
    notesList.innerHTML = '';
    if (!snapshot.exists()) {
      notesList.innerHTML = '<p>No notes received.</p>';
      return;
    }

    const notes = snapshot.val();
    const sortedNotes = Object.entries(notes).sort((a, b) => b[1].time - a[1].time);
    sortedNotes.forEach(([key, note]) => {
      const div = document.createElement('div');
      div.className = 'note';
      div.style.background = note.color || '#ffff88';
      div.innerHTML = `
        <p><strong>From:</strong> ${note.from || 'Anonymous'}</p>
        <p>${note.message}</p>
        <p><small>${new Date(note.time).toLocaleString()}</small></p>
        <button data-key="${key}" class="deleteNoteBtn">Delete</button>
      `;
      notesList.appendChild(div);
    });

    document.querySelectorAll('.deleteNoteBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        remove(child(inboxRef, key));
        showToast('Note deleted');
      });
    });
  });

  // Save Settings
  saveSettingsBtn.addEventListener('click', () => {
    const displayName = displayNameInput.value.trim();
    const bio = bioInput.value.trim();
    const color = noteColorInput.value;

    if (!displayName) {
      showToast('Display name is required.');
      return;
    }

    update(userRef, {
      displayName,
      bio,
      noteColor: color
    }).then(() => {
      noteColorPicker.value = color;
      showToast('Settings saved!');
    });
  });

  // Send a Note with Cooldown
  sendNoteBtn.addEventListener('click', async () => {
    const to = sendToInput.value.trim().toLowerCase();
    const message = noteMessageInput.value.trim();
    const color = noteColorPicker.value;

    if (!to || !message) {
      showToast('Fill out all fields.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(to)) {
      showToast('Enter a valid email address.');
      return;
    }

    showSpinner();
    try {
      const allUsersSnap = await get(dbRef(db, 'users'));
      const allUsers = allUsersSnap.val();
      const recipient = Object.entries(allUsers).find(([id, data]) => data.email?.toLowerCase() === to);

      if (!recipient) {
        hideSpinner();
        showToast('Recipient not found.');
        return;
      }

      const [recipientId] = recipient;

      // Check cooldown
      const cooldownRef = dbRef(db, `cooldowns/${uid}`);
      const cooldownSnap = await get(cooldownRef);
      const now = Date.now();

      if (cooldownSnap.exists() && now - cooldownSnap.val() < 10000) {
        hideSpinner();
        cooldownNotice.classList.remove('hidden');
        setTimeout(() => cooldownNotice.classList.add('hidden'), 3000);
        sendNoteBtn.disabled = true;
        setTimeout(() => sendNoteBtn.disabled = false, 3000);
        return;
      }

      // Send note
      const noteRef = push(dbRef(db, `inbox/${recipientId}`));
      await set(noteRef, {
        from: auth.currentUser.email,
        message,
        color,
        time: now
      });

      // Set cooldown
      await set(cooldownRef, now);

      showToast('Note sent!');
      sendToInput.value = '';
      noteMessageInput.value = '';
    } catch (err) {
      console.error(err);
      showToast('Error sending note.');
    }
    hideSpinner();
  });

  // Clear inbox
  clearInboxBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all notes?")) {
      remove(dbRef(db, `inbox/${uid}`));
      showToast('Inbox cleared.');
    }
  });

  // Upload Profile Picture
  uploadProfilePic.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showSpinner();
    const fileRef = storageRef(storage, `profile-pictures/${uid}.jpg`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    profilePic.src = url;
    showToast('Profile picture updated.');
    hideSpinner();
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
});

// Load Profile Picture
function loadProfilePicture(uid) {
  const fileRef = storageRef(storage, `profile-pictures/${uid}.jpg`);
  getDownloadURL(fileRef)
    .then(url => {
      profilePic.src = url;
    })
    .catch(() => {
      profilePic.src = 'default-profile.png';
    });
}

// Delete Profile Picture (for pictureban)
function deleteProfilePicture(uid) {
  const fileRef = storageRef(storage, `profile-pictures/${uid}.jpg`);
  deleteObject(fileRef).catch(() => {});
  profilePic.src = 'default-profile.png';
}