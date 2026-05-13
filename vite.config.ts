/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "node:path";

const cacheDir =
  process.env.VITE_CACHE_DIR ||
  (process.platform === "win32" && process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, "apu-alerting-dashboard", "vite-cache")
    : ".vite-cache");

export default defineConfig({
  cacheDir,
  server: {
    watch: {
      usePolling: process.platform === "win32",
      interval: 250,
    },
  },
  test: {
    exclude: ["node_modules/**", "dist/**", "tests/e2e/**"],
  },
});
