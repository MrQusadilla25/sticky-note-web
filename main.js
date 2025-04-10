function showTab(tabId) {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.classList.remove("active-tab");
  });
  document.getElementById(tabId).classList.add("active-tab");
}

function logout() {
  location.reload(); // Quick way to "log out"
}

const languageGreetings = [
  "Hello, User!",
  "Bonjour, User!",
  "Hola, User!",
  "Hallo, User!",
  "Ciao, User!"
];

let currentLanguageIndex = 0;
const greetingTextElement = document.getElementById("greetingText");

function cycleGreeting() {
  setInterval(() => {
    currentLanguageIndex = (currentLanguageIndex + 1) % languageGreetings.length;
    greetingTextElement.innerHTML = languageGreetings[currentLanguageIndex];
  }, 5000);
}

function setUserDisplayName(name) {
  const userDisplayName = name || "User";
  for (let i = 0; i < languageGreetings.length; i++) {
    languageGreetings[i] = languageGreetings[i].replace("User", userDisplayName);
  }
  cycleGreeting();
}

setUserDisplayName("John Doe"); // For now; you can hook it to user profile info later

window.showTab = showTab;
window.logout = logout;
