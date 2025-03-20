import React from 'react';
import { motion } from 'framer-motion';

export function CongratulationsMessage() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.7,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
    >
      <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4"
        >
          🎉 Parabéns Time! 🎉
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xl md:text-2xl lg:text-3xl text-white/90 text-center"
        >
          Meta alcançada com sucesso! 🚀
        </motion.p>
      </div>
    </motion.div>
  );
}