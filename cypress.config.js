// cypress.config.js
const { defineConfig } = require('cypress')
module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://boutique.orange.ma',
    retries: { runMode: 1, openMode: 0 },
    viewportWidth: 1366,
    viewportHeight: 768,
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    defaultCommandTimeout: 10000,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
      return config
    }
  },
  video: false,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportFilename: 'report',
    overwrite: true,
    html: true,
    json: false,
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true
  }
})
