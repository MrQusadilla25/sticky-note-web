import { db, auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, ref, set, get, update } from './firebase-init.js';

const loginButton = document.getElementById('loginButton');
const signupButton = document.getElementById('signupButton');
const logoutButton = document.getElementById('logoutButton');
const greetingText = document.getElementById('greetingText');
const tabContent = document.getElementById('tab-content');
const sidebarTabs = document.querySelectorAll('#sidebar li');
const authArea = document.getElementById('auth-area');
const appContainer = document.getElementById('app-container');
const themeSelect = document.getElementById('themeSelect');
const displayNameInput = document.getElementById('displayNameInput');

// User authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        const userRef = ref(db, 'users/' + uid);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                setUserDisplayName(userData.displayName);
                setUserTheme(userData.theme);
            } else {
                setUserDisplayName('User');
                setUserTheme('light');
            }
        });

        // Show main app content
        authArea.style.display = 'none';
        appContainer.style.display = 'block';
        loadMailbox(); // Load mailbox by default

    } else {
        // Show login screen
        authArea.style.display = 'block';
        appContainer.style.display = 'none';
    }
});

// Log in functionality
loginButton.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .catch((error) => {
            console.error('Login error:', error);
        });
});

// Sign up functionality
signupButton.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .catch((error) => {
            console.error('Sign up error:', error);
        });
});

// Logout functionality
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('Logged out successfully');
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
});

// Setting the greeting text with user's name
function setUserDisplayName(displayName) {
    greetingText.textContent = `Hello ${displayName}`;
    animateGreeting();
}

// Animation for greeting message
function animateGreeting() {
    greetingText.classList.add('fadeIn');
    setTimeout(() => {
        greetingText.classList.remove('fadeIn');
    }, 1000);
}

// Tab switching functionality
sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.textContent.trim().toLowerCase();
        switchTab(targetTab);
    });
});

// Switching between tabs
function switchTab(tabName) {
    const activeTab = document.querySelector('.tab-section.active-tab');
    if (activeTab) {
        activeTab.classList.remove('active-tab');
    }

    const newTabContent = document.getElementById(`${tabName}TabContent`);
    newTabContent.classList.add('active-tab');

    // Load appropriate content
    if (tabName === 'mailbox') {
        loadMailbox();
    } else if (tabName === 'history') {
        loadHistory();
    } else if (tabName === 'write a note') {
        loadWriteNote();
    } else if (tabName === 'settings') {
        loadSettings();
    }
}

// Load Mailbox (home page)
function loadMailbox() {
    const uid = auth.currentUser.uid;
    const mailboxRef = ref(db, `mailbox/${uid}`);
    get(mailboxRef).then(snapshot => {
        if (snapshot.exists()) {
            const mailData = snapshot.val();
            // Populate the mailbox with email content
            const mailList = document.getElementById('mailboxList');
            mailList.innerHTML = ''; // Clear previous messages
            mailData.forEach(mail => {
                const li = document.createElement('li');
                li.textContent = `From: ${mail.sender} - ${mail.message}`;
                mailList.appendChild(li);
            });
        } else {
            console.log('No new messages.');
        }
    });
}

// Load History (user’s sent notes)
function loadHistory() {
    const uid = auth.currentUser.uid;
    const historyRef = ref(db, `history/${uid}`);
    get(historyRef).then(snapshot => {
        if (snapshot.exists()) {
            const historyData = snapshot.val();
            // Populate history with the notes
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = ''; // Clear previous history
            historyData.forEach(note => {
                const li = document.createElement('li');
                li.textContent = `To: ${note.recipient} - ${note.message} - Public: ${note.isPublic}`;
                historyList.appendChild(li);
            });
        } else {
            console.log('No note history.');
        }
    });
}

// Load Write Note page
function loadWriteNote() {
    const noteInput = document.getElementById('stickyContent');
    const recipientInput = document.getElementById('recipient');
    const publicCheckbox = document.getElementById('isPublic');

    const sendNoteButton = document.getElementById('sendNote');
    sendNoteButton.addEventListener('click', () => {
        const noteContent = noteInput.value;
        const recipient = recipientInput.value;
        const isPublic = publicCheckbox.checked;
        const uid = auth.currentUser.uid;

        // Send the note to the database
        const noteRef = ref(db, `notes/${uid}`);
        const newNoteKey = push(noteRef).key;

        set(ref(db, 'notes/' + uid + '/' + newNoteKey), {
            message: noteContent,
            recipient: recipient,
            isPublic: isPublic
        }).then(() => {
            alert('Note sent successfully!');
            loadHistory(); // Reload history after sending note
        }).catch((error) => {
            console.error('Error sending note:', error);
        });
    });
}

// Load Settings (theme, display name)
function loadSettings() {
    const displayNameInput = document.getElementById('displayNameInput');
    const themeSelect = document.getElementById('themeSelect');

    const uid = auth.currentUser.uid;
    const userRef = ref(db, 'users/' + uid);

    // Save display name
    displayNameInput.addEventListener('change', () => {
        const newDisplayName = displayNameInput.value;
        update(userRef, {
            displayName: newDisplayName
        }).then(() => {
            setUserDisplayName(newDisplayName);
        }).catch((error) => {
            console.error('Error updating display name:', error);
        });
    });

    // Save theme
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        update(userRef, {
            theme: selectedTheme
        }).then(() => {
            applyTheme(selectedTheme);
        }).catch((error) => {
            console.error('Error updating theme:', error);
        });
    });
}

// Apply theme to the site
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
}

// Set user theme preference on load
function setUserTheme(theme) {
    applyTheme(theme);
}