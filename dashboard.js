import { auth, db } from './firebase-init.js';
import {
  ref,
  set,
  get,
  update,
  push,
  remove,
  onValue,
  child
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

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
  const userRef = ref(db, `users/${uid}`);

  // Load settings
  get(userRef).then(snapshot => {
    const data = snapshot.val();
    if (data) {
      displayNameInput.value = data.displayName || '';
      bioInput.value = data.bio || '';
      noteColorInput.value = data.noteColor || '#ffff88';
    }
  });

  // Load notebox
  const inboxRef = ref(db, `inbox/${uid}`);
  onValue(inboxRef, snapshot => {
    notesList.innerHTML = '';
    if (!snapshot.exists()) {
      notesList.innerHTML = '<p>No notes received.</p>';
      return;
    }

    const notes = snapshot.val();
    Object.entries(notes).forEach(([key, note]) => {
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
    }).then(() => showToast('Settings saved!'));
  });

  // Send a Note with Cooldown
  sendNoteBtn.addEventListener('click', async () => {
    const to = sendToInput.value.trim().toLowerCase(); // Lowercase the recipient input
    const message = noteMessageInput.value.trim();
    const color = noteColorPicker.value;

    if (!to || !message) {
      showToast('Fill out all fields.');
      return;
    }

    showSpinner();
    try {
      const allUsersSnap = await get(ref(db, 'users'));
      const allUsers = allUsersSnap.val();
      const recipient = Object.entries(allUsers).find(([id, data]) => data.email?.toLowerCase() === to); // Compare emails in lowercase

      if (!recipient) {
        hideSpinner();
        showToast('Recipient not found.');
        return;
      }

      const [recipientId, recipientData] = recipient;

      // Check cooldown
      const cooldownRef = ref(db, `cooldowns/${uid}`);
      const cooldownSnap = await get(cooldownRef);
      const now = Date.now();

      if (cooldownSnap.exists() && now - cooldownSnap.val() < 10000) {
        hideSpinner();
        cooldownNotice.classList.remove('hidden');
        setTimeout(() => cooldownNotice.classList.add('hidden'), 3000);
        return;
      }

      // Send note
      const noteRef = push(ref(db, `inbox/${recipientId}`));
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
      remove(ref(db, `inbox/${uid}`));
      showToast('Inbox cleared.');
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
});