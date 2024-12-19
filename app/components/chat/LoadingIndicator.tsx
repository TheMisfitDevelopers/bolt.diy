import { useState, useEffect } from 'react';

const LOADING_STEPS = [
  'Initializing WebContainer...',
  'Setting up project environment...',
  'Installing dependencies...',
  'Configuring development server...',
  'Starting application...',
];

export function LoadingIndicator() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep < LOADING_STEPS.length) {
        setCurrentStep((current) => {
          setCompletedSteps((prev) => [...prev, current]);
          return current + 1;
        });
      } else {
        clearInterval(timer);
      }
    }, 1000); // Advance every second

    return () => clearInterval(timer);
  }, [currentStep]);

  return (
    <div className="space-y-2 p-4 text-bolt-elements-textSecondary">
      {LOADING_STEPS.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <span className={`i-ph:${completedSteps.includes(index as never) ? 'check-circle-fill' : 'circle'}`} />
          <span className={completedSteps.includes(index as never) ? 'text-bolt-elements-textPrimary' : ''}>
            {step}
          </span>
          {currentStep === index && !completedSteps.includes(index as never) && (
            <span className="i-svg-spinners:3-dots-fade ml-2" />
          )}
        </div>
      ))}
    </div>
  );
}
