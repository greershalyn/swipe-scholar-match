import React from 'react';

/**
 * Hidden SVG that defines the gradient used by icons across the app.
 * Place once near the root of the app (e.g., in App.tsx).
 */
export const SvgGradientDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(263 87% 55%)" />
        <stop offset="100%" stopColor="hsl(290 80% 55%)" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Renders a Lucide icon with a purple gradient color.
 * Falls back to solid primary color which always works.
 */
export const GradientIcon = ({ icon: Icon, className = '' }: { icon: React.ElementType; className?: string }) => (
  <Icon className={`${className} text-primary`} />
);
