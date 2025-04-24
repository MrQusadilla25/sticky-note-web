import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import { auth, db } from './firebase-init.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Redirect if user is already signed in
onAuthStateChanged(auth, user => {
  if (user) {
    location.href = "dashboard.html";
  }
});

// Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorDiv = document.getElementById('authError');
const toast = document.getElementById('toast');
const spinner = document.getElementById('loading');
const togglePassword = document.getElementById('togglePassword');

// Toggle password visibility
if (togglePassword) {
  togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.innerHTML = isPassword
      ? '<i class="fas fa-eye-slash"></i>'
      : '<i class="fas fa-eye"></i>';
  });
}

// Email format validator
const isValidEmail = email => /\S+@\S+\.\S+/.test(email);

// Save default user data if not already present
async function saveUserData(user) {
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    await set(userRef, {
      email: user.email,
      displayName: "New User",
      bio: "",
      noteColor: "#ffff88",
      pictureban: false
    });
  } else {
    const data = snapshot.val();
    if (!data.email) {
      await set(ref(db, `users/${user.uid}/email`), user.email);
    }
  }
}

// Handle login
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!isValidEmail(email) || !password) {
    return showError("Please enter a valid email and password.");
  }

  showSpinner(true);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await saveUserData(result.user);
    showToast("Logged in!");
  } catch (err) {
    showError(err.message);
  } finally {
    showSpinner(false);
  }
});

// Handle sign-up
signupBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!isValidEmail(email) || !password) {
    return showError("Please enter a valid email and password.");
  }

  if (password.length < 6) {
    return showError("Password must be at least 6 characters.");
  }

  showSpinner(true);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserData(result.user);
    showToast("Account created!");
  } catch (err) {
    showError(err.message);
  } finally {
    showSpinner(false);
  }
});

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
  setTimeout(() => errorDiv.classList.remove('show'), 4000);
}

// Show toast message
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Toggle loading spinner
function showSpinner(show) {
  spinner.classList.toggle('hidden', !show);
}