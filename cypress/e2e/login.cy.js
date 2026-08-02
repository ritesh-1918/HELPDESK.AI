describe('User Login Flow', () => {
  it('should allow a user to login and load the dashboard', () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Check if auth token is saved (assuming localStorage is used)
    cy.window().its('localStorage').invoke('getItem', 'supabase.auth.token').should('exist')
    
    // Verify redirection to dashboard
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })
})
