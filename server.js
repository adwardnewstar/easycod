const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const EASYVOICE_PORT = 3001;
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function createStaticServer(rootDir, name) {
  return http.createServer((req, res) => {
    let url = req.url.split("?")[0];

    // 代理 API 请求到 EasyVoice 服务器
    if (url.startsWith("/.netlify/functions/")) {
      const options = {
        hostname: "127.0.0.1",
        port: 4090,
        path: req.url,
        method: req.method,
        headers: req.headers,
      };
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      proxyReq.on("error", (err) => {
        res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("代理失败: " + err.message);
      });
      req.pipe(proxyReq);
      return;
    }

    if (url === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url === "/") url = "/index.html";

    const filePath = path.join(rootDir, url);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<h1>404 - 页面未找到</h1><p>${url}</p>`);
        } else {
          res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<h1>500 - 服务器内部错误</h1><p>${err.message}</p>`);
        }
        return;
      }

      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  });
}

createStaticServer(__dirname, "材料样板管理系统").listen(PORT, () => {
  console.log(`材料样板管理系统已启动`);
  console.log(`访问地址: http://localhost:${PORT}`);
});

createStaticServer(
  path.join(__dirname, "..", "easyvoice", "frontend"),
  "展馆智能语音问答助手",
).listen(EASYVOICE_PORT, () => {
  console.log(`展馆智能语音问答助手已启动`);
  console.log(`访问地址: http://localhost:${EASYVOICE_PORT}`);
});
