import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const db = getDatabase();
const auth = window.auth;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);
    const userData = snapshot.val();
    const welcomeDiv = document.createElement("div");
    welcomeDiv.style.marginBottom = "20px";

    const isAdmin = user.email === "dylanfumn@gmail.com";
    const name = userData?.displayName || "User";

    welcomeDiv.innerHTML = isAdmin
      ? `<h2>Hello ${name}, you're an admin btw <3</h2>`
      : `<h2>Hi there, ${name}!</h2>`;

    document.body.prepend(welcomeDiv); // Add it to top of page
  }
});
