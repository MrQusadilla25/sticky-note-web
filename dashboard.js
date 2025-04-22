// Initialize Firebase Auth and Database
const auth = firebase.auth();
const db = firebase.database();

// Check if user is logged in
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html'; // Redirect to login if not signed in
  } else {
    document.getElementById('profileName').textContent = user.displayName || 'No name set';
    document.getElementById('profileEmail').textContent = user.email;
    loadSettings(user.uid);
  }
});

// Load user settings from database
function loadSettings(uid) {
  const settingsRef = db.ref('users/' + uid + '/settings');
  settingsRef.once('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      document.getElementById('displayName').value = data.displayName || '';
      document.getElementById('bio').value = data.bio || '';
      document.getElementById('stickyColor').value = data.stickyColor || '#ffcc00';
    }
  });
}

// Save settings to database
document.getElementById('settingsForm').addEventListener('submit', e => {
  e.preventDefault();
  const user = auth.currentUser;
  const displayName = document.getElementById('displayName').value;
  const bio = document.getElementById('bio').value;
  const stickyColor = document.getElementById('stickyColor').value;

  db.ref('users/' + user.uid + '/settings').set({
    displayName,
    bio,
    stickyColor
  }).then(() => {
    showToast('Settings saved!');
  });
});

// Send note form
document.getElementById('sendNoteForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const noteColor = document.getElementById('noteColor').value;
  
  // Check cooldown to prevent spam
  const cooldown = 5000; // 5 seconds cooldown
  const lastSent = localStorage.getItem('lastSent');
  const now = Date.now();

  if (lastSent && now - lastSent < cooldown) {
    showToast('Please wait before sending another note.');
    return;
  }

  // Send the note
  db.ref('notes').push({
    email,
    noteColor,
    sender: auth.currentUser.email,
    timestamp: now
  }).then(() => {
    localStorage.setItem('lastSent', now);
    showToast('Note sent!');
  });
});

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Switch tabs
document.querySelectorAll('nav button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(button => button.classList.remove('active'));
    document.getElementById(button.id.replace('Tab', '')).classList.add('active');
    button.classList.add('active');
  });
});

// Clear inbox
document.getElementById('clearInbox').addEventListener('click', () => {
  const user = auth.currentUser;
  db.ref('notes').orderByChild('email').equalTo(user.email).once('value', snapshot => {
    snapshot.forEach(childSnapshot => {
      childSnapshot.ref.remove();
    });
    document.getElementById('messageContainer').innerHTML = '';
    showToast('Inbox cleared!');
  });
});

// Display inbox messages
db.ref('notes').on('child_added', snapshot => {
  const message = snapshot.val();
  if (message.email === auth.currentUser.email) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-card');
    messageElement.innerHTML = `
      <p><strong>From:</strong> ${message.sender}</p>
      <p><strong>Note Color:</strong> <span style="color: ${message.noteColor};">●</span></p>
      <button class="delete-btn" data-id="${snapshot.key}">Delete</button>
    `;
    document.getElementById('messageContainer').appendChild(messageElement);
    
    // Delete individual message
    messageElement.querySelector('.delete-btn').addEventListener('click', () => {
      snapshot.ref.remove();
      messageElement.remove();
      showToast('Message deleted!');
    });
  }
});
