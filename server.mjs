import { createServer } from "node:http";
import { Readable } from "node:stream";
import { createReadStream, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, resolve, sep, extname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "dist");
const clientDir = join(distDir, "client");
const serverEntry = resolve(distDir, "server", "server.js");

const entryUrl = new URL("file://" + serverEntry.replace(/\\/g, "/"));
const mod = await import(entryUrl.href);
const handler = mod.default ?? mod;

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const MIME_TYPES = {
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

function resolveStaticPath(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }
  if (pathname === "/" || pathname === "") return null;

  const normalized = normalize(pathname).replace(/^[\\/]+/, "");
  const fullPath = resolve(clientDir, normalized);
  if (fullPath !== clientDir && !fullPath.startsWith(clientDir + sep)) return null;

  try {
    const stat = statSync(fullPath);
    if (!stat.isFile()) return null;
    return { fullPath, size: stat.size };
  } catch {
    return null;
  }
}

function serveStatic(req, res, file) {
  const ext = extname(file.fullPath).toLowerCase();
  const type = MIME_TYPES[ext] ?? "application/octet-stream";
  const isHashed = /[-.][A-Za-z0-9_-]{8,}\./.test(file.fullPath);
  const cacheControl = isHashed
    ? "public, max-age=31536000, immutable"
    : "public, max-age=0, must-revalidate";

  res.statusCode = 200;
  res.setHeader("content-type", type);
  res.setHeader("content-length", String(file.size));
  res.setHeader("cache-control", cacheControl);

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  const stream = createReadStream(file.fullPath);
  stream.on("error", (err) => {
    console.error(err);
    if (!res.headersSent) res.statusCode = 500;
    res.end();
  });
  stream.pipe(res);
}

function toWebRequest(req) {
  const protocol = req.socket && req.socket.encrypted ? "https" : "http";
  const hostHeader = req.headers.host ?? `localhost:${port}`;
  const url = new URL(req.url ?? "/", `${protocol}://${hostHeader}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }

  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";

  return new Request(url, {
    method,
    headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: "half",
  });
}

async function writeWebResponse(webRes, nodeRes) {
  nodeRes.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    nodeRes.setHeader(key, value);
  });

  if (!webRes.body) {
    nodeRes.end();
    return;
  }

  const reader = webRes.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      nodeRes.write(value);
    }
  } finally {
    nodeRes.end();
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" || req.method === "HEAD") {
      const file = resolveStaticPath(req.url ?? "/");
      if (file) {
        serveStatic(req, res, file);
        return;
      }
    }

    const webReq = toWebRequest(req);
    const webRes = await handler.fetch(webReq, {}, {});
    await writeWebResponse(webRes, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
    }
    try {
      res.end("Internal Server Error");
    } catch {}
  }
});

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});

const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
