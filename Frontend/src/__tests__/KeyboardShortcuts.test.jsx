import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

describe('useKeyboardShortcuts', () => {
  let navigateMock;

  beforeEach(() => {
    navigateMock = jest.fn();
    delete window.__keyboardNavigate;
    window.__keyboardNavigate = (path) => navigateMock(path);
  });

  afterEach(() => {
    delete window.__keyboardNavigate;
  });

  it('navigates to dashboard on "g d" chord', async () => {
    const { useKeyboardShortcuts } = await import('../../hooks/useKeyboardShortcuts');
    renderHook(() => useKeyboardShortcuts());

    fireEvent.keyDown(window, { key: 'g' });
    fireEvent.keyDown(window, { key: 'd' });

    expect(navigateMock).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('navigates to tickets on "g t" chord', async () => {
    const { useKeyboardShortcuts } = await import('../../hooks/useKeyboardShortcuts');
    renderHook(() => useKeyboardShortcuts());

    fireEvent.keyDown(window, { key: 'g' });
    fireEvent.keyDown(window, { key: 't' });

    expect(navigateMock).toHaveBeenCalledWith('/admin/tickets');
  });

  it('toggles help overlay on "?" key', async () => {
    const { useKeyboardShortcuts } = await import('../../hooks/useKeyboardShortcuts');
    const { result } = renderHook(() => useKeyboardShortcuts());

    expect(result.current.showHelp).toBe(false);
    fireEvent.keyDown(window, { key: '?' });
    expect(result.current.showHelp).toBe(true);
    fireEvent.keyDown(window, { key: '?' });
    expect(result.current.showHelp).toBe(false);
  });

  it('closes help overlay on Escape', async () => {
    const { useKeyboardShortcuts } = await import('../../hooks/useKeyboardShortcuts');
    const { result } = renderHook(() => useKeyboardShortcuts());

    fireEvent.keyDown(window, { key: '?' });
    expect(result.current.showHelp).toBe(true);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(result.current.showHelp).toBe(false);
  });

  it('ignores keypresses when typing in input fields', async () => {
    const { useKeyboardShortcuts } = await import('../../hooks/useKeyboardShortcuts');
    const navigateFn = jest.fn();
    window.__keyboardNavigate = navigateFn;

    renderHook(() => useKeyboardShortcuts());

    const input = document.createElement('input');
    fireEvent.keyDown(input, { key: 'g', target: input });
    fireEvent.keyDown(input, { key: 'd', target: input });

    expect(navigateFn).not.toHaveBeenCalled();
  });

  it('supports custom shortcut overrides', async () => {
    const { useKeyboardShortcuts } = await import('../../hooks/useKeyboardShortcuts');
    const custom = { 'g x': { label: 'Custom Action', action: 'navigate', path: '/custom' } };
    const navigateFn = jest.fn();
    window.__keyboardNavigate = navigateFn;

    renderHook(() => useKeyboardShortcuts(custom));

    fireEvent.keyDown(window, { key: 'g' });
    fireEvent.keyDown(window, { key: 'x' });

    expect(navigateFn).toHaveBeenCalledWith('/custom');
  });
});

describe('KeyboardShortcutsHelp', () => {
  it('renders shortcut list and calls onClose on backdrop click', async () => {
    const KeyboardShortcutsHelp = (await import('../../components/shared/KeyboardShortcutsHelp')).default;
    const onClose = jest.fn();

    const shortcuts = {
      'g d': { label: 'Go to Dashboard', action: 'navigate', path: '/admin/dashboard' },
      '?': { label: 'Toggle help overlay', action: 'toggleHelp' },
    };

    render(<KeyboardShortcutsHelp shortcuts={shortcuts} onClose={onClose} />);

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('G then D')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Keyboard Shortcuts').closest('div').parentElement);
    expect(onClose).toHaveBeenCalled();
  });
});
