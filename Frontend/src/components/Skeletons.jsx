import React from 'react';

/**
 * Skeleton loading components for admin dashboard pages.
 * Uses Tailwind animate-pulse for smooth shimmer effect.
 * Each skeleton matches the exact layout of the real content.
 */

/** Base skeleton bar with pulse animation */
const SkelBar = ({ className = '', style = {} }) => (
  <div
    className={`bg-slate-200 rounded animate-pulse ${className}`}
    style={style}
  />
);

/** Circular skeleton (avatars, icons) */
const SkelCircle = ({ size = 40, className = '' }) => (
  <div
    className={`bg-slate-200 rounded-full animate-pulse ${className}`}
    style={{ width: size, height: size }}
  />
);

// ─── Admin Tickets Table Skeleton ────────────────────────────────────────────

export const TicketTableSkeleton = ({ rows = 8 }) => (
  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
    {/* Toolbar skeleton */}
    <div className="flex items-center justify-between p-6 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <SkelBar className="w-64 h-10" />
        <SkelBar className="w-32 h-10" />
        <SkelBar className="w-32 h-10" />
      </div>
      <SkelBar className="w-24 h-8" />
    </div>

    {/* Table header skeleton */}
    <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-3">
      <div className="grid grid-cols-7 gap-4">
        {['w-20', 'w-48', 'w-24', 'w-20', 'w-24', 'w-28', 'w-16'].map((w, i) => (
          <SkelBar key={i} className={`${w} h-3`} />
        ))}
      </div>
    </div>

    {/* Table rows skeleton */}
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="px-6 py-4 border-b border-slate-50 hover:bg-slate-50/50">
        <div className="grid grid-cols-7 gap-4 items-center">
          <SkelBar className="w-16 h-4" />
          <div className="space-y-2">
            <SkelBar className="w-40 h-4" />
            <SkelBar className="w-24 h-3" />
          </div>
          <SkelBar className="w-20 h-6 rounded-full" />
          <SkelBar className="w-16 h-4" />
          <SkelBar className="w-20 h-6 rounded-full" />
          <SkelBar className="w-24 h-4" />
          <div className="flex gap-2">
            <SkelCircle size={28} />
            <SkelCircle size={28} />
          </div>
        </div>
      </div>
    ))}

    {/* Pagination skeleton */}
    <div className="flex items-center justify-between px-6 py-4">
      <SkelBar className="w-48 h-4" />
      <div className="flex gap-2">
        <SkelBar className="w-20 h-8 rounded-lg" />
        <SkelBar className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Analytics Dashboard Skeleton ────────────────────────────────────────────

export const AnalyticsSkeleton = () => (
  <div style={{ background: '#f8faf9', minHeight: '100vh', padding: '24px' }} className="space-y-10">
    {/* Header skeleton */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-2">
        <SkelBar className="w-48 h-7" />
        <SkelBar className="w-32 h-3" />
      </div>
      <SkelBar className="w-36 h-10 rounded-xl" />
    </div>

    {/* KPI Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <SkelBar className="w-24 h-3" />
            <SkelCircle size={32} />
          </div>
          <SkelBar className="w-20 h-8" />
          <SkelBar className="w-16 h-3" />
        </div>
      ))}
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line chart skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <SkelBar className="w-40 h-5" />
        <div className="h-64 flex items-end gap-2 px-4">
          {Array.from({ length: 12 }, (_, i) => (
            <SkelBar
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${30 + Math.random() * 70}%` }}
            />
          ))}
        </div>
      </div>

      {/* Donut chart skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <SkelBar className="w-48 h-5" />
        <div className="flex items-center justify-center">
          <SkelCircle size={180} />
        </div>
        <div className="flex justify-center gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <SkelBar key={i} className="w-16 h-3" />
          ))}
        </div>
      </div>
    </div>

    {/* Bottom table skeleton */}
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <SkelBar className="w-36 h-5" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkelCircle size={36} />
          <SkelBar className="flex-1 h-4" />
          <SkelBar className="w-20 h-4" />
          <SkelBar className="w-16 h-6 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Ticket Detail Skeleton ──────────────────────────────────────────────────

export const TicketDetailSkeleton = () => (
  <div className="space-y-6 p-6 max-w-6xl mx-auto">
    {/* Breadcrumb + Back button */}
    <div className="flex items-center gap-3">
      <SkelBar className="w-20 h-4" />
      <SkelBar className="w-4 h-4" />
      <SkelBar className="w-32 h-4" />
    </div>

    {/* Header card */}
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <SkelBar className="w-72 h-6" />
          <SkelBar className="w-48 h-4" />
        </div>
        <div className="flex gap-2">
          <SkelBar className="w-24 h-8 rounded-lg" />
          <SkelBar className="w-24 h-8 rounded-lg" />
        </div>
      </div>

      {/* Status/Priority badges */}
      <div className="flex gap-3">
        <SkelBar className="w-20 h-6 rounded-full" />
        <SkelBar className="w-20 h-6 rounded-full" />
        <SkelBar className="w-28 h-6 rounded-full" />
      </div>
    </div>

    {/* Main content grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: conversation/content */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <SkelBar className="w-32 h-5" />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex gap-3">
              <SkelCircle size={36} />
              <div className="flex-1 space-y-2">
                <SkelBar className="w-24 h-3" />
                <SkelBar className={`${i === 0 ? 'w-full' : i === 1 ? 'w-3/4' : 'w-1/2'} h-4`} />
              </div>
            </div>
          ))}
        </div>

        {/* AI Summary skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <SkelCircle size={20} />
            <SkelBar className="w-32 h-4" />
          </div>
          <SkelBar className="w-full h-4" />
          <SkelBar className="w-5/6 h-4" />
          <SkelBar className="w-2/3 h-4" />
        </div>
      </div>

      {/* Right: sidebar */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <SkelBar className="w-28 h-5" />
          {['w-32', 'w-24', 'w-28', 'w-20'].map((w, i) => (
            <div key={i} className="flex justify-between">
              <SkelBar className="w-20 h-3" />
              <SkelBar className={`${w} h-3`} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <SkelBar className="w-24 h-5" />
          {Array.from({ length: 3 }, (_, i) => (
            <SkelBar key={i} className="w-full h-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default {
  TicketTableSkeleton,
  AnalyticsSkeleton,
  TicketDetailSkeleton,
};
