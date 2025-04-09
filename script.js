// Get the theme toggle checkbox
const themeToggle = document.getElementById("themeToggle");

// Check if there's a saved theme preference in localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.classList.add(savedTheme);
  themeToggle.checked = savedTheme === "dark";
}

// Toggle the theme when the checkbox is changed
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark"); // Save the theme to localStorage
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light"); // Save the theme to localStorage
  }
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    document.querySelectorAll('.tab-content').forEach((section) => {
      section.classList.remove("active");
    });

    document.querySelector(`#${target}`).classList.add("active");

    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.remove("active-tab");
    });

    btn.classList.add("active-tab");
  });
});
