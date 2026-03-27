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
        
        {/* Crescent Moon */}
        <div className="absolute top-[15%] left-[5%] opacity-[0.03] dark:opacity-[0.1] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 30px), calc(var(--mouse-y, 0) * 30px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Diamond */}
        <div className="absolute top-[40%] left-[8%] opacity-[0.02] dark:opacity-[0.08] text-foreground transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -20px), calc(var(--mouse-y, 0) * -20px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 12 12 22 2 12" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Crescent Moon */}
        <div className="absolute top-[75%] left-[4%] opacity-[0.02] dark:opacity-[0.09] text-foreground transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -15px), calc(var(--mouse-y, 0) * -15px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                <circle cx="12" cy="12" r="1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side Elements */}
        {/* Hexagon */}
        <div className="absolute top-[20%] right-[5%] opacity-[0.03] dark:opacity-[0.1] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -35px), calc(var(--mouse-y, 0) * -35px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Circle */}
        <div className="absolute top-[55%] right-[8%] opacity-[0.02] dark:opacity-[0.08] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 25px), calc(var(--mouse-y, 0) * 25px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Crescent Moon */}
        <div className="absolute top-[80%] right-[6%] opacity-[0.02] dark:opacity-[0.09] text-foreground transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -45px), calc(var(--mouse-y, 0) * -45px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Center-ish / Scattered Elements */}
        {/* Hexagon */}
        <div className="absolute top-[10%] left-[35%] opacity-[0.02] dark:opacity-[0.09] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 15px), calc(var(--mouse-y, 0) * 15px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Diamond */}
        <div className="absolute top-[30%] right-[30%] opacity-[0.02] dark:opacity-[0.09] text-foreground transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * -25px), calc(var(--mouse-y, 0) * -25px))' }}>
          <div className="animate-float-reverse">
            <div className="animate-spin-slow-reverse">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 12 12 22 2 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* Circle */}
        <div className="absolute top-[65%] left-[25%] opacity-[0.015] dark:opacity-[0.07] text-primary transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--mouse-x, 0) * 50px), calc(var(--mouse-y, 0) * 50px))' }}>
          <div className="animate-float">
            <div className="animate-spin-slow">
              <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
