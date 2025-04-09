import { db, auth } from './firebase-init.js'; // Make sure `auth` is also exported from firebase-init.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Elements
const onlineList = document.getElementById("onlineUsers");
const offlineList = document.getElementById("offlineUsers");
const noDisplayList = document.getElementById("noDisplayUsers");
const onlineCount = document.getElementById("onlineCount");
const offlineCount = document.getElementById("offlineCount");
const sidebar = document.getElementById("sidebar");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    sidebar.style.display = "none";
    return;
  }

  sidebar.style.display = "block";

  const usersRef = ref(db, "users");

  onValue(usersRef, (snapshot) => {
    onlineList.innerHTML = "";
    offlineList.innerHTML = "";
    noDisplayList.innerHTML = "";

    let online = 0;
    let offline = 0;

    const users = [];

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      users.push({
        displayName: data.displayName?.trim() || "NO DISPLAY NAME",
        status: data.status || "offline"
      });
    });

    // Sort alphabetically by displayName
    users.sort((a, b) => a.displayName.localeCompare(b.displayName));

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

    onlineCount.textContent = online;
    offlineCount.textContent = offline;
  });
});