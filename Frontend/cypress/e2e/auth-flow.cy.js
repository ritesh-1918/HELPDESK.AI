describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.interceptAPICalls();
  });

  it('should display login page', () => {
    cy.visit('/login');
    cy.contains('Login').should('be.visible');
    cy.get('input[type="email"], input[name="email"]').should('be.visible');
    cy.get('input[type="password"], input[name="password"]').should('be.visible');
  });

  it('should display signup page', () => {
    cy.visit('/signup');
    cy.contains('Sign Up').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('invalid@test.com');
    cy.get('input[type="password"], input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('.error, [role="alert"], .text-red').should('be.visible');
  });

  it('should navigate between login and signup', () => {
    cy.visit('/login');
    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('should navigate to forgot password', () => {
    cy.visit('/login');
    cy.contains(/forgot/i).click();
    cy.url().should('include', '/forgot');
  });
});
