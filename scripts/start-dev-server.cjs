const cp = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const cwd = path.resolve(__dirname, "..");
const port = process.env.PORT || "5173";
const command = process.platform === "win32"
  ? `npm.cmd run dev -- --host 127.0.0.1 --port ${port}`
  : `npm run dev -- --host 127.0.0.1 --port ${port}`;

const child = cp.spawn(command, [], {
  cwd,
  detached: true,
  shell: true,
  stdio: "ignore",
  windowsHide: true,
});

child.unref();

fs.writeFileSync(
  path.join(cwd, ".dev-server.json"),
  JSON.stringify(
    {
      pid: child.pid,
      port: Number(port),
      url: `http://127.0.0.1:${port}`,
      startedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

console.log(`Started APU dashboard dev server at http://127.0.0.1:${port} (pid ${child.pid})`);
