import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const auth = window.auth;

window.signup = () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Account created! You can now log in."))
    .catch((err) => alert(err.message));
};

window.login = () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, pass)
    .catch((err) => alert(err.message));
};

window.logout = () => {
  signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("auth-area").style.display = "none";
    document.querySelector("main").style.display = "block";
    document.getElementById("user-display-name").textContent = user.displayName || "Anonymous";
  } else {
    document.getElementById("auth-area").style.display = "block";
    document.querySelector("main").style.display = "none";
  }
});

window.updateDisplayName = () => {
  const newName = document.getElementById("newDisplayName").value;
  if (!newName) return alert("Please enter a name.");

  updateProfile(auth.currentUser, { displayName: newName })
    .then(() => {
      document.getElementById("user-display-name").textContent = newName;
      alert("Display name updated!");
    })
    .catch((err) => alert(err.message));
};
