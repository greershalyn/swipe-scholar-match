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
 * Renders a Lucide icon with the purple-to-magenta gradient stroke.
 * Each icon carries its own gradient def so it works regardless of DOM context.
 */
let gradientIdCounter = 0;

export const GradientIcon = ({ icon: Icon, className = '' }: { icon: React.ElementType; className?: string }) => {
  const id = React.useId();
  const gradientId = `icon-grad-${id}`;

  return (
    <Icon
      className={className}
      style={{ stroke: `url(#${gradientId})` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(263 87% 55%)" />
          <stop offset="100%" stopColor="hsl(290 80% 55%)" />
        </linearGradient>
      </defs>
    </Icon>
  );
};
