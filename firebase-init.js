import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCu5Rjah9i0_Q7W8-auTgpy4X7THw3Y6Zw",
  authDomain: "sendmeanote-99621.firebaseapp.com",
  projectId: "sendmeanote-99621",
  storageBucket: "sendmeanote-99621.firebasestorage.app",
  messagingSenderId: "172688156945",
  appId: "1:172688156945:web:e66ddb5f93bfd1cdf9c4b0",
  measurementId: "G-L9WVZR1LDV"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };