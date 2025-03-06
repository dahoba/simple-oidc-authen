// login.js - Login page logic

// Import the auth object
import { auth } from "./auth.js" // Adjust path as needed

document.addEventListener("DOMContentLoaded", async () => {
  // Get references to UI elements
  const loginButton = document.getElementById("login-button")
  const loginMessage = document.getElementById("login-message")

  // Check if user is already authenticated
  const isAuthenticated = await auth.isAuthenticated()

  if (isAuthenticated) {
    // User is already logged in, redirect to profile
    loginMessage.textContent = "You are already logged in. Redirecting to profile..."
    loginMessage.classList.add("success")
    setTimeout(() => {
      window.location.href = "profile.html"
    }, 2000)
  } else {
    // Set up login button
    loginButton.onclick = () => {
      loginMessage.textContent = "Redirecting to identity provider..."
      loginMessage.classList.add("info")
      auth.login()
    }
  }
})

