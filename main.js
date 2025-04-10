// Auto-fit for tab content
function autoFitContent() {
    const tabContent = document.getElementById('tab-content');
    
    // Adjust the height to fit the content inside the tab
    tabContent.style.height = 'auto'; // Reset height to auto to allow natural growth

    const activeTab = document.querySelector('.tab-section.active-tab');
    if (activeTab) {
        const contentHeight = activeTab.scrollHeight;
        tabContent.style.height = contentHeight + 'px'; // Set the height based on the content height
    }
}

// Call autoFitContent after loading content in each tab
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
        autoFitContent(); // Adjust content height after loading mailbox
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
        autoFitContent(); // Adjust content height after loading history
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
        autoFitContent(); // Adjust content height after sending note
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
    autoFitContent(); // Adjust content height when settings are loaded
}