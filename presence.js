import { db, auth } from './firebase-init.js'; // Ensure correct import path
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// DOM Elements
const onlineList = document.getElementById("onlineUsers");
const offlineList = document.getElementById("offlineUsers");
const noDisplayList = document.getElementById("noDisplayUsers");
const onlineCount = document.getElementById("onlineCount");
const offlineCount = document.getElementById("offlineCount");
const sidebar = document.getElementById("sidebar");

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (!user) {
    sidebar.style.display = "none";
    return;
  }

  sidebar.style.display = "block";
  const usersRef = ref(db, "users");

  // Realtime listener for users data
  onValue(usersRef, (snapshot) => {
    // Reset lists
    onlineList.innerHTML = "";
    offlineList.innerHTML = "";
    noDisplayList.innerHTML = "";

    let online = 0;
    let offline = 0;

    const users = [];

    // Build user list
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      users.push({
        displayName: data.displayName?.trim() || "NO DISPLAY NAME",
        status: data.status || "offline"
      });
    });

    // Sort alphabetically by display name
    users.sort((a, b) => a.displayName.localeCompare(b.displayName));

    // Categorize and render users
    users.forEach(({ displayName, status }) => {
      const li = document.createElement("li");
      li.textContent = `${displayName} - ${status}`;
      li.setAttribute("data-status", status);

      if (displayName === "NO DISPLAY NAME") {
        noDisplayList.appendChild(li);
      } else if (status === "online") {
        onlineList.appendChild(li);
        online++;
      } else {
        offlineList.appendChild(li);
        offline++;
      }
    });

    // Update UI counters
    onlineCount.textContent = online;
    offlineCount.textContent = offline;
  }, (error) => {
    console.error("Error fetching users:", error);
  });
});
