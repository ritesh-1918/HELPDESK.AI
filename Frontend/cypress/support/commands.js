/* eslint-disable no-unused-vars */
/* global Cypress, cy */

// ─── Auth Commands ───────────────────────────────────────────────────────────

/**
 * Login via the UI with email and password.
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

/**
 * Login as admin using fixture credentials.
 * Stubs the Supabase auth response for deterministic testing.
 */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.fixture('admin').then((admin) => {
    // Set auth tokens in localStorage to simulate logged-in state
    cy.window().then((win) => {
      win.localStorage.setItem(
        'sb-localhost-auth-token',
        JSON.stringify({
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          expires_at: Date.now() + 3600000,
          user: {
            id: 'test-admin-uid',
            email: admin.email,
            user_metadata: { full_name: admin.fullName, role: 'admin' },
          },
        })
      );
    });

    // Intercept Supabase auth calls to return mock session
    cy.intercept('GET', '**/auth/v1/user**', {
      statusCode: 200,
      body: {
        id: 'test-admin-uid',
        email: admin.email,
        user_metadata: { full_name: admin.fullName, role: 'admin' },
      },
    }).as('getAuthUser');

    cy.intercept('POST', '**/auth/v1/token**', {
      statusCode: 200,
      body: {
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        user: {
          id: 'test-admin-uid',
          email: admin.email,
        },
      },
    }).as('postAuthToken');
  });
});

// ─── Settings API Commands ───────────────────────────────────────────────────

/**
 * Stub the Supabase system_settings API to return mock settings.
 * @param {Object} overrides - Partial settings to override defaults
 */
Cypress.Commands.add('stubSettingsApi', (overrides = {}) => {
  const defaultSettings = {
    ai_confidence_threshold: 0.75,
    duplicate_sensitivity: 3,
    enable_auto_resolve: true,
    auto_close_days: 7,
    email_notifications: true,
    admin_alerts: true,
    digest_enabled: false,
    digest_admin_email: 'admin@helpdesk.ai',
    enable_encryption: false,
    enable_pii_redaction: false,
    ...overrides,
  };

  // Intercept Supabase REST calls for system_settings
  cy.intercept('GET', '**/rest/v1/system_settings**', {
    statusCode: 200,
    body: [defaultSettings],
    headers: { 'content-range': '0-0/1' },
  }).as('getSettings');

  // Intercept upsert/save calls
  cy.intercept('PATCH', '**/rest/v1/system_settings**', {
    statusCode: 200,
    body: [{ ...defaultSettings }],
  }).as('saveSettings');

  cy.intercept('POST', '**/rest/v1/system_settings**', {
    statusCode: 201,
    body: [{ ...defaultSettings }],
  }).as('upsertSettings');
});

// ─── Navigation Commands ─────────────────────────────────────────────────────

/**
 * Navigate to admin settings page with auth stubs.
 */
Cypress.Commands.add('goToAdminSettings', () => {
  cy.visit('/admin/settings');
});

/**
 * Navigate to admin tickets page.
 */
Cypress.Commands.add('goToAdminTickets', () => {
  cy.visit('/admin/tickets');
});

/**
 * Navigate to admin dashboard.
 */
Cypress.Commands.add('goToAdminDashboard', () => {
  cy.visit('/admin/dashboard');
});

// ─── WebSocket / Realtime Commands ───────────────────────────────────────────

/**
 * Emit a simulated Supabase realtime ticket update event.
 * Dispatches a CustomEvent that the app's realtime listener can capture.
 * @param {string} ticketId - The ticket ID to update
 * @param {string} newStatus - The new status value
 */
Cypress.Commands.add('emitRealtimeTicketUpdate', (ticketId, newStatus) => {
  cy.window().then((win) => {
    const payload = {
      eventType: 'UPDATE',
      new: {
        ticket_id: ticketId,
        status: newStatus,
        updated_at: new Date().toISOString(),
      },
      old: { ticket_id: ticketId },
    };

    // Dispatch as a custom event for Supabase realtime channel simulation
    win.dispatchEvent(
      new CustomEvent('supabase-realtime-ticket', { detail: payload })
    );

    // Also try dispatching via a global handler if the app uses one
    if (win.__supabaseRealtimeHandler) {
      win.__supabaseRealtimeHandler(payload);
    }
  });
});

// ─── Storage Commands ────────────────────────────────────────────────────────

/**
 * Clear all localStorage.
 */
Cypress.Commands.add('clearAllLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

/**
 * Clear all sessionStorage.
 */
Cypress.Commands.add('clearAllSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

/**
 * Clear all cookies.
 */
Cypress.Commands.add('clearAllCookies', () => {
  cy.clearCookies();
});

// ─── Utility Commands ────────────────────────────────────────────────────────

/**
 * Wait for page to be fully loaded (no pending network requests).
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  // Wait a tick for any pending async operations
  cy.wait(500);
});

/**
 * Intercept and stub common backend API endpoints.
 */
Cypress.Commands.add('stubBackendApis', () => {
  // Tickets list
  cy.intercept('GET', '**/rest/v1/tickets**', {
    statusCode: 200,
    body: [],
    headers: { 'content-range': '0-0/0' },
  }).as('getTicketsList');

  // Company/profile
  cy.intercept('GET', '**/rest/v1/companies**', {
    statusCode: 200,
    body: [{ id: 'test-company-id', name: 'TestCorp' }],
  }).as('getCompany');

  // User profile
  cy.intercept('GET', '**/rest/v1/profiles**', {
    statusCode: 200,
    body: [
      {
        id: 'test-admin-uid',
        email: 'admin@helpdesk.ai',
        role: 'admin',
        company_id: 'test-company-id',
      },
    ],
  }).as('getProfile');
});
