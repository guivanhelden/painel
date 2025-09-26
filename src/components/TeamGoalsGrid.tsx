import { motion } from 'framer-motion';
import { Users, TrendingUp, Target } from 'lucide-react';

interface TeamGoalData {
  supervisor: string;
  ano: number;
  mes: number;
  percentual_atingido: number;
  valor_meta: number;
  valor_realizado: number;
  equipe_id?: string;
  equipe?: string;
}

interface TeamGoalsGridProps {
  teamGoals: TeamGoalData[];
  loading?: boolean;
}

const getPerformanceColor = (percentage: number) => {
  if (percentage >= 100) return 'from-emerald-500 to-green-600';
  if (percentage >= 80) return 'from-yellow-500 to-orange-500';
  if (percentage >= 60) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-red-700';
};

const getPerformanceTextColor = (percentage: number) => {
  if (percentage >= 100) return 'text-emerald-400';
  if (percentage >= 80) return 'text-yellow-400';
  if (percentage >= 60) return 'text-orange-400';
  return 'text-red-400';
};

const getPerformanceIcon = (percentage: number) => {
  if (percentage >= 100) return TrendingUp;
  if (percentage >= 80) return Target;
  return Users;
};

export function TeamGoalsGrid({ teamGoals, loading = false }: TeamGoalsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4 max-h-80 overflow-y-auto">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-800/50 rounded-lg p-3 animate-pulse"
          >
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-6 bg-gray-700 rounded mb-2"></div>
            <div className="h-1 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (teamGoals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Nenhuma equipe encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 team-grid-tv gap-3 lg:gap-4 max-h-80 overflow-y-auto">
      {teamGoals.map((team, index) => {
        const PerformanceIcon = getPerformanceIcon(team.percentual_atingido);
        const gradientClass = getPerformanceColor(team.percentual_atingido);
        const textColor = getPerformanceTextColor(team.percentual_atingido);
        
        return (
          <motion.div
            key={`${team.supervisor || team.equipe || 'unknown'}-${team.ano}-${team.mes}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br from-gray-900/90 to-gray-800/60 backdrop-blur-lg rounded-lg p-3 card-tv border transition-all duration-300 hover:scale-105 performance-optimized memory-optimized ${gradientClass.includes('emerald') ? 'border-emerald-500/30' : gradientClass.includes('yellow') ? 'border-yellow-500/30' : gradientClass.includes('orange') ? 'border-orange-500/30' : 'border-red-500/30'}`}
          >
            {/* Header da Equipe */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`bg-current/20 p-1.5 rounded ${textColor}`}>
                <PerformanceIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white truncate">
                {team.supervisor || team.equipe || 'Equipe Sem Nome'}
              </h3>
            </div>

            {/* Percentual Principal */}
            <div className="text-center mb-3">
              <div className={`text-2xl font-black ${textColor}`}>
                {team.percentual_atingido.toFixed(1)}%
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3">
              <motion.div
                className={`h-2 rounded-full bg-gradient-to-r ${gradientClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(team.percentual_atingido, 100)}%` }}
                transition={{ duration: 1.5, delay: index * 0.1 + 0.5 }}
              />
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${textColor} bg-current/10`}>
                {team.percentual_atingido >= 100 ? 'Meta Atingida!' : 
                 team.percentual_atingido >= 80 ? 'Quase lá!' : 
                 team.percentual_atingido >= 60 ? 'Em andamento' : 'Precisa acelerar'}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
