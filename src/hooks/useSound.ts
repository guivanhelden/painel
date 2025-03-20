import { useCallback } from 'react';

export function useSound() {
  const playSound = useCallback((type: 'success' | 'progress' | 'warning') => {
    const audio = new Audio();
    
    switch (type) {
      case 'success':
        audio.src = 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'; // Success sound
        break;
      case 'progress':
        audio.src = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'; // Progress sound
        break;
      case 'warning':
        audio.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // Alert sound
        break;
    }
    
    audio.volume = 0.8; // Reduz o volume para 30%
    audio.play().catch(error => console.log('Audio playback failed:', error));
  }, []);

  return { playSound };
}