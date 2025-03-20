import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface RankingCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  data: [string, number][];
  renderItem: (item: [string, number], index: number) => React.ReactNode;
}

export function RankingCard({ title, icon: Icon, iconColor, data, renderItem }: RankingCardProps) {
  const podiumHeights = {
    0: 'h-40 lg:h-48',
    1: 'h-32 lg:h-40',
    2: 'h-28 lg:h-36',
    3: 'h-24 lg:h-32',
    4: 'h-20 lg:h-28'
  };

  return (
    <motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 0.1 }}
  className="bg-gray-900/50 rounded-lg p-6 shadow-xl flex-grow"
  style={{
    minWidth: "300px",
    maxWidth: "600px",
  }}
>
      <div className="flex items-center gap-3 mb-6">
        <Icon className={`w-7 h-7 ${iconColor}`} />
        <h3 className="text-2xl lg:text-3xl font-semibold text-white">{title}</h3>
      </div>
      <div className="flex items-end justify-around h-48 lg:h-56 gap-3">
        {data.map((item, index) => renderItem(item, index))}
      </div>
    </motion.div>
  );
}