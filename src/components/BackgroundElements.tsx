import React, { useEffect, useRef } from 'react';

export function BackgroundElements() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      containerRef.current.style.setProperty('--mouse-x', `${x}`);
      containerRef.current.style.setProperty('--mouse-y', `${y}`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-grid-pattern-light [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-50 dark:opacity-20" />
      
      {/* Blurred Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] transition-colors duration-1000 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] transition-colors duration-1000 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-secondary/30 blur-[100px] transition-colors duration-1000 animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />

      {/* Moving SVGs */}
      <div className="absolute inset-0 w-full h-full">
        {/* Left Side Elements */}
        <div className="absolute top-[10%] left-[2%] sm:left-[5%] opacity-[0.03] dark:opacity-[0.1] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 30px), calc(var(--mouse-y, 0) * 30px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" transform="rotate(45 12 12)" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-[35%] left-[-2%] sm:left-[2%] opacity-[0.02] dark:opacity-[0.08] text-foreground transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -20px), calc(var(--mouse-y, 0) * -20px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 12 12 22 2 12" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-[65%] left-[4%] sm:left-[8%] opacity-[0.02] dark:opacity-[0.08] text-foreground transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 40px), calc(var(--mouse-y, 0) * 40px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" transform="rotate(45 12 12)" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-[85%] left-[-1%] sm:left-[3%] opacity-[0.02] dark:opacity-[0.09] text-foreground transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -15px), calc(var(--mouse-y, 0) * -15px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side Elements */}
        <div className="absolute top-[15%] right-[-5%] sm:right-[-2%] opacity-[0.03] dark:opacity-[0.1] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -35px), calc(var(--mouse-y, 0) * -35px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" transform="rotate(45 12 12)" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-[45%] right-[2%] sm:right-[6%] opacity-[0.02] dark:opacity-[0.08] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 25px), calc(var(--mouse-y, 0) * 25px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-[75%] right-[3%] sm:right-[7%] opacity-[0.02] dark:opacity-[0.09] text-foreground transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -45px), calc(var(--mouse-y, 0) * -45px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                <circle cx="12" cy="12" r="1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Center-ish / Scattered Elements */}
        <div className="absolute top-[5%] left-[30%] sm:left-[40%] opacity-[0.02] dark:opacity-[0.09] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 15px), calc(var(--mouse-y, 0) * 15px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" />
                <rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-[25%] right-[25%] sm:right-[35%] opacity-[0.02] dark:opacity-[0.09] text-foreground transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -25px), calc(var(--mouse-y, 0) * -25px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-[55%] left-[20%] sm:left-[25%] opacity-[0.015] dark:opacity-[0.07] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 50px), calc(var(--mouse-y, 0) * 50px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7" />
                <circle cx="12" cy="12" r="6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-[60%] right-[20%] sm:right-[25%] opacity-[0.02] dark:opacity-[0.08] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -30px), calc(var(--mouse-y, 0) * -30px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" />
                <rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-[90%] left-[35%] sm:left-[45%] opacity-[0.02] dark:opacity-[0.08] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 20px), calc(var(--mouse-y, 0) * 20px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" />
                <rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
