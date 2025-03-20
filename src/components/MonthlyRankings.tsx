import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Building2 } from 'lucide-react';
import { RankingCard } from './RankingCard';

interface MonthlyRankingsProps {
  data: any[];
}

export function MonthlyRankings({ data }: MonthlyRankingsProps) {
  const rankings = useMemo(() => {
    const supervisorCount = data.reduce((acc, item) => {
      acc[item.supervisor] = (acc[item.supervisor] || 0) + 1;
      return acc;
    }, {});

    const operadoraCount = data.reduce((acc, item) => {
      acc[item.logo_operadora] = (acc[item.logo_operadora] || 0) + 1;
      return acc;
    }, {});

    const supervisorRanking = Object.entries(supervisorCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    const operadoraRanking = Object.entries(operadoraCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    return { supervisorRanking, operadoraRanking };
  }, [data]);

  const podiumColors = {
    0: 'from-yellow-500 to-yellow-600',
    1: 'from-gray-300 to-gray-400',
    2: 'from-amber-600 to-amber-700',
    3: 'from-purple-500 to-purple-600',
    4: 'from-blue-500 to-blue-600',
  };

  const podiumHeights = {
    0: 'h-40 lg:h-48',
    1: 'h-32 lg:h-40',
    2: 'h-28 lg:h-36',
    3: 'h-24 lg:h-32',
    4: 'h-20 lg:h-28',
  };

  return (
    <div
  className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
  style={{
    maxWidth: "1200px", // Ajuste a largura máxima, se necessário
    margin: "0 auto", // Centraliza o conteúdo na tela
  }}
>
      <RankingCard
  title="Top Supervisores do Mês"
  icon={Trophy}
  iconColor="text-yellow-500"
  data={rankings.supervisorRanking}
  renderItem={([name, value], index) => (
    <motion.div
      key={name}
      initial={{ height: 0 }}
      animate={{ height: podiumHeights[index] }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="relative w-full"
    >
      <div className={`absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t ${podiumColors[index]} ${podiumHeights[index]} flex flex-col items-center justify-end p-3`}>
        <span className="text-base lg:text-lg font-medium text-white truncate w-full text-center">
          {name}
        </span>
        <span className="text-2xl lg:text-3xl font-bold text-white">{value}</span>
      </div>
    </motion.div>
  )}
/>


      <RankingCard
        title="Top Operadoras do Mês"
        icon={Building2}
        iconColor="text-blue-400"
        data={rankings.operadoraRanking}
        renderItem={([logo, value], index) => (
          <motion.div
            key={logo}
            initial={{ height: 0 }}
            animate={{ height: podiumHeights[index] }}
            transition={{ delay: 0.3 + index * 0.1 }}
            style={{
              width: "100%",
              height: "100%",
            }}
            className={`relative w-1/5`}
          >
            <div
              className={`absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t ${podiumColors[index]} ${podiumHeights[index]} flex flex-col items-center justify-end p-3`}
            >
              <img
                src={logo}
                alt="Operadora"
                className="h-10 lg:h-12 w-auto object-contain mb-2"
              />
              <span className="text-2xl lg:text-3xl font-bold text-white">{value}</span>
            </div>
          </motion.div>
        )}
      />
    </div>
  );
}
