// Handle logout functionality
async function handleLogout(e) {
  if (e) {
    e.preventDefault();
  }

  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("Logged out successfully!");
      window.location.href = "/login.html";
    } else {
      alert("Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert("An error occurred during logout.");
  }
}

// Add event listeners to all logout links
document.addEventListener("DOMContentLoaded", () => {
  const logoutLinks = document.querySelectorAll('a[href="login.html"]');

  logoutLinks.forEach((link) => {
    // Check if the link text contains "Logout" to avoid affecting other links
    if (
      link.textContent.trim().toLowerCase() === "logout" ||
      link.classList.contains("logout-link")
    ) {
      link.addEventListener("click", handleLogout);
    }
  });
});
