import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",

  use: {
    baseURL: "http://localhost:5173",

    // ✅ В CI всегда headless, локально можно смотреть
    headless: isCI ? true : false,

    // ✅ В CI лучше фиксированный viewport (стабильнее), локально можно fullscreen
    viewport: isCI ? { width: 1280, height: 720 } : null,

    launchOptions: {
      // ✅ args нужны только локально
      args: isCI ? [] : ["--start-maximized"],

      // ✅ slowMo только локально
      slowMo: isCI ? 0 : 700,
    },

    // ✅ очень полезно для дебага CI
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  webServer: {
    command: "npm run dev -- --host --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: !isCI, // ✅ в CI лучше не реюзать
    timeout: 120 * 1000,
  },
});
