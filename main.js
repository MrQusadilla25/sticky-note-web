import { db, auth } from './firebase-init.js';
import { ref, push, onValue, remove, update, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Set user greeting
window.setUserDisplayName = function (name) {
  const userDisplayName = name || "User"; // Default to 'User' if no display name is set
  const greetingText = document.getElementById("greetingText");
  greetingText.innerHTML = `Hi ${userDisplayName}!`;
};

// Switch tabs
window.showTab = function (tabId) {
  document.querySelectorAll(".tab-section").forEach(tab => {
    tab.classList.remove("active-tab");
  });
  document.getElementById(tabId).classList.add("active-tab");
};

// Fetch and set display name when the user logs in
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, "users/" + uid);

    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUserDisplayName(userData.displayName); // Set display name
      } else {
        setUserDisplayName("User");
      }
    });

    loadNotes(); // Load notes for the logged-in user
  } else {
    window.location.href = "login.html"; 
  }
});

// Save display name
document.getElementById("saveSettings").addEventListener("click", () => {
  const nameInput = document.getElementById("displayNameInput").value;
  const uid = auth.currentUser.uid;

  const loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "block";

  update(ref(db, "users/" + uid), { displayName: nameInput })
    .then(() => {
      setUserDisplayName(nameInput);
      alert("Display name updated!");
    })
    .catch((error) => alert("Error updating display name: " + error.message))
    .finally(() => loadingIndicator.style.display = "none");
});

// Send a note
document.getElementById("sendNote").addEventListener("click", () => {
  const content = document.getElementById("stickyContent").value;
  const recipient = document.getElementById("recipient").value || "Anonymous";
  const isPublic = document.getElementById("isPublic").checked;
  const uid = auth.currentUser.uid;

  const note = { content, recipient, isPublic, sender: window.currentDisplayName, timestamp: new Date().toISOString() };

  push(ref(db, 'users/' + uid + '/notes'), note);
  alert("Note sent!");
});
