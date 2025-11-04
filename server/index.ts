import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Simple proxy for LIS API to avoid CORS in production
  app.use('/api', async (req, res, next) => {
    try {
      const targetBase = 'http://163.47.10.13:8080';
      const url = targetBase + req.originalUrl;
      const method = req.method;
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') headers[k] = v;
      }
      // Remove host header to avoid host mismatch at upstream
      delete headers['host'];

      const body = method === 'GET' || method === 'HEAD' ? undefined : (await new Promise<Buffer>((resolve) => {
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(c as Buffer));
        req.on('end', () => resolve(Buffer.concat(chunks)));
      }));

      const r = await fetch(url, {
        method,
        headers,
        body: body as any,
      });

      res.status(r.status);
      // Pass through JSON or text
      const contentType = r.headers.get('content-type') || '';
      res.setHeader('content-type', contentType);
      const buf = Buffer.from(await r.arrayBuffer());
      res.end(buf);
    } catch (err) {
      next(err);
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
