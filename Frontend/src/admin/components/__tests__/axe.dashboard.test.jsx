import React from 'react';
import { describe, it, expect } from 'vitest';
import { Layers, Target } from 'lucide-react';
import StatCard from '../StatCard';
import SLABadge from '../SLABadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { renderAndCheckA11y } from '../../../test/axe';

const DashboardTemplate = () => (
    <main aria-label="Support operations dashboard">
        <header>
            <h1>Support Operations</h1>
            <p>Live overview of your organization&apos;s ticket pipeline.</p>
        </header>

        <section aria-label="Key metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Tickets" value={128} subtitle="Lifetime generated" icon={Layers} color="slate" />
            <StatCard label="AI Accuracy" value="96%" subtitle="Correct auto-classifications" icon={Target} color="emerald" />
        </section>

        <section aria-label="Open tickets" className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Open Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <table aria-describedby="tickets-table-caption">
                        <caption id="tickets-table-caption" className="sr-only">
                            List of open tickets with their priority and SLA status
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col">Ticket</th>
                                <th scope="col">Priority</th>
                                <th scope="col">SLA</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>HD-1001</td>
                                <td>High</td>
                                <td>
                                    <SLABadge priority="high" createdAt={new Date().toISOString()} status="open" compact />
                                </td>
                            </tr>
                            <tr>
                                <td>HD-1002</td>
                                <td>Medium</td>
                                <td>
                                    <SLABadge priority="medium" createdAt={new Date().toISOString()} status="open" compact />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </section>

        <footer>
            <p>Data refreshed just now.</p>
        </footer>
    </main>
);

describe('dashboard accessibility (axe-core)', () => {
    it('renders the dashboard template with zero WCAG A/AA violations', async () => {
        const results = await renderAndCheckA11y(<DashboardTemplate />);
        expect(results).toHaveNoViolations();
    });

    it('detects violations when an image is missing an accessible name', async () => {
        const results = await renderAndCheckA11y(
            <main aria-label="broken">
                <img src="graph.png" />
                <button />
            </main>
        );
        expect(results.violations.length).toBeGreaterThan(0);
        const ids = results.violations.map((v) => v.id);
        expect(ids).toContain('image-alt');
        expect(ids).toContain('button-name');
    });
});
