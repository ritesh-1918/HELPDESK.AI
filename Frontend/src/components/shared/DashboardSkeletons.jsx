import React from 'react';

const SkeletonBlock = ({ className = '', style }) => (
    <div
        className={`relative overflow-hidden bg-slate-100/90 animate-pulse ${className}`}
        style={style}
    >
    </div>
);

export const DashboardHeaderSkeleton = () => (
    <div className="space-y-3">
        <SkeletonBlock className="h-9 w-72 rounded-2xl" />
        <SkeletonBlock className="h-4 w-96 rounded-full" />
    </div>
);

export const StatCardsSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                        <SkeletonBlock className="h-3 w-28 rounded-full" />
                        <SkeletonBlock className="h-8 w-20 rounded-2xl" />
                    </div>
                    <SkeletonBlock className="h-12 w-12 rounded-2xl" />
                </div>
                <SkeletonBlock className="h-3 w-3/4 rounded-full" />
            </div>
        ))}
    </div>
);

export const DashboardPanelSkeleton = ({ titleWidth = 'w-44', rows = 4, rowHeights = ['h-4', 'h-4', 'h-4'] }) => (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        <SkeletonBlock className={`h-4 ${titleWidth} rounded-full`} />
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                    {rowHeights.map((height, idx) => (
                        <SkeletonBlock key={idx} className={`${height} flex-1 rounded-full`} />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const ChartSkeleton = ({ titleWidth = 'w-48', chartHeight = 'h-72' }) => (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        <SkeletonBlock className={`h-4 ${titleWidth} rounded-full`} />
        <SkeletonBlock className={`${chartHeight} w-full rounded-[1.5rem]`} />
    </div>
);

export const TicketTableSkeleton = ({ rows = 6 }) => (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden p-6 w-full">
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                <SkeletonBlock className="h-4 w-12 rounded-full" />
                <SkeletonBlock className="h-4 w-32 rounded-full" />
                <SkeletonBlock className="h-4 w-20 rounded-full" />
            </div>
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="flex items-center gap-6 py-2">
                    <SkeletonBlock className="h-5 w-16 rounded-md shrink-0" />
                    <SkeletonBlock className="h-5 flex-1 max-w-[300px] rounded-md" />
                    <SkeletonBlock className="h-6 w-24 rounded-md shrink-0" />
                    <SkeletonBlock className="h-6 w-20 rounded-full shrink-0" />
                    <SkeletonBlock className="h-5 w-16 rounded-md shrink-0" />
                    <SkeletonBlock className="h-8 w-24 rounded-md shrink-0 hidden sm:block" />
                </div>
            ))}
        </div>
    </div>
);

export const MyTicketsSkeleton = () => (
    <div className="space-y-6">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 flex flex-col md:flex-row gap-4">
            <SkeletonBlock className="h-10 flex-1 rounded-lg" />
            <div className="flex items-center gap-3">
                <SkeletonBlock className="h-10 w-36 rounded-lg" />
                <SkeletonBlock className="h-10 w-36 rounded-lg" />
            </div>
        </div>
        <TicketTableSkeleton rows={5} />
    </div>
);
