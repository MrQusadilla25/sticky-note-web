// dashboard.js
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getDatabase, ref, set, push, get, onChildAdded, query, orderByChild, equalTo, remove, update } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { auth, db } from './firebase-init.js';

const storage = getStorage();
const tabs = document.querySelectorAll('nav button[data-tab]');
const panels = document.querySelectorAll('.tab-panel');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');
const spinner = document.getElementById('loading');

// Auth
onAuthStateChanged(auth, user => {
  if (!user) location.href = "index.html";
  else {
    loadUserSettings(user.uid);
    loadInbox(user.email);
    updateProfile(user.uid, user.email);
  }
});

// Tab logic
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    panels.forEach(p => p.classList.add('hidden'));
    tabs.forEach(b => b.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.remove('hidden');
    btn.classList.add('active');
  });
});
document.querySelector('button[data-tab="settings"]').classList.add('active');

// Logout
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => location.href = 'index.html');
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

// Upload profile picture
document.getElementById('pfpInput').addEventListener('change', async e => {
  const user = auth.currentUser;
  const file = e.target.files[0];
  if (!user || !file) return;

  const banSnap = await get(ref(db, `users/${user.uid}/pictureban`));
  const isBanned = banSnap.exists() && banSnap.val() === true;

  if (isBanned) {
    showToast("You are suspended from changing your profile picture.");
    return;
  }

  const filePath = `pfps/${user.uid}.jpg`;
  const fileRef = storageRef(storage, filePath);

  try {
    showSpinner(true);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await set(ref(db, `users/${user.uid}/pfp`), url);
    document.getElementById('pfpImage').src = url;
    showToast("Profile picture updated!");
  } catch (err) {
    console.error(err);
    showToast("Failed to upload picture.");
  } finally {
    showSpinner(false);
  }
});

// Load inbox messages
function loadInbox(userEmail) {
  const inboxContainer = document.getElementById('notesList');
  inboxContainer.innerHTML = "";

  const notesQuery = query(ref(db, 'notes'), orderByChild('email'), equalTo(userEmail));

  onChildAdded(notesQuery, async snapshot => {
    const msg = snapshot.val();
    const senderSnap = await get(ref(db, `users`));
    const senderUid = Object.keys(senderSnap.val()).find(uid => senderSnap.val()[uid].settings?.email === msg.sender);
    const pfpSnap = senderUid ? await get(ref(db, `users/${senderUid}/pfp`)) : null;
    const pfpUrl = pfpSnap?.val() || "default-pfp.png";

    const noteEl = document.createElement('div');
    noteEl.className = 'message-card';
    const time = new Date(msg.timestamp).toLocaleString();

    noteEl.innerHTML = `
      <img src="${pfpUrl}" class="profile-pic" alt="pfp" />
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
    snap.forEach(child => child.ref.remove());
    document.getElementById('notesList').innerHTML = '';
    showToast("Inbox cleared!");
  } catch (err) {
    console.error(err);
    showToast("Failed to clear inbox.");
  }
});

// Update profile info
function updateProfile(uid, email) {
  get(ref(db, `users/${uid}`)).then(async snap => {
    const data = snap.val() || {};
    document.getElementById('profileDisplayName').textContent = data.settings?.displayName || 'No name set';
    document.getElementById('profileEmail').textContent = email;
    document.getElementById('profileBio').textContent = data.settings?.bio || 'No bio set.';

    const pfp = data.pfp || "default-pfp.png";
    document.getElementById('pfpImage').src = pfp;

    const isBanned = data.pictureban === true;
    if (isBanned) {
      const fileRef = storageRef(storage, `pfps/${uid}.jpg`);
      try {
        await deleteObject(fileRef);
        await update(ref(db, `users/${uid}`), { pfp: null });
      } catch (err) {
        console.warn("No existing PFP to delete or already removed.");
      }
    }
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
