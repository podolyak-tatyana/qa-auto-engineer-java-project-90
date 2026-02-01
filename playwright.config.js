import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  use: {
    baseURL: "http://localhost:5173",

    headless: false, // показывать браузер
    viewport: null,  // убрать фиксированный размер

    launchOptions: {
      args: ["--start-maximized"], //  открыть максимально
      slowMo: 700,                 // замедление (можно 200/500)
    },
  },

  webServer: {
    command: "npm run dev -- --host --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
