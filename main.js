import { signUpUser } from './auth.js';

document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signupBtn");
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const status = document.getElementById("status");

    if (!email || !password) {
      status.textContent = "Please enter email and password.";
      return;
    }

    try {
      await signUpUser(email, password);
      status.textContent = "Signed up successfully!";
    } catch (error) {
      console.error(error);
      status.textContent = "Error: " + error.message;
    }
  });
});