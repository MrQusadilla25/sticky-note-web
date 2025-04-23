// auth.js ye
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, db } from './firebase-init.js';
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Redirect if already signed in
onAuthStateChanged(auth, user => {
  if (user) {
    location.href = "dashboard.html";
  }
});

// DOM
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorDiv = document.getElementById('authError');
const toast = document.getElementById('toast');
const spinner = document.getElementById('loading');

// Login
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) return showError("Please fill in both fields.");

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

// Sign Up
signupBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) return showError("Please fill in both fields.");

  showSpinner(true);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;

    // Default user settings
    await set(ref(db, `users/${uid}/settings`), {
      displayName: "New User",
      bio: "",
      stickyColor: "#ffcc00"
    });

    showToast("Account created!");
  } catch (err) {
    showError(err.message);
  } finally {
    showSpinner(false);
  }
});

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.add('show');
  setTimeout(() => errorDiv.classList.remove('show'), 4000);
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showSpinner(show) {
  spinner.classList.toggle('hidden', !show);
}
