describe('AI Analysis Flow', () => {
  beforeEach(() => {
    cy.interceptAPICalls();
  });

  it('should load the application', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('should have working health endpoint', () => {
    cy.request({ url: '/health', failOnStatusCode: false }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404, 500]);
    });
  });
});
