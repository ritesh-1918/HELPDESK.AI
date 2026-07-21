import '@testing-library/cypress/add-commands';

// Alternatively you can use CommonJS syntax:
// require('@testing-library/cypress/add-commands')

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
