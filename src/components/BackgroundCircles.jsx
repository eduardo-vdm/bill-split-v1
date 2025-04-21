import React from 'react';

export default function BackgroundCircles() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Left half circle */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[66.67vw] aspect-square bg-primary-500/20 dark:bg-primary-500/10"
        style={{
          clipPath: 'circle(50% at 0% 50%)'
        }}
      />
      
      {/* Right half circle */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[66.67vw] aspect-square bg-secondary-500/20 dark:bg-secondary-500/10"
        style={{
          clipPath: 'circle(50% at 100% 50%)'
        }}
      />
    </div>
  );
} 