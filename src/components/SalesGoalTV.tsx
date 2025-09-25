import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertCircle, Users } from 'lucide-react';
import { TeamGoalsGrid } from './TeamGoalsGrid';
import { TeamStatsSummary } from './TeamStatsSummary';
import { useSalesGoalCombined } from '../hooks/useSalesGoalCombined';

const getProgressEmoji = (percentage: number) => {
  if (percentage >= 100) return '🥳🎉';
  if (percentage >= 90) return '🤗';
  if (percentage >= 80) return '😍';
  if (percentage >= 70) return '🤩';
  if (percentage >= 60) return '😆';
  if (percentage >= 50) return '😁';
  if (percentage >= 40) return '😃';
  if (percentage >= 30) return '😊';
  if (percentage >= 20) return '😏';
  if (percentage >= 10) return '😐';
  return '😵‍💫';
};

const getEndOfMonth = () => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - today.getDate();
  
  return {
    daysRemaining,
    formattedDate: lastDay.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long'
    })
  };
};

export function SalesGoalTV() {
  const { salesGoalData, teamGoalsData, previousGoalData, loading, error } = useSalesGoalCombined();

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

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-red-400">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  if (!salesGoalData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-gray-400">
          <Target className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">Nenhum dado de meta disponível</p>
        </div>
      </div>
    );
  }

  const { daysRemaining, formattedDate } = getEndOfMonth();
  const remaining = salesGoalData.valor_meta - salesGoalData.valor_realizado;
  const remainingFormatted = remaining > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining) : '';
  const isCritical = daysRemaining <= 3 && salesGoalData.percentual_atingido < 80;

  const getColor = () => {
    if (salesGoalData.percentual_atingido >= 100) return 'text-emerald-500';
    if (salesGoalData.percentual_atingido >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMessage = () => {
    const daysText = `${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} até ${formattedDate}`;

    if (salesGoalData.percentual_atingido >= 100) {
      return {
        text: 'Parabéns! Meta Geral Atingida!',
        subText: daysText,
        icon: TrendingUp,
        color: 'text-emerald-500'
      };
    }
    if (salesGoalData.percentual_atingido >= 80) {
      return {
        text: `Estamos quase lá! ${remaining <= 100000 ? `Faltam ${remainingFormatted}` : 'Continue assim!'}`,
        subText: daysText,
        icon: Target,
        color: 'text-yellow-500'
      };
    }
    return {
      text: `Vamos acelerar! ${remaining <= 100000 ? `Potencial de ${remainingFormatted}` : 'Foco na meta!'}`,
      subText: daysText,
      icon: AlertCircle,
      color: 'text-red-500'
    };
  };

  const message = getMessage();
  const progress = (salesGoalData.percentual_atingido > 100 ? 100 : salesGoalData.percentual_atingido) / 100;

  return (
    <div className="text-white">
      <div className="max-w-[95vw] mx-auto">
        {/* Título da Seção */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-8"
        >
          <h1 className="text-2xl lg:text-4xl xl:text-5xl text-tv-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Meta de Vendas - Equipes
          </h1>
        </motion.div>

        {/* Meta Geral - Layout Otimizado para TV */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-br from-gray-900/90 to-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 xl:p-10 shadow-2xl w-full mx-auto border transition-all duration-300 mb-8 ${isCritical ? 'border-red-500/60' : 'border-purple-500/30'}`}
        >
          {/* Header da Meta Geral */}
          <div className="flex items-center justify-center gap-4 mb-6 lg:mb-8 bg-gradient-to-r from-purple-900/50 to-pink-900/30 p-4 lg:p-6 rounded-xl border border-purple-500/20 shadow-lg">
            <div className="bg-purple-500/20 p-3 lg:p-4 rounded-lg">
              <Target className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-purple-400" />
            </div>
            <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Meta Geral
            </h2>
          </div>

          {/* Gauge Principal - Otimizado para TV */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] gauge-tv performance-optimized">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  {/* Círculo de fundo */}
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="url(#gradientBg)"
                    strokeWidth="12"
                    className="opacity-30"
                  />

                  {/* Círculo de progresso */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke={`url(#gradient${salesGoalData.percentual_atingido >= 100 ? 'Success' : salesGoalData.percentual_atingido >= 80 ? 'Warning' : 'Danger'})`}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
                    transform="rotate(-90 100 100)"
                    className="filter drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                    initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progress) }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />

                  {/* Texto da porcentagem */}
                  <motion.text
                    x="100"
                    y="80"
                    textAnchor="middle"
                    className={`text-5xl lg:text-6xl xl:text-7xl font-black ${getColor()}`}
                    fill="currentColor"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    {salesGoalData.percentual_atingido.toFixed(1)}%
                  </motion.text>

                  {/* Emoji */}
                  <motion.text
                    x="100"
                    y="150"
                    textAnchor="middle"
                    className="text-4xl lg:text-5xl xl:text-6xl"
                    fill="currentColor"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    {getProgressEmoji(salesGoalData.percentual_atingido)}
                  </motion.text>

                  {/* Definições dos gradientes */}
                  <defs>
                    <linearGradient id="gradientBg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
                    </linearGradient>

                    <linearGradient id="gradientSuccess" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>

                    <linearGradient id="gradientWarning" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>

                    <linearGradient id="gradientDanger" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Informações da Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`flex-1 flex flex-col items-center gap-4 lg:gap-6 ${message.color} text-center bg-gray-900/40 p-6 lg:p-8 rounded-2xl backdrop-blur-md border border-gray-700/40 shadow-lg`}
            >
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="bg-current/20 p-4 lg:p-5 rounded-xl shadow-inner">
                  <message.icon className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12" />
                </div>
                <p className="text-xl lg:text-2xl xl:text-3xl font-bold">
                  {message.text}
                </p>
              </div>
              <p className="text-base lg:text-lg xl:text-xl opacity-80">
                {message.subText}
              </p>
              
              {/* Valores */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
                  <div className="text-sm lg:text-base text-gray-300 mb-2">Realizado</div>
                  <div className="text-lg lg:text-xl font-semibold text-white">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(salesGoalData.valor_realizado)}
                  </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
                  <div className="text-sm lg:text-base text-gray-300 mb-2">Meta</div>
                  <div className="text-lg lg:text-xl font-semibold text-white">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(salesGoalData.valor_meta)}
                  </div>
                </div>
              </div>

              {/* Comparação com mês anterior */}
              {typeof previousGoalData === 'object' && previousGoalData && (
                <div className="mt-4 w-full max-w-xs">
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 shadow-inner backdrop-blur-sm flex flex-col items-center gap-1">
                    <div className="text-sm lg:text-base text-gray-300 capitalize font-medium">
                      % Meta mês anterior ({new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })})
                    </div>
                    <div className="text-xl lg:text-2xl font-semibold text-gray-100">
                      {previousGoalData.percentual_atingido.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Seção das Equipes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-gray-900/90 to-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 xl:p-10 shadow-2xl border border-purple-500/30"
        >
          {/* Header das Equipes */}
          <div className="flex items-center justify-center gap-4 mb-6 lg:mb-8 bg-gradient-to-r from-blue-900/50 to-cyan-900/30 p-4 lg:p-6 rounded-xl border border-blue-500/20 shadow-lg">
            <div className="bg-blue-500/20 p-3 lg:p-4 rounded-lg">
              <Users className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Metas das Equipes
            </h2>
          </div>

          {/* Grid das Equipes */}
          <TeamGoalsGrid teamGoals={teamGoalsData} loading={loading} />
        </motion.div>

        {/* Resumo das Estatísticas */}
        <TeamStatsSummary 
          teamGoals={teamGoalsData} 
          generalGoal={salesGoalData ? {
            percentual_atingido: salesGoalData.percentual_atingido,
            valor_meta: salesGoalData.valor_meta,
            valor_realizado: salesGoalData.valor_realizado
          } : undefined}
        />
      </div>
    </div>
  );
}
