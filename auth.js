import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const email = document.getElementById("email");
const password = document.getElementById("password");

const showToast = (message) => {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
};

const showLoading = (show) => {
  const loading = document.getElementById("loading");
  loading.style.display = show ? "flex" : "none";
};

// Sign Up functionality
signupBtn.onclick = async () => {
  try {
    showLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    showToast("Account created successfully!");
  } catch (e) {
    showToast(e.message);
  } finally {
    showLoading(false);
  }
};

// Log In functionality
loginBtn.onclick = async () => {
  try {
    showLoading(true);
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    showToast("Logged in successfully!");
    document.getElementById("auth-container").style.display = "none"; // Hide login form
    document.getElementById("main-content").style.display = "block"; // Show main content
  } catch (e) {
    showToast(e.message);
  } finally {
    showLoading(false);
  }
};
