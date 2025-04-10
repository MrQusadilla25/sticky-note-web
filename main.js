let greetingTextElement = document.getElementById("greetingText");

export function initializeGreeting(displayName) {
  const name = displayName || "User";
  const greetings = [
    `Hi ${name}!`,         // English
    `Hola ${name}!`,       // Spanish
    `Salut ${name}!`,      // French
    `Ciao ${name}!`,       // Italian
    `Hallo ${name}!`,      // German
    `Olá ${name}!`,        // Portuguese
    `Hej ${name}!`,        // Swedish
    `こんにちは ${name}！`,  // Japanese
    `안녕 ${name}!`,         // Korean
    `你好 ${name}!`          // Chinese
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

export function logout() {
  location.reload(); // Basic logout
}

window.showTab = showTab;
window.logout = logout;
