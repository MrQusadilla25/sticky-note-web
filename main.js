import { db, auth } from "./firebase-init.js";
import { ref, get, push, set, onValue, remove } from "firebase/database";

const noteText = document.getElementById('noteText');
const sendButton = document.getElementById('sendButton');
const inboxContainer = document.getElementById('inboxMessages');
const recentEmailsContainer = document.getElementById('recentEmails');
const cooldownTime = 3000; // Cooldown time in milliseconds (3 seconds)
let lastSentTime = 0;

const user = auth.currentUser;

function checkSuspension() {
  const userRef = ref(db, 'users/' + user.uid);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.suspended) {
        alert(`You are suspended! Reason: ${userData.suspendReason}`);
        signOut(auth);
      }
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    checkSuspension();
    displayInbox();
    displayRecentEmails();
  }
});

function sendNote() {
  const currentTime = new Date().getTime();
  if (currentTime - lastSentTime < cooldownTime) {
    alert('Please wait before sending another note.');
    return;
  }

  lastSentTime = currentTime;
  const note = {
    text: noteText.value,
    sender: user.displayName,
    timestamp: currentTime,
  };

  const notesRef = ref(db, 'notes/');
  push(notesRef, note);
  updateRecentEmails(note);

  noteText.value = ''; // Clear note input field
}

function updateRecentEmails(note) {
  const recentEmailsRef = ref(db, 'users/' + user.uid + '/sentEmails/');
  push(recentEmailsRef, note);

  const newEmailElement = document.createElement('div');
  newEmailElement.innerText = `To: ${note.text} | Sent at: ${new Date(note.timestamp).toLocaleString()}`;
  recentEmailsContainer.prepend(newEmailElement);
}

function displayInbox() {
  const inboxRef = ref(db, 'users/' + user.uid + '/inbox');
  onValue(inboxRef, (snapshot) => {
    inboxContainer.innerHTML = ''; // Clear inbox before displaying new data
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      const messageElement = document.createElement('div');
      messageElement.innerHTML = `<strong>From:</strong> ${message.sender} <br> <strong>Message:</strong> ${message.text} <button onclick="removeMessage('${childSnapshot.key}')">Remove</button>`;
      inboxContainer.appendChild(messageElement);
    });
  });
}

function clearInbox() {
  const inboxRef = ref(db, 'users/' + user.uid + '/inbox');
  set(inboxRef, null); // Clear all inbox messages
  alert('Inbox cleared!');
}

function removeMessage(messageId) {
  const messageRef = ref(db, 'users/' + user.uid + '/inbox/' + messageId);
  remove(messageRef);
  alert('Message removed!');
}

sendButton.addEventListener('click', sendNote);