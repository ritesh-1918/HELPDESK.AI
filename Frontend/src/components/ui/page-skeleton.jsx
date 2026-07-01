/**
 * PageSkeleton — animated placeholder rendered by Suspense boundaries
 * while lazy-loaded route chunks are being fetched.
 *
 * Used as the `fallback` prop of every React.Suspense boundary in App.jsx.
 */

import React from 'react';

function ShimmerBlock({ className = '' }) {
  return (
    <div
      className={`bg-slate-200 rounded-xl animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

export function PageSkeleton() {
  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col"
      role="status"
      aria-label="Loading page..."
    >
      {/* Top nav bar shimmer */}
      <div className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0">
        <ShimmerBlock className="w-32 h-6" />
        <div className="flex-1" />
        <ShimmerBlock className="w-8 h-8 rounded-full" />
        <ShimmerBlock className="w-8 h-8 rounded-full" />
        <ShimmerBlock className="w-24 h-8" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar shimmer */}
        <div className="w-64 bg-white border-r border-slate-100 p-4 flex-col gap-3 hidden md:flex shrink-0">
          <ShimmerBlock className="w-full h-10 mb-4" />
          {Array.from({ length: 7 }).map((_, i) => (
            <ShimmerBlock key={i} className="w-full h-9" />
          ))}
          <div className="flex-1" />
          <ShimmerBlock className="w-full h-9" />
        </div>

        {/* Main content shimmer */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <ShimmerBlock className="w-48 h-8" />
            <ShimmerBlock className="w-32 h-10" />
          </div>

          {/* Stat cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                <ShimmerBlock className="w-24 h-4" />
                <ShimmerBlock className="w-16 h-8" />
                <ShimmerBlock className="w-32 h-3" />
              </div>
            ))}
          </div>

          {/* Content card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <ShimmerBlock className="w-40 h-5" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <ShimmerBlock className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <ShimmerBlock className="w-3/4 h-4" />
                    <ShimmerBlock className="w-1/2 h-3" />
                  </div>
                  <ShimmerBlock className="w-20 h-6 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Second content card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <ShimmerBlock className="w-32 h-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <ShimmerBlock className="w-full h-32 rounded-xl" />
                  <ShimmerBlock className="w-2/3 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only">Loading, please wait…</span>
    </div>
  );
}

export function MinimalSkeleton() {
  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center"
      role="status"
      aria-label="Loading…"
    >
      <div className="space-y-4 w-full max-w-sm px-6">
        <ShimmerBlock className="w-24 h-24 rounded-full mx-auto" />
        <ShimmerBlock className="w-full h-5" />
        <ShimmerBlock className="w-4/5 h-5 mx-auto" />
        <ShimmerBlock className="w-full h-12 rounded-xl" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default PageSkeleton;
