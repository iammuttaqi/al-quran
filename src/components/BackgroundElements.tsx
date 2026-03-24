import React from 'react';

export function BackgroundElements() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-grid-pattern-light [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-50 dark:opacity-20" />
      
      {/* Blurred Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] transition-colors duration-1000 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] transition-colors duration-1000 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-secondary/30 blur-[100px] transition-colors duration-1000 animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />

      {/* Moving SVGs */}
      <div className="absolute top-[15%] left-[10%] opacity-[0.03] dark:opacity-[0.05] text-primary animate-float">
        <div className="animate-spin-slow">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" transform="rotate(45 12 12)" />
          </svg>
        </div>
      </div>

      <div className="absolute top-[60%] right-[10%] opacity-[0.03] dark:opacity-[0.05] text-primary animate-float-reverse">
        <div className="animate-spin-slow-reverse">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" transform="rotate(45 12 12)" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
      </div>

      <div className="absolute top-[80%] left-[20%] opacity-[0.02] dark:opacity-[0.04] text-foreground animate-float">
        <div className="animate-spin-slow">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>
      </div>

      <div className="absolute top-[20%] right-[25%] opacity-[0.02] dark:opacity-[0.04] text-foreground animate-float-reverse">
        <div className="animate-spin-slow-reverse">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
        </div>
      </div>

      <div className="absolute top-[40%] left-[80%] opacity-[0.02] dark:opacity-[0.03] text-primary animate-float">
        <div className="animate-spin-slow">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
        </div>
      </div>

      <div className="absolute top-[70%] left-[5%] opacity-[0.02] dark:opacity-[0.03] text-foreground animate-float-reverse">
        <div className="animate-spin-slow-reverse">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" transform="rotate(45 12 12)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
