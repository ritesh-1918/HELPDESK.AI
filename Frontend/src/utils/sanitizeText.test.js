import { sanitizeDisplayText, safeDisplayText, sanitizeSearchQuery } from './sanitizeText.js';

// sanitizeDisplayText tests
console.assert(
    sanitizeDisplayText('<script>alert(1)</script>Printer is down') === 'Printer is down',
    'Should strip script tags'
);
console.assert(
    sanitizeDisplayText('<img src=x onerror=alert(1)>Printer is down') === 'Printer is down',
    'Should strip event handlers'
);
console.assert(
    sanitizeDisplayText('Normal VPN issue < 5 minutes after login') === 'Normal VPN issue < 5 minutes after login',
    'Should preserve text with < that is not an HTML tag'
);
console.assert(
    sanitizeDisplayText(null) === '',
    'Should handle null'
);
console.assert(
    sanitizeDisplayText(undefined, 'fallback') === 'fallback',
    'Should return fallback for undefined'
);

// safeDisplayText tests
console.assert(
    safeDisplayText(null, 'N/A') === 'N/A',
    'safeDisplayText should return fallback for null'
);
console.assert(
    safeDisplayText('') === '',
    'safeDisplayText should return fallback for empty string'
);

// sanitizeSearchQuery tests
console.assert(
    sanitizeSearchQuery('(urgent') === '\\(urgent',
    'Should escape opening parenthesis'
);
console.assert(
    sanitizeSearchQuery('*critical*') === '\\*critical\\*',
    'Should escape asterisks'
);
console.assert(
    sanitizeSearchQuery('[server]') === '\\[server\\]',
    'Should escape square brackets'
);
console.assert(
    sanitizeSearchQuery('normal search') === 'normal search',
    'Should not alter normal text'
);
console.assert(
    sanitizeSearchQuery('test.regex+here') === 'test\\.regex\\+here',
    'Should escape dots and plus signs'
);
console.assert(
    sanitizeSearchQuery('what?') === 'what\\?',
    'Should escape question marks'
);
console.assert(
    sanitizeSearchQuery('price is $100') === 'price is \\$100',
    'Should escape dollar signs'
);
console.assert(
    sanitizeSearchQuery('path/to/file') === 'path/to/file',
    'Should not escape forward slashes'
);
console.assert(
    sanitizeSearchQuery(null) === '',
    'Should handle null'
);
console.assert(
    sanitizeSearchQuery(undefined) === '',
    'Should handle undefined'
);
console.assert(
    sanitizeSearchQuery('') === '',
    'Should handle empty string'
);
console.assert(
    sanitizeSearchQuery('hello\\world') === 'hello\\\\world',
    'Should escape backslashes'
);
console.assert(
    sanitizeSearchQuery('{test}') === '\\{test\\}',
    'Should escape curly braces'
);
console.assert(
    sanitizeSearchQuery('a|b') === 'a\\|b',
    'Should escape pipe character'
);

console.log('All sanitizeText tests passed ✓');
