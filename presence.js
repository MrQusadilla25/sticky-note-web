// presence.js
import { auth, db } from './firebase-init.js';
import { ref, set, update, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userRef = ref(db, 'users/' + user.uid);
    const connectedRef = ref(db, '.info/connected');

    // Set default displayName and status
    onValue(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        set(userRef, {
          displayName: "NO DISPLAY NAME",
          status: "online"
        });
      }
    });

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(userRef).update({ status: "offline" });
        update(userRef, { status: "online" });
      }
    });
  }
});
