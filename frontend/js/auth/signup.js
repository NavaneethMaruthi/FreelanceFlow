// Handle signup form submission
console.log("signup.js loaded successfully!");
const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById("form3Example1c").value.trim();
    const email = document.getElementById("form3Example3c").value.trim();
    const password = document.getElementById("form3Example4c").value;
    const repeatPassword = document.getElementById("form3Example4cd").value;
    const termsCheckbox = document.getElementById("form2Example3c").checked;

    // Client-side validation
    if (!name || !email || !password || !repeatPassword) {
      alert("All fields are required");
      return;
    }

    if (password !== repeatPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    if (!termsCheckbox) {
      alert("Please agree to the Terms of Service");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Registration successful! Redirecting to login...");
        window.location.href = "/login.html";
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred. Please try again later.");
    }
  });
}
