/**
 * Tests for useTabSync BroadcastChannel hook — issue #3217
 */

import { broadcastAuthEvent, TAB_SYNC_EVENTS } from './useTabSync';

describe('broadcastAuthEvent', () => {
  let mockChannel;

  beforeEach(() => {
    mockChannel = { postMessage: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() };
    global.BroadcastChannel = jest.fn(() => mockChannel);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset singleton
    jest.resetModules();
  });

  it('posts LOGGED_IN message with user payload', () => {
    const user = { id: 'u1', email: 'test@test.com' };
    broadcastAuthEvent(TAB_SYNC_EVENTS.LOGGED_IN, { user });
    expect(mockChannel.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TAB_SYNC_EVENTS.LOGGED_IN,
        payload: { user },
      })
    );
  });

  it('posts LOGGED_OUT message', () => {
    broadcastAuthEvent(TAB_SYNC_EVENTS.LOGGED_OUT);
    expect(mockChannel.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: TAB_SYNC_EVENTS.LOGGED_OUT })
    );
  });

  it('posts PROFILE_UPDATED message with profile payload', () => {
    const profile = { id: 'u1', role: 'admin' };
    broadcastAuthEvent(TAB_SYNC_EVENTS.PROFILE_UPDATED, { profile, userId: 'u1' });
    expect(mockChannel.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TAB_SYNC_EVENTS.PROFILE_UPDATED,
        payload: { profile, userId: 'u1' },
      })
    );
  });

  it('does not throw when BroadcastChannel is unavailable', () => {
    delete global.BroadcastChannel;
    expect(() => broadcastAuthEvent(TAB_SYNC_EVENTS.LOGGED_OUT)).not.toThrow();
  });
});