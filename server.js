import express from "express"
import path from "path"
import morgan from "morgan"
import fs from "fs"
import { fileURLToPath } from "url"

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create Express app
const app = express()
const PORT = process.env.PORT || 3000

// Enable logging
app.use(morgan("dev"))

// Serve static files
app.use(express.static(__dirname))

// Debug middleware to log auth-related requests
app.use((req, res, next) => {
  if (req.url.includes("callback") || req.url.includes("auth")) {
    console.log("\n🔐 Auth-related request:")
    console.log(`URL: ${req.url}`)
    console.log("Headers:", req.headers)

    if (req.method === "POST") {
      let body = ""
      req.on("data", (chunk) => {
        body += chunk.toString()
      })
      req.on("end", () => {
        console.log("Body:", body)
      })
    }
  }
  next()
})

// Handle all routes - serve index.html for any non-file request
// This enables client-side routing
app.get("*", (req, res, next) => {
  const filePath = path.join(__dirname, req.path)

  // Check if the requested path is a file
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If not a file, serve index.html
      return res.sendFile(path.join(__dirname, "index.html"))
    }
    next()
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Server running at http://localhost:${PORT}

🔑 OIDC Auth Demo

Available pages:
- Home: http://localhost:${PORT}/
- Login: http://localhost:${PORT}/login.html
- Profile: http://localhost:${PORT}/profile.html
- Callback: http://localhost:${PORT}/callback.html

Remember to update auth.js with your OIDC provider details!
`)
})
