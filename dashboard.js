// dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getDatabase, ref, set, push, get, onChildAdded, query, orderByChild, equalTo, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { firebaseConfig } from './firebase-init.js';

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Elements
const tabs = document.querySelectorAll('nav button[data-tab]');
const panels = document.querySelectorAll('.tab-panel');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');
const spinner = document.getElementById('loading');

// User state
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
  } else {
    loadUserSettings(user.uid);
    loadInbox(user.email);
    updateProfile(user);
  }
});

// Tab switching
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    panels.forEach(p => p.classList.add('hidden'));
    document.getElementById(btn.dataset.tab).classList.remove('hidden');
  });
});

// Logout
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    location.href = 'login.html';
  });
});

// SETTINGS
document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return;

  const displayName = document.getElementById('displayName').value;
  const bio = document.getElementById('bio').value;
  const stickyColor = document.getElementById('noteColor').value;

  await set(ref(db, `users/${user.uid}/settings`), { displayName, bio, stickyColor });
  showToast("Settings saved!");
});

async function loadUserSettings(uid) {
  const snap = await get(ref(db, `users/${uid}/settings`));
  const data = snap.val();
  if (data) {
    document.getElementById('displayName').value = data.displayName || '';
    document.getElementById('bio').value = data.bio || '';
    document.getElementById('noteColor').value = data.stickyColor || '#ffcc00';
  }
}

// SEND NOTE
document.getElementById('sendNoteBtn').addEventListener('click', async () => {
  const to = document.getElementById('sendTo').value.trim();
  const message = document.getElementById('noteMessage').value.trim();
  const noteColor = document.getElementById('noteColorPicker').value;
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

  await push(ref(db, 'notes'), note);
  localStorage.setItem('lastSent', now.toString());
  document.getElementById('cooldownNotice').classList.add('hidden');
  showToast("Note sent!");
});

// LOAD INBOX
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
      await remove(ref(db, `notes/${snapshot.key}`));
      noteEl.remove();
      showToast("Note deleted.");
    });
  });
}

// CLEAR INBOX
document.getElementById('clearInboxBtn').addEventListener('click', async () => {
  const user = auth.currentUser;
  const notesQuery = query(ref(db, 'notes'), orderByChild('email'), equalTo(user.email));
  const snap = await get(notesQuery);

  snap.forEach(child => {
    child.ref.remove();
  });

  document.getElementById('notesList').innerHTML = '';
  showToast("Inbox cleared!");
});

// PROFILE
function updateProfile(user) {
  document.getElementById('profileDisplayName').textContent = user.displayName || 'No name set';
  document.getElementById('profileEmail').textContent = user.email;
  get(ref(db, `users/${user.uid}/settings/bio`)).then(snap => {
    document.getElementById('profileBio').textContent = snap.val() || 'No bio set.';
  });
}

// TOAST
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
