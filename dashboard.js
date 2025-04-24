import { auth, db } from './firebase-init.js';
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
const profilePicURLInput = document.getElementById('profilePicURL');
const updatePicBtn = document.getElementById('updatePicBtn');

const profileDisplayName = document.getElementById('profileDisplayName');
const profileEmail = document.getElementById('profileEmail');
const profileBio = document.getElementById('profileBio');
const pictureBanStatus = document.getElementById('pictureBanStatus');

// Toast & Spinner
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

// Auth Listener
auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const uid = user.uid;
  const userRef = dbRef(db, `users/${uid}`);

  const snapshot = await get(userRef);
  const data = snapshot.val();

  if (data) {
    displayNameInput.value = data.displayName || '';
    bioInput.value = data.bio || '';
    noteColorInput.value = data.noteColor || '#ffff88';
    noteColorPicker.value = data.noteColor || '#ffff88';

    profileDisplayName.textContent = data.displayName || '—';
    profileEmail.textContent = user.email || '—';
    profileBio.textContent = data.bio || '—';

    if (data.pictureban) {
      updatePicBtn.disabled = true;
      pictureBanStatus.textContent = 'True';
      showToast('You are banned from changing your profile picture.');
      profilePic.src = 'default-profile.png';
    } else {
      updatePicBtn.disabled = false;
      pictureBanStatus.textContent = 'False';
      profilePic.src = data.profilePicURL || 'default-profile.png';
    }
  }

  // Inbox Listener
  const inboxRef = dbRef(db, `inbox/${uid}`);
  onValue(inboxRef, snapshot => {
    notesList.innerHTML = '';
    if (!snapshot.exists()) {
      notesList.innerHTML = '<p>No notes received.</p>';
      return;
    }

    const notes = snapshot.val();
    const sorted = Object.entries(notes).sort((a, b) => b[1].time - a[1].time);
    sorted.forEach(([key, note]) => {
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
      profileDisplayName.textContent = displayName;
      profileBio.textContent = bio;
      showToast('Settings saved!');
    });
  });

  // Send Note with Cooldown
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
      const now = Date.now();

      const cooldownRef = dbRef(db, `cooldowns/${uid}`);
      const cooldownSnap = await get(cooldownRef);

      if (cooldownSnap.exists() && now - cooldownSnap.val() < 10000) {
        hideSpinner();
        cooldownNotice.classList.remove('hidden');
        setTimeout(() => cooldownNotice.classList.add('hidden'), 3000);
        sendNoteBtn.disabled = true;
        setTimeout(() => (sendNoteBtn.disabled = false), 3000);
        return;
      }

      await push(dbRef(db, `inbox/${recipientId}`), {
        from: user.email,
        message,
        color,
        time: now
      });

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

  // Clear Inbox
  clearInboxBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all notes?')) {
      remove(dbRef(db, `inbox/${uid}`));
      showToast('Inbox cleared.');
    }
  });

  // Set Profile Picture via URL
  updatePicBtn.addEventListener('click', async () => {
    const url = profilePicURLInput.value.trim();
    if (!url) return showToast('Enter a valid image URL.');

    showSpinner();
    try {
      await update(dbRef(db, `users/${uid}`), {
        profilePicURL: url
      });
      profilePic.src = url;
      showToast('Profile picture updated.');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile picture.');
    }
    hideSpinner();
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
});