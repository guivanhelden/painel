import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface CriticalAlertProps {
  daysRemaining: number;
  percentageAchieved: number;
  remainingFormatted: string;
  formattedDate: string;
}

export function CriticalAlert({
  daysRemaining,
  percentageAchieved,
  remainingFormatted,
  formattedDate,
}: CriticalAlertProps) {
  const daysText = `${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} até ${formattedDate}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-900/70 via-rose-900/60 to-red-900/70 p-3 lg:p-4 shadow-2xl"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-2xl"
        style={{ boxShadow: '0 0 80px 20px rgba(239, 68, 68, 0.15)' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="relative flex flex-col items-center justify-center text-center gap-3 lg:gap-4"
      >
        <div className="rounded-2xl bg-red-500/20 p-3 lg:p-4">
          <AlertCircle className="h-9 w-9 lg:h-12 lg:w-12 text-red-400" />
        </div>
        <p className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-red-300 tracking-tight">
          Atenção: Risco de não bater a meta
        </p>
        <p className="text-base lg:text-lg xl:text-xl text-red-200/90">
          Faltam {daysText}. Estamos em {percentageAchieved.toFixed(1)}%.
          {remainingFormatted && (
            <>
              {' '}Faltam {remainingFormatted} para alcançar a meta.
            </>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}


