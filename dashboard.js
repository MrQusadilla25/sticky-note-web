import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getDatabase, ref, set, push, get, onChildAdded, query, orderByChild, equalTo, remove, update } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { auth, db } from './firebase-init.js';

const storage = getStorage();
const tabs = document.querySelectorAll('nav button[data-tab]');
const panels = document.querySelectorAll('.tab-panel');
const toast = document.getElementById('toast');
const spinner = document.getElementById('loading');

// Redirect if not signed in
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "index.html";
  } else {
    loadUserSettings(user.uid);
    loadInbox(user.email);
    updateProfile(user.uid, user.email);
  }
});

// Tabs
tabs.forEach(button => {
  button.addEventListener('click', () => {
    tabs.forEach(btn => btn.classList.remove('active'));
    panels.forEach(panel => panel.classList.add('hidden'));
    document.getElementById(button.dataset.tab).classList.remove('hidden');
    button.classList.add('active');
  });
});
document.querySelector('button[data-tab="settings"]').classList.add('active');

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth).then(() => location.href = "index.html");
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

// Load settings
async function loadUserSettings(uid) {
  try {
    const snap = await get(ref(db, `users/${uid}/settings`));
    const settings = snap.val();
    if (settings) {
      document.getElementById('displayName').value = settings.displayName || '';
      document.getElementById('bio').value = settings.bio || '';
      document.getElementById('noteColor').value = settings.stickyColor || '#ffcc00';
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to load settings.");
  }
}

// Upload PFP
document.getElementById('pfpInput').addEventListener('change', async e => {
  const user = auth.currentUser;
  const file = e.target.files[0];
  if (!user || !file) return;

  try {
    const banSnap = await get(ref(db, `users/${user.uid}/pictureban`));
    if (banSnap.exists() && banSnap.val() === true) {
      showToast("You are suspended from changing your profile picture.");
      return;
    }

    showSpinner(true);

    // Resize + crop to 200x200 circle
    const resizedBlob = await resizeAndCropToCircle(file, 200);

    const pfpRef = storageRef(storage, `pfps/${user.uid}.jpg`);
    await uploadBytes(pfpRef, resizedBlob);
    const url = await getDownloadURL(pfpRef);
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

// Load Inbox
function loadInbox(userEmail) {
  const container = document.getElementById('notesList');
  container.innerHTML = '';

  const notesRef = query(ref(db, 'notes'), orderByChild('email'), equalTo(userEmail));

  onChildAdded(notesRef, async snapshot => {
    const note = snapshot.val();
    const senderSnap = await get(ref(db, `users`));
    const senderUid = Object.keys(senderSnap.val() || {}).find(uid => senderSnap.val()[uid]?.settings?.email === note.sender);
    const pfpSnap = senderUid ? await get(ref(db, `users/${senderUid}/pfp`)) : null;
    const pfpUrl = pfpSnap?.val() || 'default-pfp.png';
    const time = new Date(note.timestamp).toLocaleString();

    const div = document.createElement('div');
    div.className = 'message-card';
    div.innerHTML = `
      <img src="${pfpUrl}" class="profile-pic" alt="pfp">
      <p><strong>From:</strong> ${note.sender}</p>
      <p>${note.text}</p>
      <small>Sent: ${time}</small><br>
      <button class="delete-btn" data-id="${snapshot.key}">Delete</button>
    `;
    container.appendChild(div);

    div.querySelector('.delete-btn').addEventListener('click', async () => {
      try {
        await remove(ref(db, `notes/${snapshot.key}`));
        div.remove();
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
    const notesRef = query(ref(db, 'notes'), orderByChild('email'), equalTo(user.email));
    const snap = await get(notesRef);
    snap.forEach(child => child.ref.remove());
    document.getElementById('notesList').innerHTML = '';
    showToast("Inbox cleared.");
  } catch (err) {
    console.error(err);
    showToast("Failed to clear inbox.");
  }
});

// Profile tab
async function updateProfile(uid, email) {
  try {
    const snap = await get(ref(db, `users/${uid}`));
    const user = snap.val() || {};
    document.getElementById('profileDisplayName').textContent = user.settings?.displayName || 'No name set';
    document.getElementById('profileEmail').textContent = email;
    document.getElementById('profileBio').textContent = user.settings?.bio || 'No bio set';
    document.getElementById('pfpImage').src = user.pfp || 'default-pfp.png';

    if (user.pictureban === true) {
      const pfpRef = storageRef(storage, `pfps/${uid}.jpg`);
      try {
        await deleteObject(pfpRef);
        await update(ref(db, `users/${uid}`), { pfp: null });
      } catch (err) {
        console.warn("No PFP to delete or already removed.");
      }
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to load profile.");
  }
}

// Toast
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Spinner
function showSpinner(state) {
  spinner.style.display = state ? 'flex' : 'none';
}

// Resize and Crop to Circle (200x200)
function resizeAndCropToCircle(file, size = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Crop to square first
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        // Circle mask
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}