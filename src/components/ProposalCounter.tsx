import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { CounterCard } from './CounterCard';

interface ProposalCounterProps {
  count: number;
  data: any[];
}

export function ProposalCounter({ count, data }: ProposalCounterProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="proposal-counter max-w-[200px]"
    >
      <CounterCard count={count} />
    </motion.div>
  );
}