 
import { motion } from 'framer-motion';
import { SalesGoalGauge } from './SalesGoalGauge';
import { SalesGoalTV } from './SalesGoalTV';
import { SalesGoalTVFallback } from './SalesGoalTVFallback';
import { useSalesGoal } from '../hooks/useSalesGoal';
import { useSalesGoalCombined } from '../hooks/useSalesGoalCombined';
import { useTVLayout } from '../hooks/useTVLayout';

interface SalesGoalTabProps {
  onGoalAchieved: (show: boolean) => void;
}

export function SalesGoalTab({ onGoalAchieved }: SalesGoalTabProps) {
  const { salesGoalData, previousGoalData, loading } = useSalesGoal();
  const { teamGoalsData, loading: teamLoading } = useSalesGoalCombined();
  const isTVLayout = useTVLayout();


  if (loading || teamLoading) {
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

  if (!salesGoalData) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        Nenhum dado de meta disponível.
      </div>
    );
  }

  // Usar layout otimizado para TV
  if (isTVLayout) {
    if (teamGoalsData.length > 0) {
      return <SalesGoalTV />;
    } else {
      return <SalesGoalTVFallback onGoalAchieved={onGoalAchieved} />;
    }
  }

  // Layout original para desktop/mobile
  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)] xl:h-[calc(100vh-14rem)] py-4 lg:py-6 xl:py-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl"
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
  );
}