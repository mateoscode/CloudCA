const http = require("http");
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

function loadServiceAccount() {
  if (process.env.FIREBASE_CREDENTIALS) {
    try {
      return JSON.parse(process.env.FIREBASE_CREDENTIALS);
    } catch (error) {
      console.error("Invalid FIREBASE_CREDENTIALS JSON:", error.message);
      process.exit(1);
    }
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, "firebase-key.json");
  if (!fs.existsSync(credentialsPath)) {
    console.error(`Missing service account credentials at ${credentialsPath}`);
    process.exit(1);
  }

  try {
    return JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
  } catch (error) {
    console.error("Unable to read service account file:", error.message);
    process.exit(1);
  }
}

const serviceAccount = loadServiceAccount();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const MAX_BODY_SIZE = 1_000_000;

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // ----Home Page
  if (req.method === "GET" && pathname === "/") {
    try {
      const htmlPath = path.join(__dirname, "home.html");
      const html = await fs.promises.readFile(htmlPath, "utf8");
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(html);
    } catch (error) {
      console.error("Failed to load home.html:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end("Unable to load home page");
    }
  }

  // ---- Submit form 
  if (req.method === "POST" && pathname === "/submit") {
    try {
      const rawBody = await readRequestBody(req);
      const type = req.headers["content-type"] || "";
      let payload = {};
      if (type.includes("application/json")) {
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch (parseError) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON payload" }));
          return;
        }
      } else {
        payload = Object.fromEntries(new URLSearchParams(rawBody));
      }

      const email = typeof payload.email === "string" ? payload.email.trim() : "";
      const password = typeof payload.password === "string" ? payload.password : "";

      if (!email || !password || password.length < 6) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Email and 6+ character password required" }));
        return;
      }

      await db.collection("logintest").add({
        email,
        password,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User data stored in Firestore" }));
    } catch (error) {
      if (error.message === "PAYLOAD_TOO_LARGE") {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        return;
      }
      console.error("Error handling /submit:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");

}).listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});
