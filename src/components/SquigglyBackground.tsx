
import React, { useEffect, useState } from 'react';

export const SquigglyBackground: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    // Verify image can be loaded
    const img = new Image();
    img.src = '/lovable-uploads/2d0b4507-e3b6-4f12-b7ec-25bf200db37f.png';
    img.onload = () => setImageLoaded(true);
    img.onerror = (e) => console.error('Error loading squiggly background:', e);
  }, []);

  return (
    <>
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-10 opacity-100"
        style={{
          backgroundImage: "url('/lovable-uploads/2d0b4507-e3b6-4f12-b7ec-25bf200db37f.png')",
          backgroundSize: "400px",
          backgroundRepeat: "repeat",
          mixBlendMode: "multiply",
        }}
        aria-hidden="true"
      />
      {!imageLoaded && (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow z-50">
          Warning: Background image not loading
        </div>
      )}
    </>
  );
};
