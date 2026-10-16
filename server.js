const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const HOST = "0.0.0.0";
const ASSETS_DIR = path.join(__dirname, "app", "src", "main", "assets");

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=UTF-8"
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception in dev server:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection in dev server:", reason);
});

const server = http.createServer((req, res) => {
  try {
    let rawPath = req.url ? req.url.split("?")[0] : "/";
    let reqPath;
    try {
      reqPath = decodeURIComponent(rawPath);
    } catch {
      reqPath = rawPath;
    }

    if (reqPath === "/" || reqPath === "") {
      reqPath = "/index.html";
    }

    const filePath = path.join(ASSETS_DIR, reqPath);

    // Prevent directory traversal
    if (!filePath.startsWith(ASSETS_DIR)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        const indexFallback = path.join(ASSETS_DIR, "index.html");
        fs.readFile(indexFallback, (err2, data) => {
          if (err2) {
            res.statusCode = 404;
            res.end("Not Found");
          } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
            res.end(data);
          }
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache"
      });

      const stream = fs.createReadStream(filePath);
      stream.on("error", (streamErr) => {
        console.error("Stream read error:", streamErr);
        if (!res.headersSent) {
          res.statusCode = 500;
        }
        res.end();
      });
      stream.pipe(res);
    });
  } catch (handlerErr) {
    console.error("Handler error:", handlerErr);
    if (!res.headersSent) {
      res.statusCode = 500;
    }
    res.end("Internal Server Error");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is already in use, reusing existing listener`);
  } else {
    console.error("Server error:", err);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Tuition Collection Dev Server running at http://${HOST}:${PORT}`);
});
