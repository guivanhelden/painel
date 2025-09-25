import { useState, useEffect } from 'react';

export function ResolutionDebug() {
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateResolution = () => {
      setResolution({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateResolution();
    window.addEventListener('resize', updateResolution);

    return () => {
      window.removeEventListener('resize', updateResolution);
    };
  }, []);

  // Mostrar debug apenas em produção e se for TV (Full HD+)
  useEffect(() => {
    const isProduction = import.meta.env.PROD;
    const isTV = window.innerWidth >= 1920;
    setIsVisible(isProduction && isTV);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-3 rounded-lg text-sm z-50 border border-gray-600">
      <div className="font-bold text-green-400 mb-1">TV Debug</div>
      <div>Resolução: {resolution.width}x{resolution.height}</div>
      <div>Densidade: {window.devicePixelRatio}x</div>
      <div>User Agent: {navigator.userAgent.includes('TV') ? 'TV' : 'Desktop'}</div>
      <div className="text-xs text-gray-400 mt-1">
        Clique para ocultar
      </div>
    </div>
  );
}
