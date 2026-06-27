import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createRoleAwareShortcuts,
  getShortcutAction,
  getShortcutDescription,
  isShortcutTypingTarget,
  SHORTCUTS_LEGEND,
} from '../src/hooks/keyboard_shortcuts_config.js';

test('maps admin dashboard and tickets shortcuts to admin routes', () => {
  const shortcuts = createRoleAwareShortcuts('admin');

  assert.equal(getShortcutAction(shortcuts, ['g', 'd']), '/admin/dashboard');
  assert.equal(getShortcutAction(shortcuts, ['g', 't']), '/admin/tickets');
});

test('maps user dashboard and tickets shortcuts to user routes', () => {
  const shortcuts = createRoleAwareShortcuts('user');

  assert.equal(getShortcutAction(shortcuts, ['g', 'd']), '/user/dashboard');
  assert.equal(getShortcutAction(shortcuts, ['g', 't']), '/user/my-tickets');
});

test('keeps browser-safe quick actions available', () => {
  const shortcuts = createRoleAwareShortcuts('admin');

  assert.equal(getShortcutAction(shortcuts, ['ctrl', 'f']), 'search');
  assert.equal(getShortcutAction(shortcuts, ['ctrl', 'k']), 'search');
  assert.equal(getShortcutAction(shortcuts, ['ctrl', '/']), 'shortcuts-help');
  assert.equal(getShortcutAction(shortcuts, ['?']), 'shortcuts-help');
});

test('does not run global shortcuts while users are typing', () => {
  assert.equal(isShortcutTypingTarget({ tagName: 'INPUT' }), true);
  assert.equal(isShortcutTypingTarget({ tagName: 'TEXTAREA' }), true);
  assert.equal(isShortcutTypingTarget({ tagName: 'DIV', isContentEditable: true }), true);
  assert.equal(isShortcutTypingTarget({ tagName: 'BUTTON' }), false);
});

test('legend documents required dashboard, tickets, search, and help shortcuts', () => {
  const combos = SHORTCUTS_LEGEND.map(({ combo }) => combo);

  assert.deepEqual(combos, ['G + D', 'G + T', 'Ctrl + F', 'Ctrl + /']);
});

test('normalizes role objects and boolean admin flags', () => {
  assert.equal(createRoleAwareShortcuts({ isAdmin: true })['g,u'], '/admin/users');
  assert.equal(createRoleAwareShortcuts(true)['g,s'], '/admin/settings');
  assert.equal(createRoleAwareShortcuts({ isAdmin: false })['g,n'], '/user/create-ticket');
});

test('describes normalized escape shortcut consistently', () => {
  assert.equal(getShortcutDescription('escape'), 'Close modal');
});
