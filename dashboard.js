// dashboard.js
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getDatabase, ref, set, push, get, onChildAdded, query, orderByChild, equalTo, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { auth, db } from './firebase-init.js';

// DOM Elements
const tabs = document.querySelectorAll('nav button[data-tab]');
const panels = document.querySelectorAll('.tab-panel');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');
const spinner = document.getElementById('loading');

// Auth state
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
  } else {
    loadUserSettings(user.uid);
    loadInbox(user.email);
    updateProfile(user.uid, user.email);
  }
});

// Tab switching
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    panels.forEach(p => p.classList.add('hidden'));
    tabs.forEach(b => b.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.remove('hidden');
    btn.classList.add('active');
  });
});

// Set default tab
document.querySelector('button[data-tab="settings"]').classList.add('active');

// Logout
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    location.href = 'login.html';
  });
});

// Save settings
document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return;

  const displayName = document.getElementById('displayName').value.trim();
  const bio = document.getElementById('bio').value.trim();
  const stickyColor = document.getElementById('noteColor').value;

  try {
    await set(ref(db, `users/${user.uid}/settings`), { displayName, bio, stickyColor });
    showToast("Settings saved!");
  } catch (err) {
    console.error(err);
    showToast("Error saving settings.");
  }
});

// Load user settings
async function loadUserSettings(uid) {
  try {
    const snap = await get(ref(db, `users/${uid}/settings`));
    const data = snap.val();
    if (data) {
      document.getElementById('displayName').value = data.displayName || '';
      document.getElementById('bio').value = data.bio || '';
      document.getElementById('noteColor').value = data.stickyColor || '#ffcc00';
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to load settings.");
  }
}

// Send note
document.getElementById('sendNoteBtn').addEventListener('click', async () => {
  const to = document.getElementById('sendTo').value.trim();
  const message = document.getElementById('noteMessage').value.trim();
  const noteColor = document.getElementById('noteColorPicker').value || '#ffcc00';
  const sender = auth.currentUser;

  if (!to || !message) return showToast("Please fill in all fields.");

  const now = Date.now();
  const lastSent = parseInt(localStorage.getItem('lastSent')) || 0;

  if (now - lastSent < 5000) {
    document.getElementById('cooldownNotice').classList.remove('hidden');
    return;
  }

  const note = {
    email: to,
    sender: sender.email,
    text: message,
    color: noteColor,
    timestamp: now
  };

  try {
    showSpinner(true);
    await push(ref(db, 'notes'), note);
    localStorage.setItem('lastSent', now.toString());
    document.getElementById('cooldownNotice').classList.add('hidden');
    showToast("Note sent!");
    document.getElementById('noteMessage').value = "";
  } catch (err) {
    console.error(err);
    showToast("Failed to send note.");
  } finally {
    showSpinner(false);
  }
});

// Load inbox
function loadInbox(userEmail) {
  const inboxContainer = document.getElementById('notesList');
  inboxContainer.innerHTML = "";

  const notesQuery = query(ref(db, 'notes'), orderByChild('email'), equalTo(userEmail));

  onChildAdded(notesQuery, snapshot => {
    const msg = snapshot.val();
    const noteEl = document.createElement('div');
    noteEl.className = 'message-card';
    const time = new Date(msg.timestamp).toLocaleString();

    noteEl.innerHTML = `
      <p><strong>From:</strong> ${msg.sender}</p>
      <p>${msg.text}</p>
      <small>Sent: ${time}</small><br>
      <button class="delete-btn" data-id="${snapshot.key}">Delete</button>
    `;
    inboxContainer.appendChild(noteEl);

    noteEl.querySelector('.delete-btn').addEventListener('click', async () => {
      try {
        await remove(ref(db, `notes/${snapshot.key}`));
        noteEl.remove();
        showToast("Note deleted.");
      } catch (err) {
        console.error(err);
        showToast("Error deleting note.");
      }
    });
  });
}

// Clear inbox
document.getElementById('clearInboxBtn').addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const notesQuery = query(ref(db, 'notes'), orderByChild('email'), equalTo(user.email));
    const snap = await get(notesQuery);

    snap.forEach(child => {
      child.ref.remove();
    });

    document.getElementById('notesList').innerHTML = '';
    showToast("Inbox cleared!");
  } catch (err) {
    console.error(err);
    showToast("Failed to clear inbox.");
  }
});

// Update profile tab
function updateProfile(uid, email) {
  get(ref(db, `users/${uid}/settings`)).then(snap => {
    const data = snap.val() || {};
    document.getElementById('profileDisplayName').textContent = data.displayName || 'No name set';
    document.getElementById('profileBio').textContent = data.bio || 'No bio set.';
    document.getElementById('profileEmail').textContent = email;
  }).catch(err => {
    console.error(err);
    showToast("Failed to load profile.");
  });
}

// Toast
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Spinner
function showSpinner(show) {
  spinner.style.display = show ? 'flex' : 'none';
}
