# GSSoC React Routing Optimization Reference Guide

This guide helps GSSoC contributors reduce HELPDESK.AI frontend bundle size by applying route-level code splitting with `React.lazy`, `Suspense`, and dynamic imports. Use it when adding or refactoring pages under `Frontend/src`.

## Why split routes

HELPDESK.AI ships multiple user, admin, master-admin, legal, and feature pages. Loading every page module in the initial JavaScript bundle slows first paint for users who only need one workflow. Route-level code splitting keeps the first bundle focused on shell/navigation code and downloads page code only when a route is visited.

## Recommended pattern

1. Keep shared layout, providers, auth guards, and navigation imported normally.
2. Convert heavy page-level imports to `React.lazy(() => import(...))`.
3. Wrap the routing tree or each lazy route in `Suspense` with an accessible loading state.
4. Do not lazy-load tiny shared UI primitives such as buttons, inputs, icons, or utility functions.
5. Preserve existing route paths, loader behavior, and role-based guards.

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./user/pages/Dashboard.jsx'));
const AdminTickets = lazy(() => import('./admin/pages/Tickets.jsx'));

function RouteFallback() {
  return <main aria-busy="true">Loading page...</main>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
      </Routes>
    </Suspense>
  );
}
```

## Contributor checklist

- [ ] Identify page modules that are not required for the first route render.
- [ ] Replace static page imports with `lazy(() => import('...'))`.
- [ ] Add one reusable fallback component with readable text and `aria-busy` when possible.
- [ ] Keep auth wrappers and permission checks outside lazy pages so redirects still happen quickly.
- [ ] Verify the app still builds with `npm run build` from `Frontend/`.
- [ ] Manually click at least one lazy-loaded route after starting the Vite preview or dev server.

## Common mistakes

- Lazy-loading shared components used above the router shell, which can make the whole app wait on a chunk before rendering navigation.
- Forgetting `Suspense`, which causes runtime errors when a lazy component renders.
- Moving route guards into lazy pages, which can briefly expose the wrong shell before redirecting.
- Creating many very small chunks for components that are always used together. Prefer splitting by page or feature area.

## Review notes for maintainers

A good routing optimization PR should be small and easy to inspect: mostly import changes, one fallback component, and unchanged route URLs. Bundle-size improvements are best verified with a production build and, when available, a Vite bundle visualizer report.
