// Firebase config + initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcnxp_iGUMTp4klEhiB5sCcCvh6IAxe9Y",
  authDomain: "stickynoteapp-883b8.firebaseapp.com",
  projectId: "stickynoteapp-883b8",
  storageBucket: "stickynoteapp-883b8.appspot.com",
  messagingSenderId: "637398429722",
  appId: "1:637398429722:web:e3f58a02328e68b75961a3",
  measurementId: "G-D27CEZ4WJN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.auth = auth;
