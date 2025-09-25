import { motion } from 'framer-motion';
import { Target, AlertCircle } from 'lucide-react';
import { SalesGoalGauge } from './SalesGoalGauge';
import { useSalesGoal } from '../hooks/useSalesGoal';

interface SalesGoalTVFallbackProps {
  onGoalAchieved: (show: boolean) => void;
}

export function SalesGoalTVFallback({ onGoalAchieved }: SalesGoalTVFallbackProps) {
  const { salesGoalData, previousGoalData, loading } = useSalesGoal();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"
        />
      </div>
    );
  }

  if (!salesGoalData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">Nenhum dado de meta disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="max-w-[95vw] mx-auto">
        {/* Título da Seção */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-8"
        >
          <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Meta de Vendas
          </h1>
        </motion.div>

        {/* Aviso sobre equipes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-900/50 to-orange-900/30 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-yellow-500/30 shadow-xl"
        >
          <div className="flex items-center gap-4 text-center">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Target className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-yellow-400 mb-2">
                Dados das Equipes Indisponíveis
              </h2>
              <p className="text-gray-300">
                Exibindo apenas a meta geral. Os dados das equipes serão carregados quando disponíveis.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Meta Geral */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <SalesGoalGauge
            percentageAchieved={salesGoalData.percentual_atingido}
            totalGoal={salesGoalData.valor_meta}
            currentValue={salesGoalData.valor_realizado}
            previousPercentage={previousGoalData?.percentual_atingido}
            onGoalAchieved={onGoalAchieved}
          />
        </motion.div>
      </div>
    </div>
  );
}
