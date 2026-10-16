import http from "node:http";
import { existsSync, createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleChat, handleModels } from "./ai.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");
const PORT = process.env.PORT || 8787;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const p = url.pathname;

    if (p === "/api/ai/chat") return handleChat(req, res);
    if (p === "/api/ai/models") return handleModels(req, res);

    let file = path.join(DIST, decodeURIComponent(p));
    if (p === "/" || !existsSync(file)) file = path.join(DIST, "index.html");
    if (!existsSync(file)) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      return res.end("Not found — run `npm run build` first.");
    }
    res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
    createReadStream(file).pipe(res);
  })
  .listen(PORT, () => {
    console.log(`Appui server → http://localhost:${PORT}  (keyless free backend)`);
  });
