import React, { useState, useCallback } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';

const TOUR_KEY = 'userTourCompleted';

const steps = [
    {
        target: '#tour-welcome-card',
        title: 'Welcome to Emerald Prime 👋',
        content: 'This is your personal support hub. From here you can track all your tickets and access AI-powered help.',
        placement: 'bottom',
        disableBeacon: true,
    },
    {
        target: '#tour-report-btn',
        title: 'Report a New Issue',
        content: 'Click here to submit a new support ticket. Our AI will triage it instantly—most issues are resolved in minutes.',
        placement: 'bottom',
        disableBeacon: true,
    },
    {
        target: '#tour-quick-actions',
        title: 'Quick Actions',
        content: 'Jump straight to the most common issue types. Each tile routes your problem to the right team automatically.',
        placement: 'top',
        disableBeacon: true,
    },
    {
        target: '#tour-recent-tickets',
        title: 'Your Recent Tickets',
        content: 'Keep tabs on all your open and resolved tickets in real-time. Click any row to view the full conversation thread.',
        placement: 'top',
        disableBeacon: true,
    },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function EmeraldTooltip({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    tooltipProps,
    size,
}) {
    return (
        <div
            {...tooltipProps}
            className="bg-white rounded-2xl shadow-2xl shadow-emerald-900/10 border border-gray-100 p-6 max-w-xs w-72 font-sans"
        >
            {/* Step counter pill */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Step {index + 1} of {size}
                </span>
                <button
                    {...skipProps}
                    className="text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    title="Skip tour"
                >
                    Skip
                </button>
            </div>

            {/* Title */}
            <h3 className="text-base font-black text-gray-900 mb-2 leading-tight">
                {step.title}
            </h3>

            {/* Body */}
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-5">
                {step.content}
            </p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-5">
                {Array.from({ length: size }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === index
                                ? 'w-5 bg-emerald-600'
                                : i < index
                                    ? 'w-1.5 bg-emerald-300'
                                    : 'w-1.5 bg-gray-200'
                            }`}
                    />
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {index > 0 && (
                    <button
                        {...backProps}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Back
                    </button>
                )}
                {continuous ? (
                    <button
                        {...primaryProps}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all active:scale-95 shadow-sm shadow-emerald-600/20"
                    >
                        {index === size - 1 ? "Got it 🎉" : "Next →"}
                    </button>
                ) : (
                    <button
                        {...closeProps}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all active:scale-95"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
const UserTour = () => {
    const [run, setRun] = useState(() => {
        return localStorage.getItem(TOUR_KEY) !== 'true';
    });

    const handleCallback = useCallback((data) => {
        const { action, status, type } = data;

        const isFinished = status === STATUS.FINISHED;
        const isSkipped = status === STATUS.SKIPPED;
        const isClosed = action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER;

        if (isFinished || isSkipped || isClosed) {
            localStorage.setItem(TOUR_KEY, 'true');
            setRun(false);
        }
    }, []);

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            scrollToFirstStep
            scrollOffset={80}
            tooltipComponent={EmeraldTooltip}
            callback={handleCallback}
            floaterProps={{ disableAnimation: false }}
            styles={{
                options: {
                    arrowColor: '#ffffff',
                    overlayColor: 'rgba(15, 23, 42, 0.45)',
                    zIndex: 9999,
                },
                spotlight: {
                    borderRadius: '16px',
                },
            }}
        />
    );
};

export default UserTour;
