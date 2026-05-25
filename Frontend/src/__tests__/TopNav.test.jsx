import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TopNav from '../user/components/TopNav';
import { MemoryRouter } from 'react-router-dom';

// Mock auth store
jest.mock('../store/authStore', () => ({
  __esModule: true,
  default: () => ({
    profile: {
      full_name: 'Jane Doe',
      email: 'jane@company.com',
      role: 'user',
      profile_picture: ''
    },
    logout: jest.fn()
  })
}));

// Mock ticket store
jest.mock('../store/ticketStore', () => ({
  __esModule: true,
  default: () => ({
    tickets: []
  })
}));

// Mock NotificationPopover
jest.mock('../user/components/NotificationPopover', () => {
  return function DummyNotificationPopover() {
    return <div data-testid="notification-popover">Notifications</div>;
  };
});

describe('TopNav Theme Toggle Logic', () => {
  beforeEach(() => {
    // Reset localStorage and document root classes
    localStorage.clear();
    document.documentElement.className = '';
    jest.clearAllMocks();
  });

  test('initializes theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>
    );

    // Verify document root contains 'dark' class
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('toggles theme from light to dark on click and persists to localStorage', () => {
    // Starts in light mode
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Find the toggle button
    const toggleBtn = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(toggleBtn).toBeInTheDocument();

    // Click it to transition to dark mode
    fireEvent.click(toggleBtn);

    // Verify document root has 'dark' class and localStorage is 'dark'
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    // Click again to transition back to light mode
    fireEvent.click(toggleBtn);

    // Verify document root removes 'dark' class and localStorage is 'light'
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
