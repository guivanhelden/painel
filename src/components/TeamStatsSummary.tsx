import { motion } from 'framer-motion';
import { TrendingUp, Target, Users, Award } from 'lucide-react';

interface TeamGoalData {
  supervisor: string;
  ano: number;
  mes: number;
  percentual_atingido: number;
  valor_meta: number;
  valor_realizado: number;
  equipe_id?: string;
}

interface TeamStatsSummaryProps {
  teamGoals: TeamGoalData[];
  generalGoal?: {
    percentual_atingido: number;
    valor_meta: number;
    valor_realizado: number;
  };
}

export function TeamStatsSummary({ teamGoals, generalGoal }: TeamStatsSummaryProps) {
  if (teamGoals.length === 0) return null;

  // Calcular estatísticas
  const totalTeams = teamGoals.length;
  const teamsAtGoal = teamGoals.filter(team => team.percentual_atingido >= 100).length;
  const teamsNearGoal = teamGoals.filter(team => team.percentual_atingido >= 80 && team.percentual_atingido < 100).length;
  const teamsBelowGoal = teamGoals.filter(team => team.percentual_atingido < 80).length;
  
  const averagePercentage = teamGoals.reduce((sum, team) => sum + team.percentual_atingido, 0) / totalTeams;
  const bestTeam = teamGoals.reduce((best, team) => 
    team.percentual_atingido > best.percentual_atingido ? team : best
  );
  
  const totalTeamGoal = teamGoals.reduce((sum, team) => sum + team.valor_meta, 0);
  const totalTeamAchieved = teamGoals.reduce((sum, team) => sum + team.valor_realizado, 0);
  const teamGoalPercentage = totalTeamGoal > 0 ? (totalTeamAchieved / totalTeamGoal) * 100 : 0;

  const stats = [
    {
      icon: Award,
      label: 'Equipes na Meta',
      value: teamsAtGoal,
      total: totalTeams,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30'
    },
    {
      icon: Target,
      label: 'Quase Lá',
      value: teamsNearGoal,
      total: totalTeams,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      icon: TrendingUp,
      label: 'Média Geral',
      value: averagePercentage.toFixed(1),
      suffix: '%',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      icon: Users,
      label: 'Melhor Equipe',
      value: bestTeam.supervisor,
      subtitle: `${bestTeam.percentual_atingido.toFixed(1)}%`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gradient-to-br from-gray-900/90 to-gray-800/60 backdrop-blur-lg rounded-2xl p-6 lg:p-8 border border-gray-700/40 shadow-xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-500/20 p-3 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-white">
          Resumo das Equipes
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-4 text-center`}
          >
            <div className={`${stat.color} mb-2`}>
              <stat.icon className="w-6 h-6 mx-auto" />
            </div>
            <div className="text-sm lg:text-base text-gray-300 mb-1">
              {stat.label}
            </div>
            <div className={`text-lg lg:text-xl font-bold ${stat.color}`}>
              {stat.value}{stat.suffix || ''}
              {stat.total && (
                <span className="text-gray-400 text-sm">
                  /{stat.total}
                </span>
              )}
            </div>
            {stat.subtitle && (
              <div className="text-xs text-gray-400 mt-1">
                {stat.subtitle}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Comparação com meta geral */}
      {generalGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Comparação: Equipes vs Meta Geral
              </h4>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Equipes: </span>
                  <span className="text-blue-400 font-semibold">
                    {teamGoalPercentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Geral: </span>
                  <span className="text-purple-400 font-semibold">
                    {generalGoal.percentual_atingido.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Diferença: </span>
                  <span className={`font-semibold ${
                    teamGoalPercentage > generalGoal.percentual_atingido 
                      ? 'text-emerald-400' 
                      : 'text-red-400'
                  }`}>
                    {teamGoalPercentage > generalGoal.percentual_atingido ? '+' : ''}
                    {(teamGoalPercentage - generalGoal.percentual_atingido).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
