const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://boutique.orange.ma',
    retries: { runMode: 1, openMode: 0 },
    viewportWidth: 1366,
    viewportHeight: 768,
    supportFile: 'cypress/support/e2e.js', // مهم
    specPattern: 'cypress/e2e/**/*.cy.js',
    defaultCommandTimeout: 10000,
    chromeWebSecurity: false
  },
  video: false
})
