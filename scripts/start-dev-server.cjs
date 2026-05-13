const cp = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const cwd = path.resolve(__dirname, "..");
const port = process.env.PORT || "5173";
const host = process.env.HOST || "127.0.0.1";
const viteBin = path.join(cwd, "node_modules", "vite", "bin", "vite.js");

const child = cp.spawn(process.execPath, [viteBin, "--host", host, "--port", port], {
  cwd,
  detached: true,
  shell: false,
  stdio: "ignore",
  windowsHide: true,
});

child.unref();

fs.writeFileSync(
  path.join(cwd, ".dev-server.json"),
  JSON.stringify(
    {
      pid: child.pid,
      host,
      port: Number(port),
      url: `http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${port}`,
      startedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

console.log(`Started APU dashboard dev server at http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${port} (pid ${child.pid})`);
