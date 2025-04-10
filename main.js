let activeTab = 'mailbox';

// Show tab content based on selected tab
function showTab(tabName) {
  document.querySelectorAll('.tab-section').forEach((section) => {
    section.style.display = 'none';
  });

  document.getElementById(tabName).style.display = 'block';
  activeTab = tabName;
}

// Send a new sticky note
document.getElementById("sendNote").addEventListener("click", () => {
  const stickyContent = document.getElementById("stickyContent").value;
  const recipient = document.getElementById("recipient").value;
  const isPublic = document.getElementById("isPublic").checked;

  if (stickyContent && recipient) {
    // Send the sticky note logic (e.g., storing in Firebase Database)
    const noteData = {
      content: stickyContent,
      recipient: recipient,
      isPublic: isPublic,
      timestamp: new Date().toISOString(),
    };

    // Example: Save note to Firebase Realtime Database
    const db = getDatabase();
    const user = getAuth().currentUser;
    set(ref(db, 'notes/' + user.uid), noteData)
      .then(() => {
        alert("Note sent!");
        document.getElementById("stickyContent").value = '';
        document.getElementById("recipient").value = '';
      })
      .catch((error) => {
        alert("Error sending note: " + error.message);
      });
  } else {
    alert("Please fill in all fields!");
  }
});

// Delete all notes from history (just a mock example, replace with real data deletion)
document.getElementById("deleteAllNotes").addEventListener("click", () => {
  const user = getAuth().currentUser;
  if (user) {
    const db = getDatabase();
    const userNotesRef = ref(db, 'notes/' + user.uid);
    set(userNotesRef, null)
      .then(() => {
        alert("All notes deleted!");
      })
      .catch((error) => {
        alert("Error deleting notes: " + error.message);
      });
  }
});

// Save settings (e.g., display name)
document.getElementById("saveSettings").addEventListener("click", () => {
  const displayName = document.getElementById("displayNameInput").value;
  const user = getAuth().currentUser;

  if (user && displayName) {
    user.updateProfile({ displayName: displayName })
      .then(() => {
        alert("Settings saved!");
      })
      .catch((error) => {
        alert("Error updating settings: " + error.message);
      });
  }
});