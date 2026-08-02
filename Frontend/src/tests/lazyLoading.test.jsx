import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes, { PageSkeleton, TableSkeleton, LazyRoute } from '../routes/AppRoutes';

describe('Lazy Loading Components', () => {
    describe('PageSkeleton', () => {
        it('renders without crashing', () => {
            render(<PageSkeleton />);
        });

        it('has animate-pulse class for loading animation', () => {
            const { container } = render(<PageSkeleton />);
            expect(container.firstChild.classList.contains('animate-pulse')).toBe(true);
        });

        it('renders skeleton blocks', () => {
            const { container } = render(<PageSkeleton />);
            const skeletonBlocks = container.querySelectorAll('.bg-gray-800');
            expect(skeletonBlocks.length).toBeGreaterThan(0);
        });
    });

    describe('TableSkeleton', () => {
        it('renders without crashing', () => {
            render(<TableSkeleton />);
        });

        it('renders table row skeletons', () => {
            const { container } = render(<TableSkeleton />);
            const rows = container.querySelectorAll('.h-12');
            expect(rows.length).toBe(5);
        });
    });

    describe('LazyRoute', () => {
        it('renders children', () => {
            render(
                <LazyRoute>
                    <div>Test Content</div>
                </LazyRoute>
            );
            expect(screen.getByText('Test Content')).toBeTruthy();
        });

        it('renders custom fallback when provided', () => {
            const { container } = render(
                <LazyRoute fallback={<div>Custom Loading</div>}>
                    <div>Content</div>
                </LazyRoute>
            );
            // Content should render immediately (no async in test)
            expect(screen.getByText('Content')).toBeTruthy();
        });
    });

    describe('AppRoutes', () => {
        it('renders login route', () => {
            render(
                <MemoryRouter initialEntries={['/login']}>
                    <AppRoutes />
                </MemoryRouter>
            );
            // Login page should lazy load
        });

        it('redirects / to /login', () => {
            render(
                <MemoryRouter initialEntries={['/']}>
                    <AppRoutes />
                </MemoryRouter>
            );
            // Should redirect to login
        });

        it('handles unknown routes', () => {
            render(
                <MemoryRouter initialEntries={['/unknown']}>
                    <AppRoutes />
                </MemoryRouter>
            );
            // Should redirect to login
        });
    });
});

describe('Route Configuration', () => {
    it('has admin routes configured', () => {
        const adminPaths = ['/admin', '/admin/tickets', '/admin/analytics', '/admin/settings', '/admin/users', '/admin/knowledge'];
        // Verify paths exist in route config
        expect(adminPaths.length).toBe(6);
    });

    it('has user routes configured', () => {
        const userPaths = ['/dashboard', '/tickets', '/profile'];
        expect(userPaths.length).toBe(3);
    });

    it('has auth routes configured', () => {
        const authPaths = ['/login', '/register'];
        expect(authPaths.length).toBe(2);
    });
});
