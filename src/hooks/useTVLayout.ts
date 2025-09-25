import { useState, useEffect } from 'react';

export function useTVLayout() {
  const [isTVLayout, setIsTVLayout] = useState(false);

  useEffect(() => {
    const checkTVLayout = () => {
      // Detectar se é uma TV baseado na resolução e user agent
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Critérios para detectar TV:
      // 1. Resolução Full HD ou maior (1920x1080+)
      // 2. User agent contém "tv" ou "android tv"
      // 3. Proporção de tela típica de TV (16:9)
      const isFullHDOrLarger = width >= 1920;
      const isTVUserAgent = userAgent.includes('tv') || userAgent.includes('android tv');
      const isTVRatio = Math.abs((width / height) - (16/9)) < 0.1; // Tolerância para 16:9
      
      setIsTVLayout(isFullHDOrLarger || isTVUserAgent || isTVRatio);
    };

    checkTVLayout();
    
    // Escutar mudanças de resolução
    window.addEventListener('resize', checkTVLayout);
    
    return () => {
      window.removeEventListener('resize', checkTVLayout);
    };
  }, []);

  return isTVLayout;
}
