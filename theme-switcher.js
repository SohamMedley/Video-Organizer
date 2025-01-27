const themeToggle = document.getElementById("theme-toggle")
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme)
  localStorage.setItem("theme", theme)
  updateToggleIcon(theme)
}

function updateToggleIcon(theme) {
  const sunIcon = themeToggle.querySelector(".sun-icon")
  const moonIcon = themeToggle.querySelector(".moon-icon")

  if (theme === "dark") {
    sunIcon.style.display = "inline-block"
    moonIcon.style.display = "none"
  } else {
    sunIcon.style.display = "none"
    moonIcon.style.display = "inline-block"
  }
}

// Check for saved theme preference or use the system preference
const savedTheme = localStorage.getItem("theme")
if (savedTheme) {
  setTheme(savedTheme)
} else {
  setTheme(prefersDarkScheme.matches ? "dark" : "light")
}

// Add event listener to the theme toggle button
themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  setTheme(currentTheme === "dark" ? "light" : "dark")
})

// Listen for changes in system theme preference
prefersDarkScheme.addListener((e) => {
  setTheme(e.matches ? "dark" : "light")
})

