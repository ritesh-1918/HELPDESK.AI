import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, val) => { store[key] = val; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
const matchMediaMock = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  value: matchMediaMock,
});

describe('useTheme hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
  });

  it('defaults to light mode when no preference is set', async () => {
    const { useTheme } = await import('../../hooks/useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles dark mode on and persists to localStorage', async () => {
    const { useTheme } = await import('../../hooks/useTheme');
    const { result } = renderHook(() => useTheme());

    act(() => result.current.toggle());
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('helpdesk-dark-mode', 'true');

    act(() => result.current.toggle());
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('helpdesk-dark-mode', 'false');
  });

  it('reads persisted dark mode preference', async () => {
    localStorageMock.getItem.mockReturnValue('true');
    const { useTheme } = await import('../../hooks/useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('reads system preference when no stored value', async () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
    const { useTheme } = await import('../../hooks/useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('provides enable and disable functions', async () => {
    const { useTheme } = await import('../../hooks/useTheme');
    const { result } = renderHook(() => useTheme());

    act(() => result.current.enable());
    expect(result.current.isDark).toBe(true);

    act(() => result.current.disable());
    expect(result.current.isDark).toBe(false);
  });

  it('follows system preference changes when no stored value', async () => {
    const listeners = {};
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: jest.fn((event, handler) => { listeners[event] = handler; }),
      removeEventListener: jest.fn(),
    });

    const { useTheme } = await import('../../hooks/useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(false);

    act(() => {
      listeners.change({ matches: true });
    });
    expect(result.current.isDark).toBe(true);
  });
});

describe('ThemeToggle component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
  });

  it('renders moon icon in light mode', async () => {
    jest.isolateModules(async () => {
      const ThemeToggle = (await import('../../components/shared/ThemeToggle')).default;
      render(<ThemeToggle />);
      const btn = screen.getByRole('button');
      expect(btn).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    });
  });

  it('renders sun icon in dark mode', async () => {
    localStorageMock.getItem.mockReturnValue('true');
    jest.isolateModules(async () => {
      const ThemeToggle = (await import('../../components/shared/ThemeToggle')).default;
      render(<ThemeToggle />);
      expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    });
  });
});
