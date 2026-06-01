describe('Admin Settings Page', () => {
  beforeEach(() => {
    cy.visit('/admin/settings');
  });

  it('should load the admin settings page', () => {
    cy.get('h1, h2').should('exist');
    cy.url().should('include', '/admin');
  });

  it('should display navigation elements', () => {
    cy.get('nav, header, [role="navigation"]').should('exist');
  });

  it('should render settings form controls', () => {
    cy.get('input, select, textarea, button').should('have.length.at.least', 1);
  });

  it('should persist settings after page reload', () => {
    // Toggle a setting if available
    cy.get('input[type="checkbox"], input[type="radio"]').first().then(($el) => {
      const wasChecked = $el.is(':checked');
      cy.wrap($el).click();
      cy.reload();
      if (!wasChecked) {
        cy.get('input[type="checkbox"], input[type="radio"]').first().should('be.checked');
      }
    });
  });
});
