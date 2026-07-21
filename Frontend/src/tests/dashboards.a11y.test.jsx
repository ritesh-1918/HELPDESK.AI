import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Import dashboards
import Dashboard from '../user/pages/Dashboard';
import AdminDashboard from '../admin/pages/AdminDashboard';
import MasterAdminDashboard from '../master-admin/pages/MasterAdminDashboard';

// Mock matchMedia for UI components (like Antd or others) that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// We wrap components in BrowserRouter to handle links
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Accessibility tests for Dashboard Templates', () => {
  it('User Dashboard should have no accessibility violations', async () => {
    const { container } = renderWithRouter(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Admin Dashboard should have no accessibility violations', async () => {
    const { container } = renderWithRouter(<AdminDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Master Admin Dashboard should have no accessibility violations', async () => {
    const { container } = renderWithRouter(<MasterAdminDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
