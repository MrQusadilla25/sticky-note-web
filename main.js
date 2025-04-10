import { db, auth } from "./firebase-init.js";
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Set user greeting
window.setUserDisplayName = function (name) {
  const userDisplayName = name || "User";
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

// Save display name
document.getElementById("saveSettings").addEventListener("click", () => {
  const nameInput = document.getElementById("displayNameInput").value;
  const uid = auth.currentUser.uid;

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
    sender: window.currentDisplayName,
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
