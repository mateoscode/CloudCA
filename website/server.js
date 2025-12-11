
const http = require("http");
const fs = require("fs");



http.createServer(async (req, res) => {

  // ----Home Page
  if (req.method === "GET" && req.url === "/") {
    const html = fs.readFileSync("home.html", "utf8");
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(html);
  }

  // ---- Submit form 
  if (req.method === "POST" && req.url === "/submit") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const form = new URLSearchParams(body);
        const email = form.get("email");
        const password = form.get("password");
        if (!email || !password || password.length < 6) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Email and 6+ character password required");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("User data received (no Firebase)");
      } catch (error) {
        console.error("Error:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server error");
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");

}).listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});
