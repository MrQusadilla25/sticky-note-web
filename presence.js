import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getDatabase();
const auth = window.auth;

const onlineList = document.getElementById("onlineUsers");
const offlineList = document.getElementById("offlineUsers");
const noDisplayList = document.getElementById("noDisplayUsers");
const onlineCount = document.getElementById("onlineCount");
const offlineCount = document.getElementById("offlineCount");
const sidebar = document.getElementById("sidebar");

onAuthStateChanged(auth, (user) => {
  if (user) {
    sidebar.style.display = "block";

    onValue(ref(db, "users"), (snapshot) => {
      onlineList.innerHTML = "";
      offlineList.innerHTML = "";
      noDisplayList.innerHTML = "";

      let online = 0;
      let offline = 0;

      snapshot.forEach((child) => {
        const data = child.val();
        const name = data.displayName || "NO DISPLAY NAME";
        const status = data.status || "offline";
        const li = document.createElement("li");
        li.textContent = name + " - " + status;

        if (name === "NO DISPLAY NAME") {
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
  }
});
