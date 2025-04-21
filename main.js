import { signUpUser, loginUser } from './auth.js';

document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const status = document.getElementById("status");

  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) return status.textContent = "Enter email and password.";

    try {
      await signUpUser(email, password);
      status.textContent = "Signed up successfully!";
    } catch (error) {
      console.error(error);
      status.textContent = "Sign-up error: " + error.message;
    }
  });

  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) return status.textContent = "Enter email and password.";

    try {
      await loginUser(email, password);
      status.textContent = "Logged in successfully!";
      // Redirect or show logged-in UI here
    } catch (error) {
      console.error(error);
      status.textContent = "Login error: " + error.message;
    }
  });
});