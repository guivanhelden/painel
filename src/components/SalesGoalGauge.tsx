import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { CongratulationsMessage } from './CongratulationsMessage';
import { CriticalAlert } from './CriticalAlert';

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

interface SalesGoalGaugeProps {
  percentageAchieved: number;
  totalGoal: number;
  currentValue: number;
  onGoalAchieved?: (show: boolean) => void;
  previousPercentage?: number;
}

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

export function SalesGoalGauge({ 
  percentageAchieved, 
  totalGoal, 
  currentValue,
  onGoalAchieved,
  previousPercentage
}: SalesGoalGaugeProps) {
  const { playSound } = useSound();
  const [displayValue, setDisplayValue] = useState(0);
  const warningPlayedRef = useRef(false);

  const { daysRemaining, formattedDate } = getEndOfMonth();
  const remaining = totalGoal - currentValue;
  const remainingFormatted = remaining > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining) : '';
  const isCritical = daysRemaining <= 3 && percentageAchieved < 80;

  useEffect(() => {
    if (percentageAchieved >= 100) {
      // Primeiro toca o som
      playSound('success');
      
      // Delay para os fogos
      const fireworksTimer = setTimeout(() => {
        onGoalAchieved?.(true);
      }, 2000); // 2 segundos após a animação do gauge

      // Timer para remover os fogos
      const removeTimer = setTimeout(() => {
        onGoalAchieved?.(false);
      }, 10000); // 10 segundos no total

      return () => {
        clearTimeout(fireworksTimer);
        clearTimeout(removeTimer);
      };
    } else {
      onGoalAchieved?.(false);
    }
  }, [percentageAchieved, onGoalAchieved, playSound]);

  // Alerta sonoro quando entrar em estado crítico
  useEffect(() => {
    if (isCritical && !warningPlayedRef.current) {
      playSound('warning');
      warningPlayedRef.current = true;
    }
  }, [isCritical, playSound]);

  // Efeito para animar o número
  useEffect(() => {
    const duration = 2000; // 2 segundos
    const steps = 60; // 60 frames
    const stepDuration = duration / steps;
    const increment = percentageAchieved / steps;
    let current = 0;
    let frame = 0;

    const timer = setInterval(() => {
      current += increment;
      frame++;
      
      if (frame === steps) {
        current = percentageAchieved;
        clearInterval(timer);
      }
      
      setDisplayValue(current);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [percentageAchieved]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getColor = () => {
    if (percentageAchieved >= 100) return 'text-emerald-500';
    if (percentageAchieved >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMessage = () => {
    const remaining = totalGoal - currentValue;
    const { daysRemaining, formattedDate } = getEndOfMonth();
    const daysText = `${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} até ${formattedDate}`;

    if (percentageAchieved >= 100) {
      return {
        text: 'Parabéns! Meta alcançada!',
        subText: daysText,
        icon: TrendingUp,
        color: 'text-emerald-500'
      };
    }
    if (percentageAchieved >= 80) {
      return {
        text: `Estamos quase lá! ${remaining <= 100000 ? `Faltam ${formatCurrency(remaining)}` : 'Continue assim!'}`,
        subText: daysText,
        icon: Target,
        color: 'text-yellow-500'
      };
    }
    return {
      text: `Vamos acelerar! ${remaining <= 100000 ? `Potencial de ${formatCurrency(remaining)}` : 'Foco na meta!'}`,
      subText: daysText,
      icon: AlertCircle,
      color: 'text-red-500'
    };
  };

  const message = getMessage();
  const progress = (percentageAchieved > 100 ? 100 : percentageAchieved) / 100;

  return (
    <motion.div
      className={`bg-gradient-to-br from-gray-900/90 to-gray-800/60 backdrop-blur-lg rounded-3xl p-5 lg:p-6 xl:p-8 shadow-2xl w-full max-w-3xl lg:max-w-5xl xl:max-w-7xl mx-auto border transition-all duration-300 ${isCritical ? 'border-red-500/60' : 'border-purple-500/30 hover:border-purple-500/50'}`}
      animate={isCritical ? { boxShadow: ['0 0 0px rgba(0,0,0,0)','0 0 40px rgba(239,68,68,0.35)','0 0 0px rgba(0,0,0,0)'] } : {}}
      transition={isCritical ? { duration: 1.6, repeat: Infinity } : {}}
    >
      {isCritical && (
        <div className="mb-4 lg:mb-6">
          <CriticalAlert
            daysRemaining={daysRemaining}
            percentageAchieved={percentageAchieved}
            remainingFormatted={remainingFormatted}
            formattedDate={formattedDate}
          />
        </div>
      )}
      <div className="flex items-center gap-4 mb-4 lg:mb-6 xl:mb-8 bg-gradient-to-r from-purple-900/50 to-pink-900/30 p-4 lg:p-6 rounded-xl border border-purple-500/20 shadow-lg">
        <div className="bg-purple-500/20 p-3 lg:p-4 rounded-lg">
          <Target className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-purple-400" />
        </div>
        <h3 className="text-2xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Meta de Vendas
        </h3>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 xl:gap-12">
        <div className="flex-1 w-full lg:w-auto flex justify-center">
          <div className="flex items-center gap-4">
            <motion.div
              className="relative w-64 h-64 lg:w-80 lg:h-80 xl:w-[28rem] xl:h-[28rem] transform hover:scale-105 transition-all duration-500 ease-out"
              animate={isCritical ? { scale: [1, 1.02, 1], rotate: [0, -0.4, 0.4, 0] } : {}}
              transition={isCritical ? { duration: 1.8, repeat: Infinity } : {}}
            >
            {isCritical && (
              <motion.div
                aria-hidden
                className="absolute -inset-4 rounded-full"
                style={{ boxShadow: '0 0 120px 20px rgba(239, 68, 68, 0.18)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
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
                stroke={`url(#gradient${percentageAchieved >= 100 ? 'Success' : percentageAchieved >= 80 ? 'Warning' : 'Danger'})`}
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
                filter="url(#neonGlow)"
                initial={{ opacity: 0, y: 20 }}
                animate={isCritical ? { opacity: [1, 0.7, 1], scale: [1, 1.04, 1] } : { opacity: 1, y: 0 }}
                transition={isCritical ? { duration: 1.2, repeat: Infinity } : { delay: 0.5, duration: 1 }}
              >
                {displayValue.toFixed(1)}%
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
                {getProgressEmoji(percentageAchieved)}
              </motion.text>

              {/* Definições dos gradientes */}
              <defs>
                <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
                </linearGradient>

                <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(168,85,247,0.4)" />
                  <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                </radialGradient>

                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feFlood floodColor="rgba(168,85,247,0.5)" result="flood" />
                  <feComposite in="flood" in2="SourceGraphic" operator="in" result="mask" />
                  <feGaussianBlur in="mask" stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Gradientes existentes com animação */}
                <linearGradient id="gradientSuccess" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#059669">
                    <animate attributeName="stopColor" values="#059669;#10b981;#059669" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#10b981">
                    <animate attributeName="stopColor" values="#10b981;#059669;#10b981" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>

                <linearGradient id="gradientWarning" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706">
                    <animate attributeName="stopColor" values="#d97706;#fbbf24;#d97706" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#fbbf24">
                    <animate attributeName="stopColor" values="#fbbf24;#d97706;#fbbf24" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>

                <linearGradient id="gradientDanger" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626">
                    <animate attributeName="stopColor" values="#dc2626;#ef4444;#dc2626" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#ef4444">
                    <animate attributeName="stopColor" values="#ef4444;#dc2626;#ef4444" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`flex-1 flex flex-col items-center gap-3 lg:gap-4 xl:gap-5 ${message.color} text-center bg-gray-900/40 p-3 lg:p-5 xl:p-6 rounded-2xl backdrop-blur-md border border-gray-700/40 hover:border-gray-600/50 transition-all duration-300 shadow-lg`}
        >
          <div className="flex items-center gap-3 lg:gap-4 xl:gap-5">
            <div className="bg-current/20 p-3 lg:p-4 rounded-xl shadow-inner">
              <message.icon className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12" />
            </div>
            <p className="text-2xl lg:text-3xl xl:text-4xl font-bold">
              {message.text}
            </p>
          </div>
          <p className="text-base lg:text-lg xl:text-xl opacity-80">
            {message.subText}
          </p>
          {typeof previousPercentage === 'number' && (
            <div className="mt-3 lg:mt-4 xl:mt-5 w-full flex justify-center">
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 lg:px-5 lg:py-4 shadow-inner backdrop-blur-sm max-w-xs w-full flex flex-col items-center gap-1">
                <div className="text-sm lg:text-base xl:text-lg text-gray-300 capitalize font-medium">
                  % Meta mês anterior ({new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })})
                </div>
                <div className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-100">
                  {previousPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {percentageAchieved >= 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1 }}
        >
          <CongratulationsMessage />
        </motion.div>
      )}
    </motion.div>
  );
}