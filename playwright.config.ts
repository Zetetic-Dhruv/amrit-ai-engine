import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  webServer: [
    { command: "npm run dev:mock-ai", port: 11434, reuseExistingServer: true, timeout: 20_000 },
    { command: "AMRIT_DATA_DIR=.e2e-data npm run start -- --port 3100", port: 3100, reuseExistingServer: true, timeout: 30_000 },
  ],
});
