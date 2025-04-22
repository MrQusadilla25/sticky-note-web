// dashboard.js
import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';

const loadingOverlay = document.getElementById("loading");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

showLoading(true);

onAuthStateChanged(auth, user => {
  if (user) {
    userEmail.textContent = `Signed in as: ${user.email}`;
    showLoading(false);
  } else {
    // Redirect to login page if not signed in
    window.location.href = "index.html";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

function showLoading(show) {
  loadingOverlay.style.display = show ? "flex" : "none";
}
