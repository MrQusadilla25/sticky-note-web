// auth.js
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, db } from './firebase-init.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Redirect if already signed in
onAuthStateChanged(auth, user => {
  if (user) {
    location.href = "dashboard.html";
  }
});

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorDiv = document.getElementById('authError');
const toast = document.getElementById('toast');
const spinner = document.getElementById('loading');

// Email validation helper
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Login functionality
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password || !isValidEmail(email)) {
    return showError("Please enter a valid email and password.");
  }

  showSpinner(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Logged in!");
  } catch (err) {
    showError(err.message);
  } finally {
    showSpinner(false);
  }
});

// Sign Up functionality
signupBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password || !isValidEmail(email)) {
    return showError("Please enter a valid email and password.");
  }

  if (password.length < 6) {
    return showError("Password must be at least 6 characters.");
  }

  showSpinner(true);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;

    // Default user settings including pictureban: false
    await set(ref(db, `users/${uid}/settings`), {
      displayName: "New User",  // Default name
      bio: "",                  // Default bio
      stickyColor: "#ffcc00",   // Default sticky note color
      pictureban: false         // Default pictureban field
    });

    showToast("Account created!");
  } catch (err) {
    showError(err.message);
  } finally {
    showSpinner(false);
  }
});

// Function to get current user email
function getCurrentUserEmail() {
  const user = auth.currentUser;
  if (user) {
    return user.email;
  } else {
    console.log("No user signed in");
    return null;
  }
}

// Send Note Functionality
async function sendNote() {
  const recipientEmail = document.getElementById('recipientEmail').value;
  const noteContent = document.getElementById('noteContent').value;

  const senderEmail = getCurrentUserEmail();

  if (!senderEmail) {
    return showError("No user signed in.");
  }

  const usersRef = ref(db, 'users');
  
  try {
    const snapshot = await get(usersRef);
    const users = snapshot.val();
    let recipientFound = false;

    for (let userId in users) {
      if (users[userId].email === recipientEmail) {
        recipientFound = true;
        break;
      }
    }

    if (recipientFound) {
      // Send note to the recipient, logic goes here
      console.log("Note sent to:", recipientEmail);
      showToast("Note sent successfully!");
    } else {
      showError("Recipient not found.");
    }
  } catch (error) {
    showError("Error checking recipient: " + error.message);
  }
}

// Error handling
function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.add('show');
  setTimeout(() => errorDiv.classList.remove('show'), 4000);
}

// Toast notification
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Loading spinner
function showSpinner(show) {
  spinner.classList.toggle('hidden', !show);
}