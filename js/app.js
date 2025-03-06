// app.js - Main application logic for the home page

// Import the authentication module
import { auth } from "./auth.js"

document.addEventListener("DOMContentLoaded", async () => {
  // Get references to UI elements
  const loginButton = document.getElementById("login-button")

  // Check authentication status
  const isAuthenticated = await auth.isAuthenticated()

  // Set up login button
  if (loginButton) {
    if (isAuthenticated) {
      loginButton.textContent = "Go to Profile"
      loginButton.onclick = () => {
        window.location.href = "profile.html"
      }
    } else {
      loginButton.textContent = "Login"
      loginButton.onclick = () => {
        auth.login()
      }
    }
  }
})

