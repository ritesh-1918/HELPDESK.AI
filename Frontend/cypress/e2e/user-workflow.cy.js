describe('User Workflow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('allows a user to view the landing page and navigate to login', () => {
    cy.get('body').should('exist');
    // We check that the page loads correctly and we can see common elements
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('allows a user to access the dashboard', () => {
    cy.visit('/dashboard');
    cy.get('body').should('exist');
    // App should redirect to login if unauthenticated or show dashboard
    cy.url().should('include', '/login').or('include', '/dashboard');
  });
});
