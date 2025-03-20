import React from 'react';
import { motion } from 'framer-motion';

export function Fireworks() {
  const fireworkCount = 20;
  const colors = ['#FFA07A', '#98FB98', '#87CEFA', '#DDA0DD', '#F0E68C', '#FFB6C1', '#FF69B4', '#00CED1', '#FFD700'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: fireworkCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            left: `${Math.random() * 100}%`,
            bottom: '-10px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: colors[i % colors.length],
            boxShadow: `0 0 8px ${colors[i % colors.length]}`
          }}
          animate={{
            y: [0, -(window.innerHeight * (0.5 + Math.random() * 0.5))],
            x: [0, (Math.random() * 400 - 200)],
            scale: [1, 0],
            opacity: [1, 0]
          }}
          transition={{
            duration: 1.5 + Math.random() * 1.5,
            ease: [0.42, 0, 0.58, 1],
            repeat: Infinity,
            delay: i * 0.1,
            repeatDelay: Math.random() * 0.5
          }}
        />
      ))}
      
      {Array.from({ length: fireworkCount * 2 }).map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute"
          initial={{
            left: `${Math.random() * 100}%`,
            bottom: '-5px',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            backgroundColor: colors[i % colors.length],
            boxShadow: `0 0 4px ${colors[i % colors.length]}`
          }}
          animate={{
            y: [0, -(window.innerHeight * (0.3 + Math.random() * 0.4))],
            x: [0, (Math.random() * 300 - 150)],
            scale: [1, 0],
            opacity: [1, 0]
          }}
          transition={{
            duration: 1 + Math.random(),
            ease: [0.42, 0, 0.58, 1],
            repeat: Infinity,
            delay: i * 0.05,
            repeatDelay: Math.random() * 0.3
          }}
        />
      ))}
    </div>
  );
}