// main.js
import { login, signup, watchAuthState } from './auth.js';

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loadingOverlay = document.getElementById("loading");
const toast = document.getElementById("toast");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showToast("Please enter both email and password.");
    return;
  }

  showLoading(true);
  try {
    await login(email, password);
    showToast("Successfully logged in!");
    // Optional: redirect to app dashboard
    // window.location.href = "dashboard.html";
  } catch (error) {
    showToast(getFriendlyErrorMessage(error.code));
  } finally {
    showLoading(false);
  }
});

signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showToast("Please enter both email and password.");
    return;
  }

  showLoading(true);
  try {
    await signup(email, password);
    showToast("Account created! You can now log in.");
  } catch (error) {
    showToast(getFriendlyErrorMessage(error.code));
  } finally {
    showLoading(false);
  }
});

watchAuthState(user => {
  if (user) {
    showToast("Welcome back, " + user.email);
    // Optional: redirect to dashboard
    // window.location.href = "dashboard.html";
  }
});

function showLoading(show) {
  loadingOverlay.style.display = show ? "flex" : "none";
}

function showToast(message) {
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

function getFriendlyErrorMessage(code) {
  switch (code) {
    case "auth/invalid-email":
      return "The email address is not valid.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}