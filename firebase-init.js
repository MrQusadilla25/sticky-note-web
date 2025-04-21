import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCu5Rjah9i0_Q7W8-auTgpy4X7THw3Y6Zw",
  authDomain: "sendmeanote-99621.firebaseapp.com",
  projectId: "sendmeanote-99621",
  storageBucket: "sendmeanote-99621.appspot.com",
  messagingSenderId: "172688156945",
  appId: "1:172688156945:web:e66ddb5f93bfd1cdf9c4b0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);