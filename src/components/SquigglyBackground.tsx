
import React from 'react';

export const SquigglyBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40"  // Increased from 0.20 to 0.40
      style={{
        backgroundImage: "url('/lovable-uploads/2d0b4507-e3b6-4f12-b7ec-25bf200db37f.png')",
        backgroundSize: "400px",
        backgroundRepeat: "repeat",
        mixBlendMode: "overlay",
      }}
      aria-hidden="true"
    />
  );
};
