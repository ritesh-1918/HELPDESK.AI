import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const OnboardingTour = () => {
    const [run, setRun] = useState(false);

    useEffect(() => {
        const isComplete = localStorage.getItem('emerald_onboarding_complete');
        if (!isComplete) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                setRun(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const steps = [
        {
            target: '#tour-welcome',
            content: 'Welcome to Emerald Prime. Our AI resolves most issues instantly.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '#tour-create-ticket',
            content: 'Click here to report a new issue. The AI will analyze it immediately.',
            placement: 'bottom',
        },
        {
            target: '#tour-quick-actions',
            content: 'Use these shortcuts for common problems like network or software issues.',
            placement: 'top',
        },
        {
            target: '#tour-recent-tickets',
            content: 'This is where you track the progress of your support requests.',
            placement: 'top',
        },
    ];

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem('emerald_onboarding_complete', 'true');
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            showSkipButton={true}
            disableScrolling={false}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: '#13ec92',
                    textColor: '#1e293b',
                    zIndex: 1000,
                },
                tooltipContainer: {
                    textAlign: 'left',
                    borderRadius: '1.5rem',
                    padding: '0.5rem',
                },
                buttonNext: {
                    borderRadius: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                },
                buttonBack: {
                    fontWeight: 700,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#94a3b8',
                },
                buttonSkip: {
                    fontWeight: 700,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#94a3b8',
                }
            }}
        />
    );
};

export default OnboardingTour;
