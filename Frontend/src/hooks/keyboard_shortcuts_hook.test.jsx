import { fireEvent, renderHook } from '@testing-library/react';
import useKeyboardShortcuts from './useKeyboardShortcuts';
import { mockedNavigate } from '../../jest.setup';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  test('keeps G navigation sequence active when callers pass inline empty custom shortcuts', () => {
    renderHook(() => useKeyboardShortcuts({}, { role: 'admin' }));

    fireEvent.keyDown(window, { key: 'g' });
    fireEvent.keyDown(window, { key: 'd' });

    expect(mockedNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });
});
