import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    open: true
  },
  test: {
    // Los specs de Playwright viven en tests/e2e y los corre `playwright test`,
    // no Vitest (que por defecto tambien matchea *.spec.js).
    exclude: [...configDefaults.exclude, "tests/e2e/**"]
  }
});
