// presence.js
import { db, auth } from './firebase-init.js';
import { ref, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Monitor user status (online/offline)
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, 'users/' + user.uid);

        // Set user as online
        set(userRef, {
            status: 'online',
            displayName: user.displayName
        });

        // Automatically set user as offline when they disconnect
        onDisconnect(userRef).set({
            status: 'offline',
            displayName: user.displayName
        });
    }
});

// Realtime listener for users' statuses
const usersRef = ref(db, "users");
onValue(usersRef, (snapshot) => {
    const users = snapshot.val();
    displayUserStatus(users);
});

// Display users' online/offline status
function displayUserStatus(users) {
    const onlineList = document.getElementById("onlineUsers");
    const offlineList = document.getElementById("offlineUsers");
    onlineList.innerHTML = "";
    offlineList.innerHTML = "";

    for (const userId in users) {
        const user = users[userId];
        const li = document.createElement("li");
        li.textContent = `${user.displayName} - ${user.status}`;
        if (user.status === 'online') {
            onlineList.appendChild(li);
        } else {
            offlineList.appendChild(li);
        }
    }
}