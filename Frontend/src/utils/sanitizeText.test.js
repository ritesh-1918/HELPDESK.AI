import assert from 'node:assert/strict';
import { safeDisplayText, sanitizeDisplayText } from './sanitizeText.js';

assert.equal(
    sanitizeDisplayText('<img src=x onerror=alert(1)>Printer is down'),
    'Printer is down'
);

assert.equal(
    sanitizeDisplayText('Normal VPN issue < 5 minutes after login'),
    'Normal VPN issue < 5 minutes after login'
);

assert.equal(
    sanitizeDisplayText('<script>alert(document.cookie)</script>Need password reset'),
    'Need password reset'
);

assert.equal(
    sanitizeDisplayText('<a href="javascript:alert(1)">Click me</a>'),
    'Click me'
);

assert.equal(safeDisplayText('<script>alert(1)</script>', 'No description provided'), 'No description provided');

console.log('sanitizeText tests passed');
