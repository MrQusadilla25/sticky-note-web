// firebase-init.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDcnxp_iGUMTp4klEhiB5sCcCvh6IAxe9Y",
  authDomain: "stickynoteapp-883b8.firebaseapp.com",
  databaseURL: "https://stickynoteapp-883b8-default-rtdb.firebaseio.com",
  projectId: "stickynoteapp-883b8",
  storageBucket: "stickynoteapp-883b8.appspot.com",
  messagingSenderId: "637398429722",
  appId: "1:637398429722:web:e3f58a02328e68b75961a3",
  measurementId: "G-D27CEZ4WJN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };