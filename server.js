const http = require("http");
const fs = require("fs");

http.createServer((req, res) => {
  fs.readFile("home.html", (err, html) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });
}).listen(8080);