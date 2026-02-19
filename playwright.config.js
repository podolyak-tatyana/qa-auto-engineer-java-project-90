import { defineConfig } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isCI = !!process.env.CI;
const withCoverage = !!process.env.COVERAGE;

export default defineConfig({
  testDir: "./tests",

  ...(withCoverage && {
    workers: 1,
    globalSetup: path.join(__dirname, "tests", "coverage-setup.js"),
    globalTeardown: path.join(__dirname, "tests", "coverage-teardown.js"),
  }),

  use: {
    baseURL: "http://localhost:5173",

    // В CI всегда headless, локально можно смотреть
    headless: isCI ? true : false,

    // В CI лучше фиксированный viewport (стабильнее), локально можно fullscreen
    viewport: isCI ? { width: 1280, height: 720 } : null,

    launchOptions: {
      // args нужны только локально
      args: isCI ? [] : ["--start-maximized"],

      //  slowMo только локально
      slowMo: isCI ? 0 : 700,
    },

    // очень полезно для дебага CI
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  webServer: {
    command: "npm run dev -- --host --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
    ...(withCoverage && { env: { COVERAGE: "1" } }),
  },
});
