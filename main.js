import { db, auth } from './firebase-init.js';
import { ref, push, onValue, get, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // User is authenticated, so display their data and load notes
    const uid = user.uid;
    const userRef = ref(db, "users/" + uid);

    // Fetch user data from the database
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUserDisplayName(userData.displayName); // Set display name
      } else {
        setUserDisplayName("User");
      }

      loadNotes(); // Load notes for the logged-in user
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    // Ensure the user is shown the app view (in case they navigated directly to the app)
    document.getElementById("auth-area").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    
  } else {
    // User is not authenticated, show the login screen
    document.getElementById("auth-area").style.display = "block";
    document.getElementById("app-container").style.display = "none";
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

// Save new note
document.getElementById("sendNote").addEventListener("click", () => {
  const content = document.getElementById("stickyContent").value;
  const recipient = document.getElementById("recipient").value || "Anonymous";
  const isPublic = document.getElementById("isPublic").checked;
  const uid = auth.currentUser.uid;

  const note = { content, recipient, isPublic, sender: window.currentDisplayName, timestamp: new Date().toISOString() };

  push(ref(db, 'users/' + uid + '/notes'), note);
  alert("Note sent!");
});

// Load notes for the logged-in user
function loadNotes() {
  const uid = auth.currentUser.uid;
  const historyList = document.getElementById("noteHistory");
  historyList.innerHTML = "";  // Clear the list before appending new items

  onValue(ref(db, "users/" + uid + "/notes"), (snapshot) => {
    historyList.innerHTML = ""; // Clear the list again to ensure it's empty
    snapshot.forEach((childSnapshot) => {
      const note = childSnapshot.val();
      const li = document.createElement("li");
      li.textContent = `"${note.content}" to ${note.recipient} (${note.isPublic ? "Public" : "Private"})`;
      historyList.appendChild(li);
    });
  });
}
