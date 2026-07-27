// ***********************************************************
// Custom Cypress commands for HELPDESK.AI E2E tests
// ***********************************************************

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"], input[name="email"], [data-testid="email-input"]').type(email);
  cy.get('input[type="password"], input[name="password"], [data-testid="password-input"]').type(password);
  cy.get('button[type="submit"], [data-testid="login-button"]').click();
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login(
    Cypress.env('ADMIN_EMAIL') || 'admin@test.com',
    Cypress.env('ADMIN_PASSWORD') || 'testpassword123'
  );
});

Cypress.Commands.add('loginAsUser', () => {
  cy.login(
    Cypress.env('USER_EMAIL') || 'user@test.com',
    Cypress.env('USER_PASSWORD') || 'testpassword123'
  );
});

Cypress.Commands.add('createTicket', (subject, description) => {
  cy.visit('/user/create-ticket');
  cy.get('input[name="subject"], [data-testid="subject-input"]').type(subject);
  cy.get('textarea[name="description"], [data-testid="description-input"]').type(description);
  cy.get('button[type="submit"], [data-testid="submit-ticket"]').click();
});

Cypress.Commands.add('interceptAPICalls', () => {
  cy.intercept('POST', '/ai/analyze*').as('analyzeTicket');
  cy.intercept('POST', '/ai/analyze_stream').as('analyzeStream');
  cy.intercept('GET', '/tickets*').as('getTickets');
  cy.intercept('POST', '/tickets/save').as('saveTicket');
});
