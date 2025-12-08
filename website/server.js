const http = require("http");
const fs = require("fs");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("../firebase-key.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();


// HTTP Server
http.createServer(async (req, res) => {

  // ---- Serve HTML
  if (req.method === "GET" && req.url === "/") {
    const html = fs.readFileSync("home.html", "utf8");
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(html);
  }

  // ---- Handle Form Submit
  if (req.method === "POST" && req.url === "/submit") {
    let body = "";

    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const form = new URLSearchParams(body);

        const email = form.get("email");
        const password = form.get("password");

        if (!email || !password || password.length < 6) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Email and 6+ character password required");
        }

        const user = await auth.createUser({ email, password });

        await db.collection("users").doc(user.uid).set({
          email,
          createdAt: new Date(),
        });

        console.log("Saved user:", user.uid);

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("User created & saved in Firestore");
      } catch (error) {
        console.error("Error:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(error.code + ": " + error.message);
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");

}).listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});
