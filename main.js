import { db, auth } from "./firebase-init.js";
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

    // Check if the user has a display name in the database
    const userRef = ref(db, "users/" + uid);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUserDisplayName(userData.displayName); // Set display name
      } else {
        // If no display name is set, default to "User"
        setUserDisplayName("User");
      }
    });
    loadNotes(); // Load notes for the logged-in user
  } else {
    // If the user is not signed in, redirect to login page
    window.location.href = "login.html"; // Adjust to your login page URL
  }
});

// Save display name
document.getElementById("saveSettings").addEventListener("click", () => {
  const nameInput = document.getElementById("displayNameInput").value;
  const uid = auth.currentUser.uid;

  // Show loading spinner
  const loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "block"; // Show loading indicator

  // Update the display name in Realtime Database
  update(ref(db, "users/" + uid), {
    displayName: nameInput
  }).then(() => {
    setUserDisplayName(nameInput);
    alert("Display name updated!");
  }).catch((error) => {
    alert("Error updating display name: " + error.message);
  }).finally(() => {
    loadingIndicator.style.display = "none"; // Hide loading indicator
  });
});

// Send a note
document.getElementById("sendNote").addEventListener("click", () => {
  const content = document.getElementById("stickyContent").value;
  const recipient = document.getElementById("recipient").value || "Anonymous";
  const isPublic = document.getElementById("isPublic").checked;
  const uid = auth.currentUser.uid;

  const note = {
    content,
    recipient,
    isPublic,
    sender: window.currentDisplayName,  // Using the current display name
    timestamp: new Date().toISOString()
  };

  // Show loading spinner
  const loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "block"; // Show loading indicator

  // Push the note to the database
  push(ref(db, "users/" + uid + "/notes"), note)
    .then(() => {
      alert("Note sent!");
      document.getElementById("stickyContent").value = "";
      document.getElementById("recipient").value = "";
    })
    .catch((error) => {
      alert("Error sending note: " + error.message);
    })
    .finally(() => {
      loadingIndicator.style.display = "none"; // Hide loading indicator
    });
});

// Load note history in real-time
function loadNotes() {
  const uid = auth.currentUser.uid;
  const historyList = document.getElementById("noteHistory");
  historyList.innerHTML = "";

  // Listen for real-time updates in the user's notes
  onValue(ref(db, "users/" + uid + "/notes"), (snapshot) => {
    historyList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const note = childSnapshot.val();
      const li = document.createElement("li");
      li.textContent = `"${note.content}" to ${note.recipient} (${note.isPublic ? "Public" : "Private"})`;
      historyList.appendChild(li);
    });
  });
}

// Delete a specific note
document.getElementById("deleteNote").addEventListener("click", () => {
  const noteId = document.getElementById("noteIdToDelete").value;
  const uid = auth.currentUser.uid;

  // Show loading spinner
  const loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "block"; // Show loading indicator

  // Remove the note from the Realtime Database
  remove(ref(db, "users/" + uid + "/notes/" + noteId))
    .then(() => {
      alert("Note deleted.");
    })
    .catch((error) => {
      alert("Error deleting note: " + error.message);
    })
    .finally(() => {
      loadingIndicator.style.display = "none"; // Hide loading indicator
    });
});

// Delete all notes
document.getElementById("deleteAllNotes").addEventListener("click", () => {
  const uid = auth.currentUser.uid;

  // Show loading spinner
  const loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "block"; // Show loading indicator

  // Remove all notes from the Realtime Database
  remove(ref(db, "users/" + uid + "/notes"))
    .then(() => {
      alert("All notes deleted.");
    })
    .catch((error) => {
      alert("Error deleting notes: " + error.message);
    })
    .finally(() => {
      loadingIndicator.style.display = "none"; // Hide loading indicator
    });
});

// Sign out user
document.getElementById("signOutButton").addEventListener("click", () => {
  auth.signOut().then(() => {
    alert("Successfully signed out!");
    // Redirect to login page after sign-out
    window.location.href = "login.html"; // Adjust to your login page URL
  }).catch((error) => {
    alert("Error signing out: " + error.message);
  });
});
