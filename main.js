// main.js
let greetingTextElement = document.getElementById("greetingText");

export function initializeGreeting(displayName) {
  const name = displayName || "User";
  const greetings = [
    `Hi ${name}!`,
    `Hola ${name}!`,
    `Salut ${name}!`,
    `Ciao ${name}!`,
    `Hallo ${name}!`,
    `Olá ${name}!`,
    `Hej ${name}!`,
    `こんにちは ${name}！`,
    `안녕 ${name}!`,
    `你好 ${name}!`
  ];

  let current = 0;
  greetingTextElement.innerText = greetings[current];

  setInterval(() => {
    current = (current + 1) % greetings.length;
    greetingTextElement.innerText = greetings[current];
  }, 5000);
}

export function showTab(tabId) {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.classList.remove("active-tab");
  });
  document.getElementById(tabId).classList.add("active-tab");
}

export function setupAppEvents(user) {
  document.getElementById("saveSettings").addEventListener("click", async () => {
    const newName = document.getElementById("displayNameInput").value;
    if (newName) {
      await user.updateProfile({ displayName: newName });
      alert("Display name updated! Refresh to see the new greeting.");
    } else {
      alert("Please enter a name.");
    }
  });

  document.getElementById("sendNote").addEventListener("click", () => {
    const content = document.getElementById("stickyContent").value;
    const recipient = document.getElementById("recipient").value;
    const isPublic = document.getElementById("isPublic").checked;

    if (!content || !recipient) {
      alert("Please fill in the note and recipient.");
      return;
    }

    // Replace this with Firebase DB saving if needed
    alert(`Note sent to ${recipient} (${isPublic ? "public" : "private"})`);
  });

  document.getElementById("deleteAllNotes").addEventListener("click", () => {
    // Replace this with Firebase delete logic if needed
    alert("All notes deleted (not yet connected to DB)");
  });
}
