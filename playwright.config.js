import { defineConfig, devices } from "@playwright/test";

// Puertos dedicados a e2e, distintos de los de desarrollo normal (5173/3001)
// para no pisar nunca un `npm run dev` / `npm run server` que ya este
// corriendo, y sobre todo para no tocar el db.json real: el mock backend de
// e2e levanta una COPIA temporal (ver tests/e2e/run-mock-server.cjs).
const APP_PORT = process.env.E2E_APP_PORT || "5183";
const API_PORT = process.env.E2E_API_PORT || "3101";
const BASE_URL = `http://localhost:${APP_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: [
    {
      // Mock backend (json-server) sobre una copia temporal de db.json.
      command: "node tests/e2e/run-mock-server.cjs",
      url: `http://localhost:${API_PORT}/users`,
      reuseExistingServer: false,
      timeout: 20_000,
      env: { PORT: API_PORT }
    },
    {
      // App real servida por Vite, apuntando al mock backend de e2e.
      command: "node tests/e2e/run-dev-server.mjs",
      url: BASE_URL,
      reuseExistingServer: false,
      timeout: 20_000,
      env: { PORT: APP_PORT, VITE_API_URL: `http://localhost:${API_PORT}` }
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
