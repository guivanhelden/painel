import React from 'react';
import { motion } from 'framer-motion';
import { MonthlyRankings } from './MonthlyRankings';
import { useMonthlyData } from '../hooks/useMonthlyData';
import { CounterCard } from './CounterCard';

export function EvolutionTab() {
  const { monthlyData, loading, todayData } = useMonthlyData();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="proposal-counter"
        >
          <CounterCard count={todayData?.length || 0} title="Propostas Novas" />
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="proposal-counter"
        >
          <CounterCard count={monthlyData.length} title="Propostas do Mês" />
        </motion.div>
      </div>
      <MonthlyRankings data={monthlyData} />
    </div>
  );
}