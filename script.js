// Theme toggle
const themeToggle = document.getElementById("themeToggle");

// Check and apply saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  if (themeToggle) themeToggle.checked = true;
}

// Toggle theme on checkbox change
if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    const isDark = themeToggle.checked;
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.tab;
    const targetEl = document.getElementById(targetId);

    if (!targetEl) return;

    // Hide all tabs
    document.querySelectorAll(".tab-content").forEach((section) => {
      section.classList.remove("active");
    });

    // Show target tab
    targetEl.classList.add("active");

    // Update tab button styles
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.remove("active-tab");
    });

    btn.classList.add("active-tab");
  });
});
