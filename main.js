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
  }
});

// Save display name
document.getElementById("saveSettings").addEventListener("click", () => {
  const nameInput = document.getElementById("displayNameInput").value;
  const uid = auth.currentUser.uid;

  // Update the display name in Realtime Database
  update(ref(db, "users/" + uid), {
    displayName: nameInput
  }).then(() => {
    setUserDisplayName(nameInput);
    alert("Display name updated!");
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

  push(ref(db, "users/" + uid + "/notes"), note);
  alert("Note sent!");
  document.getElementById("stickyContent").value = "";
  document.getElementById("recipient").value = "";
});

// Load note history
function loadNotes() {
  const uid = auth.currentUser.uid;
  const historyList = document.getElementById("noteHistory");
  historyList.innerHTML = "";

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

// Delete all notes
document.getElementById("deleteAllNotes").addEventListener("click", () => {
  const uid = auth.currentUser.uid;
  remove(ref(db, "users/" + uid + "/notes")).then(() => {
    alert("All notes deleted.");
  });
});

// Fetch user data and set display name upon login
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, "users/" + uid);

    // Fetch user data
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUserDisplayName(userData.displayName || "User");
      } else {
        setUserDisplayName("User"); // Default if no data found
      }
    });
  }
});
