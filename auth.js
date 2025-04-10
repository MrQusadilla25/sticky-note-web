import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from './firebase-init.js';

const auth = getAuth(app);

document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Signed up:", user.email);
    showApp();
  } catch (error) {
    alert("Signup error: " + error.message);
  }
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Logged in:", user.email);
    showApp();
  } catch (error) {
    alert("Login error: " + error.message);
  }
});

function showApp() {
  document.getElementById("auth-area").style.display = "none";
  document.getElementById("app-container").style.display = "block";
}
