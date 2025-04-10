// auth.js
import { auth, db } from './firebase-init.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Sign up
export async function signup(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        // Save user info in the database
        await set(ref(db, 'users/' + uid), {
            email: email,
            displayName: "User",
            status: "offline"  // Default status
        });
    } catch (error) {
        alert(error.message);
    }
}

// Log in
export async function login(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert(error.message);
    }
}

// Log out
export async function logout() {
    await signOut(auth);
}

// Monitor authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snapshot = await get(ref(db, 'users/' + user.uid));
        const data = snapshot.val();
        window.currentUser = user;
        window.currentDisplayName = data?.displayName || "User";
    } else {
        window.currentUser = null;
        window.currentDisplayName = null;
    }
});