// presence.js
import { db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Elements
const onlineList = document.getElementById("onlineUsers");
const offlineList = document.getElementById("offlineUsers");
const noDisplayList = document.getElementById("noDisplayUsers");
const onlineCount = document.getElementById("onlineCount");
const offlineCount = document.getElementById("offlineCount");
const sidebar = document.getElementById("sidebar");

onAuthStateChanged(window.auth, (user) => {
  if (user) {
    sidebar.style.display = "block";

    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
      onlineList.innerHTML = "";
      offlineList.innerHTML = "";
      noDisplayList.innerHTML = "";

      let online = 0;
      let offline = 0;

      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const displayName = data.displayName || "NO DISPLAY NAME";
        const status = data.status || "offline";

        const li = document.createElement("li");
        li.textContent = `${displayName} - ${status}`;

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
  } else {
    sidebar.style.display = "none";
  }
});
