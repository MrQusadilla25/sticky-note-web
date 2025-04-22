// main.js
import { login, signup, watchAuthState } from './auth.js';

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loadingOverlay = document.getElementById("loading");
const toast = document.getElementById("toast");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    showToast("Please enter email and password.");
    return;
  }

  showLoading(true);
  try {
    await login(email, password);
    showToast("Logged in successfully!");
  } catch (error) {
    showToast("Login failed: " + error.message);
  } finally {
    showLoading(false);
  }
});

signupBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    showToast("Please enter email and password.");
    return;
  }

  showLoading(true);
  try {
    await signup(email, password);
    showToast("Account created! You can now log in.");
  } catch (error) {
    showToast("Signup failed: " + error.message);
  } finally {
    showLoading(false);
  }
});

watchAuthState(user => {
  if (user) {
    // Redirect or load main content
    showToast("Welcome back, " + user.email);
    // window.location.href = "dashboard.html"; // Example
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