// server/index.ts
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use("/api", async (req, res, next) => {
    try {
      const targetBase = "http://163.47.10.13:8080";
      const url = targetBase + req.originalUrl;
      const method = req.method;
      const headers = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string") headers[k] = v;
      }
      delete headers["host"];
      const body = method === "GET" || method === "HEAD" ? void 0 : await new Promise((resolve) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
      });
      const r = await fetch(url, {
        method,
        headers,
        body
      });
      res.status(r.status);
      const contentType = r.headers.get("content-type") || "";
      res.setHeader("content-type", contentType);
      const buf = Buffer.from(await r.arrayBuffer());
      res.end(buf);
    } catch (err) {
      next(err);
    }
  });
  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
  const port = process.env.PORT || 3e3;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
