import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

const AIProcessingSteps = ({ steps = [], onComplete, delay = 1200, activeStep = null }) => {
  const [internalStep, setInternalStep] = useState(0);

  const currentStep = activeStep !== null ? activeStep : internalStep;

  useEffect(() => {
    if (activeStep !== null) return; // Disable internal timer if controlled externally

    if (internalStep < steps.length) {
      const timer = setTimeout(() => {
        setInternalStep((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else if (internalStep === steps.length) {
      if (onComplete) {
        const timer = setTimeout(() => {
          onComplete();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, steps.length, delay, onComplete]);

  const progressPercentage = Math.min((currentStep / steps.length) * 100, 100);

  return (
    <>
      <div className='w-full space-y-5 px-2'>
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          const isPending = currentStep < index;

          return (
            <div
              key={index}
              className={`flex items-center gap-4 transition-all duration-500 ${isPending ? 'opacity-40' : 'opacity-100'}`}
            >
              <div className='flex-shrink-0 relative flex items-center justify-center w-6 h-6'>
                {isCompleted ? (
                  <CheckCircle2 className='w-5 h-5 text-emerald-500 transition-all duration-500 scale-100' />
                ) : isActive ? (
                  <Loader2 className='w-5 h-5 text-emerald-600 animate-spin' />
                ) : (
                  <Circle className='w-5 h-5 text-gray-300' />
                )}
              </div>
              <span
                className={`text-sm font-semibold transition-colors duration-300 ${isCompleted ? 'text-gray-900' : isActive ? 'text-emerald-700' : 'text-gray-500'}`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className='w-full h-1.5 bg-gray-50 absolute bottom-0 left-0'>
        <div
          className='h-full bg-emerald-500 transition-all duration-700 ease-out'
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </>
  );
};

export default AIProcessingSteps;
