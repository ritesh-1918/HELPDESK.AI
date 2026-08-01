import { render } from '@testing-library/react';
import axe from 'axe-core';

/**
 * Renders `ui` and runs axe-core over the rendered DOM, returning the full
 * axe results object so callers can `expect(results).toHaveNoViolations()`.
 */
export async function renderAndCheckA11y(ui, options) {
    const { container } = render(ui, options);
    const results = await axe.run(container, {
        runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
    });
    return results;
}
