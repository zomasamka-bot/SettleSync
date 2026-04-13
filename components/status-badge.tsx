'use client';

type StatusType = 'ready' | 'pending' | 'paid' | 'confirmed' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    ready: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-900',
      text: 'text-blue-700 dark:text-blue-300',
      icon: '◯',
    },
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900',
      text: 'text-amber-700 dark:text-amber-300',
      icon: '⟳',
    },
    paid: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-900',
      text: 'text-green-700 dark:text-green-300',
      icon: '✓',
    },
    confirmed: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-900',
      text: 'text-blue-700 dark:text-blue-300',
      icon: '✓',
    },
    completed: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-900',
      text: 'text-green-700 dark:text-green-300',
      icon: '✓',
    },
    failed: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-900',
      text: 'text-red-700 dark:text-red-300',
      icon: '✗',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const currentConfig = config[status];
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div
      className={`rounded-lg border font-semibold inline-flex items-center gap-2 ${currentConfig.bg} ${currentConfig.border} ${currentConfig.text} ${sizeClasses[size]}`}
    >
      <span>{currentConfig.icon}</span>
      <span>{statusLabel}</span>
    </div>
  );
}
