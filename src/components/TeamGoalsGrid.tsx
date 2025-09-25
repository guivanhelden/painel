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
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-800/50 rounded-xl p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded"></div>
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
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 team-grid-tv gap-4 lg:gap-6">
      {teamGoals.map((team, index) => {
        const PerformanceIcon = getPerformanceIcon(team.percentual_atingido);
        const gradientClass = getPerformanceColor(team.percentual_atingido);
        const textColor = getPerformanceTextColor(team.percentual_atingido);
        
        return (
          <motion.div
            key={`${team.supervisor}-${team.ano}-${team.mes}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br from-gray-900/90 to-gray-800/60 backdrop-blur-lg rounded-xl p-4 lg:p-6 card-tv border transition-all duration-300 hover:scale-105 performance-optimized memory-optimized ${gradientClass.includes('emerald') ? 'border-emerald-500/30' : gradientClass.includes('yellow') ? 'border-yellow-500/30' : gradientClass.includes('orange') ? 'border-orange-500/30' : 'border-red-500/30'}`}
          >
            {/* Header da Equipe */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`bg-current/20 p-2 rounded-lg ${textColor}`}>
                <PerformanceIcon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <h3 className="text-sm lg:text-base font-bold text-white truncate">
                {team.supervisor}
              </h3>
            </div>

            {/* Percentual Principal */}
            <div className="text-center mb-4">
              <div className={`text-2xl lg:text-3xl xl:text-4xl font-black ${textColor}`}>
                {team.percentual_atingido.toFixed(1)}%
              </div>
              <div className="text-xs lg:text-sm text-gray-400 mt-1">
                Meta Atingida
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full bg-gray-700/50 rounded-full h-2 mb-4">
              <motion.div
                className={`h-2 rounded-full bg-gradient-to-r ${gradientClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(team.percentual_atingido, 100)}%` }}
                transition={{ duration: 1.5, delay: index * 0.1 + 0.5 }}
              />
            </div>

            {/* Valores */}
            <div className="space-y-2 text-xs lg:text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Realizado:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(team.valor_realizado)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Meta:</span>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(team.valor_meta)}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4 text-center">
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
