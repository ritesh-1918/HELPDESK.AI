import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    env: {
      SUPABASE_URL: "http://localhost:54321",
      SUPABASE_ANON_KEY: "test-anon-key",
    },
    setupNodeEvents(on, config) {
      // Node event listeners for plugins
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });
      return config;
    },
  },
});
