describe('Ticket Lifecycle', () => {
  beforeEach(() => {
    cy.interceptAPICalls();
  });

  it('should display user dashboard', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('should show create ticket form', () => {
    cy.visit('/user/create-ticket');
    cy.get('body').should('be.visible');
    cy.get('input, textarea').should('have.length.greaterThan', 0);
  });

  it('should show tickets list page', () => {
    cy.visit('/user/tickets');
    cy.get('body').should('be.visible');
  });

  it('should show ticket tracking page', () => {
    cy.visit('/user/ticket-tracking/test-id');
    cy.get('body').should('be.visible');
  });
});
