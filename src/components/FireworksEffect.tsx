import React from 'react';
import { Fireworks } from '@fireworks-js/react'

interface FireworksEffectProps {
  enabled: boolean;
}

export function FireworksEffect({ enabled }: FireworksEffectProps) {
  return (
    <>
      {enabled && (
        <Fireworks
          options={{
            rocketsPoint: {
              min: 0,
              max: 100
            },
            speed: 15,
            acceleration: 1.05,
            friction: 0.95,
            gravity: 1.5,
            particles: 150,
            trace: 3,
            explosion: 8,
            autoresize: true,
            brightness: {
              min: 50,
              max: 80,
              decay: {
                min: 0.015,
                max: 0.03
              }
            },
            random: true,
            delay: {
              min: 30,
              max: 60
            },
            mouse: {
              click: false,
              move: false,
              max: 3
            },
            hue: {
              min: 0,
              max: 360
            },
            boundaries: {
              x: 50,
              y: 50,
              width: window.innerWidth,
              height: window.innerHeight,
              visible: false
            }
          }}
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            position: 'fixed',
            background: 'transparent',
            zIndex: 9999
          }}
        />
      )}
    </>
  );
} 