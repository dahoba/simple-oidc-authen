import express from "express"
import path from "path"
import morgan from "morgan"
import fs from "fs"
import https from "https"
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
app.get("*", (req, res, next) => {
  const filePath = path.join(__dirname, req.path)

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.sendFile(path.join(__dirname, "index.html"))
    }
    next()
  })
})

// Check for SSL certificates
try {
  const privateKey = fs.readFileSync("server.key", "utf8")
  const certificate = fs.readFileSync("server.crt", "utf8")

  const credentials = { key: privateKey, cert: certificate }

  // Create HTTPS server
  const httpsServer = https.createServer(credentials, app)

  httpsServer.listen(PORT, () => {
    console.log(`
    🔒 HTTPS Server running at https://localhost:${PORT}
    
    🔑 OIDC Auth Demo (Secure)
    
    Available pages:
    - Home: https://localhost:${PORT}/
    - Login: https://localhost:${PORT}/login.html
    - Profile: https://localhost:${PORT}/profile.html
    - Callback: https://localhost:${PORT}/callback.html
    
    Remember to update auth.js with your OIDC provider details!
    `)
  })
} catch (error) {
  console.log(`
  ⚠️ SSL certificates not found. Running in HTTP mode.
  
  To generate self-signed certificates for HTTPS:
  
  1. Install OpenSSL
  2. Run: openssl req -nodes -new -x509 -keyout server.key -out server.crt
  3. Restart this server
  
  For now, starting HTTP server...
  `)

  // Fall back to HTTP
  app.listen(PORT, () => {
    console.log(`
    🚀 HTTP Server running at http://localhost:${PORT}
    
    🔑 OIDC Auth Demo
    
    Available pages:
    - Home: http://localhost:${PORT}/
    - Login: http://localhost:${PORT}/login.html
    - Profile: http://localhost:${PORT}/profile.html
    - Callback: http://localhost:${PORT}/callback.html
    
    Remember to update auth.js with your OIDC provider details!
    `)
  })
}

