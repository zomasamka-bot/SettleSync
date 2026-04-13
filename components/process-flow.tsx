'use client';

interface ProcessFlowProps {
  currentStep: 'data-entry' | 'review' | 'execution' | 'receipt';
}

export function ProcessFlow({ currentStep }: ProcessFlowProps) {
  const steps = [
    { id: 'data-entry', label: 'Data Entry', icon: '📝' },
    { id: 'review', label: 'Review', icon: '✓' },
    { id: 'execution', label: 'Execution', icon: '⚡' },
    { id: 'receipt', label: 'Receipt', icon: '✓' },
  ];

  const stepOrder = ['data-entry', 'review', 'execution', 'receipt'] as const;
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = stepOrder.indexOf(step.id as any) === currentIndex;
          const isCompleted = stepOrder.indexOf(step.id as any) < currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                      : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>
                <p
                  className={`text-xs mt-2 text-center font-medium ${
                    isActive || isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-1 rounded-full transition-all ${
                    isCompleted ? 'bg-green-600' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
