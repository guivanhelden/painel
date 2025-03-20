import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface CounterCardProps {
  count: number;
  title: string;
}

export function CounterCard({ count, title }: CounterCardProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = count / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setDisplayCount(Math.min(Math.round(increment * currentStep), count));
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <FileText className="w-6 h-6 text-white" />
        <h2 className="text-lg lg:text-xl font-bold text-white">{title}</h2>
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/20 rounded-full px-4 py-1"
      >
        <span className="text-xl lg:text-2xl font-bold text-white">{displayCount}</span>
      </motion.div>
    </div>
  );
}