// auth.js - OIDC Authentication Service

// Import the debug utilities
import { debugLog, initializeDebugging } from "./debug.js"

// Configure OIDC client
const authConfig = {
  authority: "https://<your-oidc-server>", // Replace with your OIDC provider URL
  client_id: "poc.cli", // Replace with your client ID
  redirect_uri: window.location.origin + "/callback.html",
  post_logout_redirect_uri: window.location.origin + "/index.html",
  response_type: "code",
  scope: "openid profile email", // Adjust scopes as needed
  automaticSilentRenew: true,
  loadUserInfo: true,
}

// Create the UserManager using the global Oidc object from the CDN script
const userManager = new oidc.UserManager(authConfig)

// Initialize debugging
const debug = initializeDebugging(userManager)

// Log OIDC events for debugging
userManager.events.addUserLoaded((user) => {
  console.log("User loaded:", user)
  updateLoginStatus()
})

userManager.events.addSilentRenewError((error) => {
  console.error("Silent renew error:", error)
})

userManager.events.addUserSignedOut(() => {
  console.log("User signed out")
  userManager.removeUser()
  updateLoginStatus()
})

// Authentication functions
export const auth = {
  // Login function
  login: async () => {
    try {
      debugLog("auth", "Starting login redirect")
      await userManager.signinRedirect()
    } catch (error) {
      debugLog("error", "Login error:", error)
      console.error("Login error:", error)
      return { success: false, error }
    }
  },

  // Logout function
  logout: async () => {
    try {
      await userManager.signoutRedirect()
    } catch (error) {
      console.error("Logout error:", error)
      return { success: false, error }
    }
  },

  // Handle the callback from the identity provider
  handleCallback: async () => {
    try {
      debugLog("auth", "Processing authentication callback")
      const user = await userManager.signinRedirectCallback()
      debugLog("token", "Authentication successful", user)
      return { success: true, user }
    } catch (error) {
      debugLog("error", "Callback error:", error)
      console.error("Callback error:", error)
      return { success: false, error }
    }
  },

  // Get the current user
  getUser: async () => {
    try {
      const user = await userManager.getUser()
      return user
    } catch (error) {
      console.error("Get user error:", error)
      return null
    }
  },

  // Check if the user is authenticated
  isAuthenticated: async () => {
    const user = await auth.getUser()
    return !!user && !user.expired
  },

  // Renew the token silently
  renewToken: async () => {
    try {
      const user = await userManager.signinSilent()
      return { success: true, user }
    } catch (error) {
      console.error("Token renewal error:", error)
      return { success: false, error }
    }
  },
}

// Update login status in the UI
async function updateLoginStatus() {
  const isAuthenticated = await auth.isAuthenticated()
  const loginStatusElement = document.getElementById("login-status")

  if (loginStatusElement) {
    if (isAuthenticated) {
      const user = await auth.getUser()
      loginStatusElement.textContent = `Logout (${user.profile.name || user.profile.email || "User"})`
      loginStatusElement.onclick = (e) => {
        e.preventDefault()
        auth.logout()
      }
    } else {
      loginStatusElement.textContent = "Login"
      loginStatusElement.onclick = (e) => {
        e.preventDefault()
        auth.login()
      }
    }
  }
}

// Initialize auth status when the page loads
document.addEventListener("DOMContentLoaded", () => {
  updateLoginStatus()
})

