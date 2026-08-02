import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

afterEach(() => {
    cleanup();
});

// axe-core probes <canvas> while inspecting icon ligatures; jsdom has no canvas
// implementation and would otherwise emit "Not implemented" noise to stderr.
if (typeof HTMLCanvasElement !== 'undefined') {
    const noopContext = new Proxy({}, {
        get: () => () => ({ width: 0, height: 0, data: [], length: 0 }),
    });
    HTMLCanvasElement.prototype.getContext = () => noopContext;
}

expect.extend({
    toHaveNoViolations(results) {
        const violations = results?.violations || [];
        if (violations.length === 0) {
            return {
                pass: true,
                message: () => 'Expected accessibility violations, but none were found.',
            };
        }
        const detail = violations
            .map((v) => `  - [${v.impact}] ${v.help} (${v.nodes.length} node(s))`)
            .join('\n');
        return {
            pass: false,
            message: () =>
                `Found ${violations.length} accessibility violation(s):\n${detail}`,
        };
    },
});
