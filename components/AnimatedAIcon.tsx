import React from 'react';

interface AnimatedAIconProps {
  className?: string;
  size?: 'large' | 'small';
}

export const AnimatedAIcon: React.FC<AnimatedAIconProps> = ({ className = '', size = 'large' }) => {
  const sizeClasses = size === 'large' ? 'w-24 h-24' : 'w-10 h-10';
  const strokeWidth = size === 'large' ? 1.5 : 2;

  return (
    <div className={`relative ${sizeClasses} ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0">
        {/* Central pulsating node */}
        <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-amber-400 dark:text-amber-500 opacity-50" />
        <circle cx="50" cy="50" r="12" fill="currentColor" className="text-amber-500 dark:text-amber-400 animate-pulse-main" />

        {/* Outer nodes */}
        <circle cx="20" cy="25" r="5" fill="currentColor" className="text-amber-500 dark:text-amber-400 animate-pulse-outer" style={{ animationDelay: '0.2s' }} />
        <circle cx="80" cy="25" r="5" fill="currentColor" className="text-teal-500 dark:text-teal-400 animate-pulse-outer" style={{ animationDelay: '0.4s' }} />
        <circle cx="20" cy="75" r="5" fill="currentColor" className="text-orange-400 dark:text-orange-300 animate-pulse-outer" style={{ animationDelay: '0.6s' }} />
        <circle cx="80" cy="75" r="5" fill="currentColor" className="text-amber-600 dark:text-amber-500 animate-pulse-outer" style={{ animationDelay: '0.8s' }} />
        <circle cx="50" cy="10" r="5" fill="currentColor" className="text-teal-400 dark:text-teal-300 animate-pulse-outer" style={{ animationDelay: '1s' }} />
        <circle cx="50" cy="90" r="5" fill="currentColor" className="text-cyan-500 dark:text-cyan-400 animate-pulse-outer" style={{ animationDelay: '1.2s' }} />

        {/* Connecting lines with animation */}
        <path d="M50 50 L20 25" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="4 4" fill="none" className="text-slate-400 dark:text-slate-600 animate-flow" />
        <path d="M50 50 L80 25" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="4 4" fill="none" className="text-slate-400 dark:text-slate-600 animate-flow" style={{ animationDelay: '0.2s' }} />
        <path d="M50 50 L20 75" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="4 4" fill="none" className="text-slate-400 dark:text-slate-600 animate-flow" style={{ animationDelay: '0.4s' }} />
        <path d="M50 50 L80 75" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="4 4" fill="none" className="text-slate-400 dark:text-slate-600 animate-flow" style={{ animationDelay: '0.6s' }} />
        <path d="M50 50 L50 10" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="4 4" fill="none" className="text-slate-400 dark:text-slate-600 animate-flow" style={{ animationDelay: '0.8s' }} />
        <path d="M50 50 L50 90" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="4 4" fill="none" className="text-slate-400 dark:text-slate-600 animate-flow" style={{ animationDelay: '1s' }} />
      </svg>

      <style>{`
        @keyframes pulse-main {
          0%, 100% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .animate-pulse-main {
          animation: pulse-main 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transform-origin: 50% 50%;
        }

        @keyframes pulse-outer {
          0%, 100% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .animate-pulse-outer {
          animation: pulse-outer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transform-origin: 50% 50%;
        }
        
        @keyframes flow {
            to {
                stroke-dashoffset: -16;
            }
        }
        .animate-flow {
            animation: flow 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};
