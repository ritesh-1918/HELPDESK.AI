describe('Admin Dashboard', () => {
  beforeEach(() => {
    cy.interceptAPICalls();
  });

  it('should display admin login page', () => {
    cy.visit('/admin/login');
    cy.get('body').should('be.visible');
  });

  it('should display admin dashboard', () => {
    cy.visit('/admin/dashboard');
    cy.get('body').should('be.visible');
  });

  it('should display admin settings page', () => {
    cy.visit('/admin/settings');
    cy.get('body').should('be.visible');
  });

  it('should display admin tickets page', () => {
    cy.visit('/admin/tickets');
    cy.get('body').should('be.visible');
  });

  it('should display admin users page', () => {
    cy.visit('/admin/users');
    cy.get('body').should('be.visible');
  });
});
